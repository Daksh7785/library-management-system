const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

/**
 * Scheduled Job: Daily Fine Calculation
 * Runs every day at 00:00 to detect overdue books and increment fines.
 */
exports.dailyFineCalculation = functions.pubsub
  .schedule("0 0 * * *")
  .onRun(async (context) => {
    const today = admin.firestore.Timestamp.now();
    const overdueQuery = db.collection("transactions")
      .where("status", "==", "issued")
      .where("dueDate", "<", today);

    const snapshot = await overdueQuery.get();

    if (snapshot.empty) {
      console.log("No overdue books found today.");
      return null;
    }

    const batch = db.batch();
    const dailyFineRate = 0.50; // $0.50 per day

    snapshot.forEach((doc) => {
      const data = doc.data();
      const dueDate = data.dueDate.toDate();
      const diffTime = Math.abs(today.toDate() - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const newFine = diffDays * dailyFineRate;

      batch.update(doc.ref, {
        fine: newFine,
        status: "overdue",
      });

      // Send Notification logic (FCM)
      // This is a placeholder for actual FCM tokens
      console.log(`Alert: Transaction ${doc.id} is overdue by ${diffDays} days. Fine: $${newFine}`);
    });

    await batch.commit();
    console.log(`Processed ${snapshot.size} overdue transactions.`);
  });

/**
 * Trigger: On New Book Added
 * Automatically add tags or notify followers when a new book is added.
 */
exports.onBookAdded = functions.firestore
  .document("books/{bookId}")
  .onCreate((snap, context) => {
    const newValue = snap.data();
    console.log(`New book added: ${newValue.title} by ${newValue.author}`);
    
    // Logic for Firebase Cloud Messaging (FCM) could go here
    return null;
  });

/**
 * HTTPS Function: Process Return (Server Side)
 * If you want more security for returning books instead of client-side logic.
 */
exports.processReturn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required.");
  }

  const { transactionId } = data;
  const transRef = db.collection("transactions").doc(transactionId);
  const transSnap = await transRef.get();

  if (!transSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Transaction not found.");
  }

  const transData = transSnap.data();
  
  // Verify ownership or admin role
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const isAdmin = userDoc.data().role === "admin";

  if (transData.userId !== context.auth.uid && !isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized.");
  }

  // Atomic Update
  const bookRef = db.collection("books").doc(transData.bookId);
  const userRef = db.collection("users").doc(transData.userId);

  await db.runTransaction(async (t) => {
    t.update(transRef, { 
      status: "returned", 
      returned: true, 
      returnDate: admin.firestore.Timestamp.now() 
    });
    t.update(bookRef, { available: admin.firestore.FieldValue.increment(1) });
    t.update(userRef, { borrowedCount: admin.firestore.FieldValue.increment(-1) });
  });

  return { success: true };
});
