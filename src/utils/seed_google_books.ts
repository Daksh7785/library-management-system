import { supabase } from '../lib/supabase';


/**
 * Utility to fetch books from Google Books API and seed them into the specified library tenant.
 * Used for the "Massive Database Integration" requirement.
 */
export const seedGoogleBooks = async (libraryId: string, query: string, maxResults: number = 40): Promise<number> => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn("No books found for query:", query);
      return 0;
    }

    const booksToInsert = data.items.map((item: any) => {
      const vol = item.volumeInfo;
      return {
        library_id: libraryId,
        title: vol.title || 'Unknown Title',
        author: vol.authors ? vol.authors.join(', ') : 'Unknown Author',
        cover_url: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover',
        category: vol.categories ? vol.categories[0] : 'General',
        rating: vol.averageRating || (Math.random() * 2 + 3).toFixed(1), // synthesize if missing
        reviews_count: vol.ratingsCount || Math.floor(Math.random() * 500),
        published_year: vol.publishedDate ? parseInt(vol.publishedDate.substring(0, 4)) : 2000,
        pages: vol.pageCount || 200,
        language: vol.language || 'en',
        synopsis: vol.description || 'No description available.',
        location: `Aisle ${Math.floor(Math.random() * 20 + 1)}`,
        publisher: vol.publisher || 'Independent',
        available: Math.floor(Math.random() * 5) + 1,
        // SaaS Metrics (Book DNA defaults)
        total_reads: Math.floor(Math.random() * 100),
        avg_read_time_days: (Math.random() * 10 + 3).toFixed(2)
      };
    });

    const { error } = await supabase.from('books').insert(booksToInsert);
    
    if (error) {
      console.error("Error inserting seeded books:", error);
      return 0;
    }

    return booksToInsert.length;
  } catch (error) {
    console.error("Failed to seed Google Books:", error);
    return 0;
  }
};
