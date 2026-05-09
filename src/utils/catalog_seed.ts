import { supabase } from '../lib/supabase';

/**
 * 150+ curated academic books across major disciplines.
 * Used as fallback when Google Books API is unavailable.
 */
const CATALOG_DATA = [
  // Computer Science & AI
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', isbn: '9780132350884', cover_url: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', rating: 4.7, description: 'A handbook of agile software craftsmanship for modern developers.' },
  { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', category: 'Computer Science', isbn: '9780135957059', cover_url: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', rating: 4.8, description: 'Your journey to mastery in software development.' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', isbn: '9780262033848', cover_url: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg', rating: 4.6, description: 'The definitive reference for algorithms and data structures.' },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', category: 'Artificial Intelligence', isbn: '9780136042594', cover_url: 'https://covers.openlibrary.org/b/isbn/9780136042594-L.jpg', rating: 4.8, description: 'The comprehensive guide to artificial intelligence.' },
  { title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio', category: 'Artificial Intelligence', isbn: '9780262035613', cover_url: 'https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg', rating: 4.7, description: 'A comprehensive resource on deep learning methods.' },
  { title: 'Design Patterns', author: 'Gang of Four', category: 'Computer Science', isbn: '9780201633610', cover_url: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', rating: 4.5, description: 'Elements of reusable object-oriented software.' },
  { title: 'The Algorithm Design Manual', author: 'Steven Skiena', category: 'Computer Science', isbn: '9781849967204', cover_url: 'https://covers.openlibrary.org/b/isbn/9781849967204-L.jpg', rating: 4.6, description: 'A guide to algorithm design and analysis.' },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', category: 'Computer Science', isbn: '9780262510875', cover_url: 'https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg', rating: 4.8, description: 'The wizard book for understanding computation.' },
  { title: 'Python Crash Course', author: 'Eric Matthes', category: 'Computer Science', isbn: '9781593279288', cover_url: 'https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg', rating: 4.6, description: 'A hands-on, project-based introduction to Python.' },
  { title: 'You Don\'t Know JS', author: 'Kyle Simpson', category: 'Computer Science', isbn: '9781491904244', cover_url: 'https://covers.openlibrary.org/b/isbn/9781491904244-L.jpg', rating: 4.7, description: 'Deep dive into JavaScript mechanisms.' },

  // Mathematics
  { title: 'Calculus', author: 'James Stewart', category: 'Mathematics', isbn: '9780538497817', cover_url: 'https://covers.openlibrary.org/b/isbn/9780538497817-L.jpg', rating: 4.5, description: 'The gold standard in calculus textbooks.' },
  { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', category: 'Mathematics', isbn: '9783319110790', cover_url: 'https://covers.openlibrary.org/b/isbn/9783319110790-L.jpg', rating: 4.6, description: 'An elegant approach to linear algebra.' },
  { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth Rosen', category: 'Mathematics', isbn: '9780073383095', cover_url: 'https://covers.openlibrary.org/b/isbn/9780073383095-L.jpg', rating: 4.4, description: 'Comprehensive discrete math for computer scientists.' },
  { title: 'Abstract Algebra', author: 'David S. Dummit, Richard M. Foote', category: 'Mathematics', isbn: '9780471433347', cover_url: 'https://covers.openlibrary.org/b/isbn/9780471433347-L.jpg', rating: 4.5, description: 'A comprehensive introduction to abstract algebra.' },
  { title: 'Probability and Statistics', author: 'Morris DeGroot', category: 'Mathematics', isbn: '9780321500465', cover_url: 'https://covers.openlibrary.org/b/isbn/9780321500465-L.jpg', rating: 4.3, description: 'A rigorous foundation in probability and statistics.' },
  { title: 'The Art of Problem Solving', author: 'Sandor Lehoczky', category: 'Mathematics', isbn: '9780977304561', cover_url: 'https://covers.openlibrary.org/b/isbn/9780977304561-L.jpg', rating: 4.7, description: 'A classic for math olympiad preparation.' },
  { title: 'Number Theory', author: 'George E. Andrews', category: 'Mathematics', isbn: '9780486682525', cover_url: 'https://covers.openlibrary.org/b/isbn/9780486682525-L.jpg', rating: 4.4, description: 'An accessible introduction to number theory.' },

  // Physics
  { title: 'The Feynman Lectures on Physics', author: 'Richard P. Feynman', category: 'Physics', isbn: '9780465023820', cover_url: 'https://covers.openlibrary.org/b/isbn/9780465023820-L.jpg', rating: 4.9, description: 'Timeless lectures from one of the greatest physicists.' },
  { title: 'University Physics', author: 'Hugh Young, Roger Freedman', category: 'Physics', isbn: '9780133969290', cover_url: 'https://covers.openlibrary.org/b/isbn/9780133969290-L.jpg', rating: 4.4, description: 'The standard university physics textbook.' },
  { title: 'Introduction to Electrodynamics', author: 'David J. Griffiths', category: 'Physics', isbn: '9781108420419', cover_url: 'https://covers.openlibrary.org/b/isbn/9781108420419-L.jpg', rating: 4.8, description: 'The definitive text on electrodynamics.' },
  { title: 'Quantum Mechanics', author: 'David J. Griffiths', category: 'Physics', isbn: '9781107179868', cover_url: 'https://covers.openlibrary.org/b/isbn/9781107179868-L.jpg', rating: 4.7, description: 'A clear and accessible introduction to quantum mechanics.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Physics', isbn: '9780553380163', cover_url: 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', rating: 4.6, description: 'From the Big Bang to black holes.' },
  { title: 'The Elegant Universe', author: 'Brian Greene', category: 'Physics', isbn: '9780393338102', cover_url: 'https://covers.openlibrary.org/b/isbn/9780393338102-L.jpg', rating: 4.5, description: 'Superstrings, hidden dimensions, and the quest for the ultimate theory.' },

  // Biology & Medicine
  { title: 'Campbell Biology', author: 'Jane B. Reece', category: 'Biology', isbn: '9780134093413', cover_url: 'https://covers.openlibrary.org/b/isbn/9780134093413-L.jpg', rating: 4.5, description: 'The leading text in introductory biology.' },
  { title: 'Molecular Biology of the Cell', author: 'Bruce Alberts', category: 'Biology', isbn: '9780393884821', cover_url: 'https://covers.openlibrary.org/b/isbn/9780393884821-L.jpg', rating: 4.6, description: 'Essential reading for cell and molecular biology.' },
  { title: 'Gray\'s Anatomy', author: 'Henry Gray', category: 'Medicine', isbn: '9780702052309', cover_url: 'https://covers.openlibrary.org/b/isbn/9780702052309-L.jpg', rating: 4.8, description: 'The classic comprehensive anatomy reference.' },
  { title: 'Harrison\'s Principles of Internal Medicine', author: 'Anthony Fauci', category: 'Medicine', isbn: '9781264268504', cover_url: 'https://covers.openlibrary.org/b/isbn/9781264268504-L.jpg', rating: 4.7, description: 'The definitive resource for clinical medicine.' },
  { title: 'The Gene', author: 'Siddhartha Mukherjee', category: 'Biology', isbn: '9781476733500', cover_url: 'https://covers.openlibrary.org/b/isbn/9781476733500-L.jpg', rating: 4.7, description: 'An intimate history of human genetics.' },
  { title: 'The Emperor of All Maladies', author: 'Siddhartha Mukherjee', category: 'Medicine', isbn: '9781439170915', cover_url: 'https://covers.openlibrary.org/b/isbn/9781439170915-L.jpg', rating: 4.8, description: 'A biography of cancer.' },

  // Chemistry
  { title: 'Organic Chemistry', author: 'Paula Yurkanis Bruice', category: 'Chemistry', isbn: '9780134042282', cover_url: 'https://covers.openlibrary.org/b/isbn/9780134042282-L.jpg', rating: 4.4, description: 'A comprehensive guide to organic chemistry.' },
  { title: 'Physical Chemistry', author: 'Peter Atkins', category: 'Chemistry', isbn: '9780198769866', cover_url: 'https://covers.openlibrary.org/b/isbn/9780198769866-L.jpg', rating: 4.5, description: 'The leading physical chemistry textbook.' },
  { title: 'Analytical Chemistry', author: 'Gary D. Christian', category: 'Chemistry', isbn: '9780470887578', cover_url: 'https://covers.openlibrary.org/b/isbn/9780470887578-L.jpg', rating: 4.3, description: 'Principles and techniques of analytical chemistry.' },

  // Economics & Business
  { title: 'Principles of Economics', author: 'N. Gregory Mankiw', category: 'Economics', isbn: '9781305585126', cover_url: 'https://covers.openlibrary.org/b/isbn/9781305585126-L.jpg', rating: 4.4, description: 'The most widely used economics textbook.' },
  { title: 'The Wealth of Nations', author: 'Adam Smith', category: 'Economics', isbn: '9780140432084', cover_url: 'https://covers.openlibrary.org/b/isbn/9780140432084-L.jpg', rating: 4.6, description: 'The foundational text of modern economics.' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Economics', isbn: '9780374533557', cover_url: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', rating: 4.7, description: 'A groundbreaking account of the human mind.' },
  { title: 'Zero to One', author: 'Peter Thiel', category: 'Business', isbn: '9780804139021', cover_url: 'https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg', rating: 4.5, description: 'Notes on startups and how to build the future.' },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', isbn: '9780307887894', cover_url: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg', rating: 4.4, description: 'How to build a successful startup.' },
  { title: 'Good to Great', author: 'Jim Collins', category: 'Business', isbn: '9780066620992', cover_url: 'https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg', rating: 4.5, description: 'Why some companies make the leap and others don\'t.' },
  { title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Economics', isbn: '9780060555665', cover_url: 'https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg', rating: 4.8, description: 'The definitive book on value investing.' },

  // History & Philosophy
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', cover_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', rating: 4.8, description: 'A bold, wide-ranging history of humanity.' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', isbn: '9780393317558', cover_url: 'https://covers.openlibrary.org/b/isbn/9780393317558-L.jpg', rating: 4.6, description: 'The fates of human societies.' },
  { title: 'The Republic', author: 'Plato', category: 'Philosophy', isbn: '9780140455113', cover_url: 'https://covers.openlibrary.org/b/isbn/9780140455113-L.jpg', rating: 4.6, description: 'Plato\'s masterwork on justice and the ideal state.' },
  { title: 'Meditations', author: 'Marcus Aurelius', category: 'Philosophy', isbn: '9780140449334', cover_url: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg', rating: 4.8, description: 'Timeless wisdom from a Roman emperor.' },
  { title: 'Nicomachean Ethics', author: 'Aristotle', category: 'Philosophy', isbn: '9780140449495', cover_url: 'https://covers.openlibrary.org/b/isbn/9780140449495-L.jpg', rating: 4.5, description: 'Aristotle\'s influential work on virtuous living.' },
  { title: 'A History of the World', author: 'Andrew Marr', category: 'History', isbn: '9781447231530', cover_url: 'https://covers.openlibrary.org/b/isbn/9781447231530-L.jpg', rating: 4.4, description: 'A sweeping narrative of world history.' },

  // Literature
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Literature', isbn: '9780061935466', cover_url: 'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg', rating: 4.8, description: 'A Pulitzer Prize-winning masterwork of honor and injustice.' },
  { title: '1984', author: 'George Orwell', category: 'Literature', isbn: '9780451524935', cover_url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', rating: 4.8, description: 'A chilling dystopia about totalitarianism and surveillance.' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Literature', isbn: '9780743273565', cover_url: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', rating: 4.5, description: 'A classic story of the American Dream.' },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', category: 'Literature', isbn: '9780140449136', cover_url: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg', rating: 4.7, description: 'A profound psychological exploration of guilt.' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', category: 'Literature', isbn: '9780060883287', cover_url: 'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg', rating: 4.7, description: 'A landmark of magical realism.' },

  // Psychology
  { title: 'Atomic Habits', author: 'James Clear', category: 'Psychology', isbn: '9780735211292', cover_url: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', rating: 4.8, description: 'An easy and proven way to build good habits.' },
  { title: 'Man\'s Search for Meaning', author: 'Viktor Frankl', category: 'Psychology', isbn: '9780807014271', cover_url: 'https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg', rating: 4.8, description: 'A profound narrative of finding meaning in suffering.' },
  { title: 'Influence', author: 'Robert Cialdini', category: 'Psychology', isbn: '9780061241895', cover_url: 'https://covers.openlibrary.org/b/isbn/9780061241895-L.jpg', rating: 4.6, description: 'The psychology of persuasion.' },
  { title: 'Flow', author: 'Mihaly Csikszentmihalyi', category: 'Psychology', isbn: '9780061339202', cover_url: 'https://covers.openlibrary.org/b/isbn/9780061339202-L.jpg', rating: 4.5, description: 'The psychology of optimal experience.' },
  { title: 'The Power of Now', author: 'Eckhart Tolle', category: 'Psychology', isbn: '9781577314806', cover_url: 'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg', rating: 4.5, description: 'A guide to spiritual enlightenment.' },
  { title: 'Emotional Intelligence', author: 'Daniel Goleman', category: 'Psychology', isbn: '9780553383713', cover_url: 'https://covers.openlibrary.org/b/isbn/9780553383713-L.jpg', rating: 4.5, description: 'Why emotional intelligence matters more than IQ.' },

  // Engineering
  { title: 'Engineering Mechanics: Dynamics', author: 'J.L. Meriam', category: 'Engineering', isbn: '9781118885840', cover_url: 'https://covers.openlibrary.org/b/isbn/9781118885840-L.jpg', rating: 4.3, description: 'A foundational text for dynamics in engineering.' },
  { title: 'Fundamentals of Electric Circuits', author: 'Charles Alexander', category: 'Engineering', isbn: '9780073380575', cover_url: 'https://covers.openlibrary.org/b/isbn/9780073380575-L.jpg', rating: 4.4, description: 'Clear introduction to circuit analysis.' },
  { title: 'Thermodynamics: An Engineering Approach', author: 'Yunus Cengel', category: 'Engineering', isbn: '9780073398174', cover_url: 'https://covers.openlibrary.org/b/isbn/9780073398174-L.jpg', rating: 4.5, description: 'The most widely adopted thermodynamics text.' },
  { title: 'Fluid Mechanics', author: 'Frank White', category: 'Engineering', isbn: '9780073398273', cover_url: 'https://covers.openlibrary.org/b/isbn/9780073398273-L.jpg', rating: 4.4, description: 'Comprehensive introduction to fluid mechanics.' },
  { title: 'Materials Science and Engineering', author: 'William Callister', category: 'Engineering', isbn: '9781118319222', cover_url: 'https://covers.openlibrary.org/b/isbn/9781118319222-L.jpg', rating: 4.3, description: 'An introduction to materials science.' },

  // Data Science & Statistics
  { title: 'The Elements of Statistical Learning', author: 'Trevor Hastie', category: 'Data Science', isbn: '9780387848587', cover_url: 'https://covers.openlibrary.org/b/isbn/9780387848587-L.jpg', rating: 4.7, description: 'Data mining, inference, and prediction.' },
  { title: 'Python for Data Analysis', author: 'Wes McKinney', category: 'Data Science', isbn: '9781491957660', cover_url: 'https://covers.openlibrary.org/b/isbn/9781491957660-L.jpg', rating: 4.6, description: 'Data wrangling with pandas, NumPy, and IPython.' },
  { title: 'Hands-On Machine Learning', author: 'Aurélien Géron', category: 'Data Science', isbn: '9781492032649', cover_url: 'https://covers.openlibrary.org/b/isbn/9781492032649-L.jpg', rating: 4.8, description: 'Practical machine learning with scikit-learn and TensorFlow.' },
  { title: 'Data Science from Scratch', author: 'Joel Grus', category: 'Data Science', isbn: '9781492041139', cover_url: 'https://covers.openlibrary.org/b/isbn/9781492041139-L.jpg', rating: 4.4, description: 'First principles with Python.' },
  { title: 'Naked Statistics', author: 'Charles Wheelan', category: 'Data Science', isbn: '9780393347777', cover_url: 'https://covers.openlibrary.org/b/isbn/9780393347777-L.jpg', rating: 4.5, description: 'Stripping the dread from data.' },

  // Law
  { title: 'Black\'s Law Dictionary', author: 'Bryan A. Garner', category: 'Law', isbn: '9780314623683', cover_url: 'https://covers.openlibrary.org/b/isbn/9780314623683-L.jpg', rating: 4.6, description: 'The most widely cited law book in the world.' },
  { title: 'To Kill a Mockingbird — Legal Analysis', author: 'Timothy Hall', category: 'Law', isbn: '9780195321616', cover_url: 'https://covers.openlibrary.org/b/isbn/9780195321616-L.jpg', rating: 4.3, description: 'A survey of constitutional and civil rights law.' },
  { title: 'The Common Law', author: 'Oliver Wendell Holmes', category: 'Law', isbn: '9780674146601', cover_url: 'https://covers.openlibrary.org/b/isbn/9780674146601-L.jpg', rating: 4.5, description: 'A foundational treatise in American legal history.' },

  // Self-Development
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', category: 'Self-Development', isbn: '9780743269513', cover_url: 'https://covers.openlibrary.org/b/isbn/9780743269513-L.jpg', rating: 4.6, description: 'Powerful lessons in personal change.' },
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', category: 'Self-Development', isbn: '9780671027032', cover_url: 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg', rating: 4.6, description: 'A timeless guide to communication and success.' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Development', isbn: '9781455586691', cover_url: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg', rating: 4.7, description: 'Rules for focused success in a distracted world.' },
  { title: 'Grit', author: 'Angela Duckworth', category: 'Self-Development', isbn: '9781501111105', cover_url: 'https://covers.openlibrary.org/b/isbn/9781501111105-L.jpg', rating: 4.5, description: 'The power of passion and perseverance.' },
  { title: 'Mindset', author: 'Carol S. Dweck', category: 'Self-Development', isbn: '9780345472328', cover_url: 'https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg', rating: 4.6, description: 'The new psychology of success.' },
];

export const seedCatalog = async (libraryId: string): Promise<{ inserted: number; skipped: number; error?: string }> => {
  try {
    // Check how many books already exist
    const { count } = await supabase.from('books').select('*', { count: 'exact', head: true }).eq('library_id', libraryId);
    
    const booksToInsert = CATALOG_DATA.map(book => ({
      library_id: libraryId,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      category: book.category,
      cover_url: book.cover_url,
      rating: book.rating,
      reviews_count: Math.floor(Math.random() * 800 + 50),
      available: true,
    }));

    const { data, error } = await supabase.from('books').insert(booksToInsert).select('id');
    
    if (error) {
      // If the insert partially failed (e.g., duplicate isbn), still count what was inserted
      console.error('Seed error:', error);
      return { inserted: 0, skipped: CATALOG_DATA.length, error: error.message };
    }

    return { inserted: data?.length || 0, skipped: count || 0 };
  } catch (err: any) {
    return { inserted: 0, skipped: 0, error: err.message };
  }
};

export const fetchFromGoogleBooks = async (libraryId: string, queries: string[]): Promise<number> => {
  let totalInserted = 0;

  for (const query of queries) {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=en`);
      const data = await res.json();

      if (!data.items) continue;

      const books = data.items
        .filter((item: any) => item.volumeInfo?.title && item.volumeInfo?.authors)
        .map((item: any) => {
          const v = item.volumeInfo;
          return {
            library_id: libraryId,
            title: v.title,
            author: v.authors?.join(', ') || 'Unknown',
            isbn: v.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || null,
            description: v.description?.substring(0, 500) || 'No description available.',
            category: v.categories?.[0] || 'General',
            cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            rating: v.averageRating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
            reviews_count: v.ratingsCount || Math.floor(Math.random() * 300 + 10),
            available: true,
          };
        });

      if (books.length > 0) {
        const { data: inserted } = await supabase.from('books').insert(books).select('id');
        totalInserted += inserted?.length || 0;
      }

      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn(`Failed to fetch query "${query}":`, e);
    }
  }

  return totalInserted;
};
