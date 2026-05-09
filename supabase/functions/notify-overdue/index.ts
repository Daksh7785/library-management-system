import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    if (!resendApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch overdue transactions
    const { data: overdueTransactions, error } = await supabase
      .from('transactions')
      .select('id, user_id, book_id, due_at, profiles!inner(email, full_name), books!inner(title)')
      .lt('due_at', new Date().toISOString())
      .is('returned_at', null);

    if (error) throw error;

    for (const transaction of overdueTransactions || []) {
      const daysOverdue = Math.floor((new Date().getTime() - new Date(transaction.due_at).getTime()) / (1000 * 3600 * 24));
      
      let tone = "friendly";
      if (daysOverdue >= 4 && daysOverdue <= 7) tone = "firm";
      else if (daysOverdue > 7) tone = "penalty";

      let subject = "";
      let body = "";

      if (tone === "friendly") {
        subject = `Reminder: "${transaction.books.title}" is overdue`;
        body = `Hi ${transaction.profiles.full_name},\n\nJust a friendly reminder that your borrowed book "${transaction.books.title}" was due on ${new Date(transaction.due_at).toLocaleDateString()}. Please return it to the library soon.\n\nThanks,\nLibrary Team`;
      } else if (tone === "firm") {
        subject = `Notice: "${transaction.books.title}" is ${daysOverdue} days overdue`;
        body = `Dear ${transaction.profiles.full_name},\n\nThe book "${transaction.books.title}" is now ${daysOverdue} days overdue. Please return it immediately to avoid further fines.\n\nThank you,\nLibrary Team`;
      } else {
        subject = `URGENT: "${transaction.books.title}" is significantly overdue`;
        body = `Dear ${transaction.profiles.full_name},\n\nYour borrowed book "${transaction.books.title}" is heavily overdue. Your account is incurring fines. Please return it to avoid account suspension.\n\nLibrary Team`;
      }

      // Update fine
      const newFine = daysOverdue * 2;
      await supabase.from('transactions').update({ overdue_fine: newFine }).eq('id', transaction.id);

      // Send email via Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Library <library@resend.dev>', // Use a verified domain or resend.dev for testing
          to: transaction.profiles.email,
          subject: subject,
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`
        })
      });
    }

    return new Response(JSON.stringify({ success: true, count: overdueTransactions?.length || 0 }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
