import { mockBooks } from './mockData';
import type { Book, BookCopy, CopyQR, CopyTimelineEvent } from '../types';

export const seedDatabase = async () => {
  try {
    const libraryId = '1';
    const userId = '1';

    const booksToInsert: Book[] = mockBooks.map((b) => ({
      ...b,
      id: Math.random().toString(36).substr(2, 9),
      libraryId
    }));

    const copies: BookCopy[] = [];
    const qrs: CopyQR[] = [];
    const timeline: CopyTimelineEvent[] = [];


    const notes = [
      "Found this on a rainy afternoon. Changed my life.",
      "The margins are filled with my thoughts. Hope you enjoy them.",
      "Left this at a cafe. Glad someone found it!",
      "Best read for a long journey.",
      "The cover is a bit worn, but the story is timeless."
    ];

    booksToInsert.forEach(book => {
      const copyCount = Math.floor(Math.random() * 3) + 1; // 1-3 copies
      for (let i = 0; i < copyCount; i++) {
        const copyId = Math.random().toString(36).substr(2, 9);
        const copy: BookCopy = {
          id: copyId,
          bookId: book.id,
          libraryId,
          status: 'available',
          condition: 'Good',
          conditionScore: 100,
          rescueCount: 0,
          totalReaders: 0,
          createdAt: new Date().toISOString()
        };
        copies.push(copy);

        // Generate QR
        const token = Math.random().toString(36).substr(2, 12).toUpperCase();
        qrs.push({
          id: Math.random().toString(36).substr(2, 9),
          bookCopyId: copyId,
          qrToken: token,
          stickerPrinted: Math.random() > 0.3,
          createdAt: new Date().toISOString()
        });

        // Generate 3-8 events
        const eventCount = Math.floor(Math.random() * 6) + 3;
        for (let j = 0; j < eventCount; j++) {
          timeline.push({
            id: Math.random().toString(36).substr(2, 9),
            libraryId,
            bookCopyId: copyId,
            userId,
            eventType: 'CHECK_IN',
            note: notes[Math.floor(Math.random() * notes.length)],
            isAnonymous: Math.random() > 0.8,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
          });
        }
      }
    });
    
    localStorage.setItem('mock_books', JSON.stringify(booksToInsert));
    localStorage.setItem('mock_book_copies', JSON.stringify(copies));
    localStorage.setItem('mock_copy_qr', JSON.stringify(qrs));
    localStorage.setItem('mock_copy_timeline', JSON.stringify(timeline));

    console.log('Database seeded successfully in localStorage with AcademicOS Core data!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
