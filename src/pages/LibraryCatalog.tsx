import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { seedCatalog, fetchFromGoogleBooks } from '../utils/catalog_seed';
import { useAuth } from '../context/AuthContext';

const GOOGLE_QUERIES = [
  'computer science textbook',
  'machine learning artificial intelligence',
  'data structures algorithms',
  'organic chemistry university',
  'quantum physics modern',
  'world history civilization',
  'economics principles university',
  'psychology human behavior',
  'medical anatomy physiology',
  'literature classics fiction',
  'mathematics calculus linear algebra',
  'business management leadership',
];

const CATEGORIES = ['All', 'Computer Science', 'Artificial Intelligence', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Economics', 'Business', 'History', 'Philosophy', 'Literature', 'Psychology', 'Engineering', 'Data Science', 'Law', 'Medicine', 'Self-Development'];

export const LibraryCatalog: React.FC = () => {
  const { user } = useAuth();
  const libraryId = user?.libraryId || user?.library_id || '1';

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedingGoogle, setSeedingGoogle] = useState(false);
  const [seedLog, setSeedLog] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [totalBooks, setTotalBooks] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  const fetchBooks = async () => {
    setLoading(true);
    let query = supabase.from('books').select('*', { count: 'exact' }).order('title');
    if (search.trim()) query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    if (category !== 'All') query = query.eq('category', category);
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data, count } = await query;
    setBooks(data || []);
    setTotalBooks(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, [search, category, page]);

  const handleSeedCatalog = async () => {
    setSeeding(true);
    setSeedLog(['⏳ Seeding curated catalog (70+ academic books)...']);
    const result = await seedCatalog(libraryId);
    if (result.error) {
      setSeedLog(l => [...l, `❌ Error: ${result.error}`]);
    } else {
      setSeedLog(l => [...l, `✅ Inserted ${result.inserted} new books into catalog!`]);
    }
    await fetchBooks();
    setSeeding(false);
  };

  const handleSeedGoogle = async () => {
    setSeedingGoogle(true);
    setSeedLog(['🌐 Fetching live books from Google Books API...']);
    for (let i = 0; i < GOOGLE_QUERIES.length; i++) {
      setSeedLog(l => [...l, `📚 Fetching: "${GOOGLE_QUERIES[i]}" (${i + 1}/${GOOGLE_QUERIES.length})...`]);
      await fetchFromGoogleBooks(libraryId, [GOOGLE_QUERIES[i]]);
    }
    setSeedLog(l => [...l, '✅ Google Books import complete!']);
    await fetchBooks();
    setSeedingGoogle(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('books').delete().eq('id', id);
    fetchBooks();
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Library Catalog Manager
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '15px' }}>
            {totalBooks.toLocaleString()} books in catalog
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeedCatalog}
            disabled={seeding || seedingGoogle}
            style={{
              padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff',
              fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: seeding ? 0.6 : 1
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>library_add</span>
            {seeding ? 'Seeding...' : 'Seed Curated Catalog'}
          </button>
          <button
            onClick={handleSeedGoogle}
            disabled={seeding || seedingGoogle}
            style={{
              padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
              fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: seedingGoogle ? 0.6 : 1
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_download</span>
            {seedingGoogle ? 'Importing...' : 'Import from Google Books'}
          </button>
        </div>
      </div>

      {/* Seed Log */}
      {seedLog.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '13px', maxHeight: '160px', overflowY: 'auto' }}>
          {seedLog.map((line, i) => (
            <div key={i} style={{ color: line.startsWith('❌') ? '#f87171' : line.startsWith('✅') ? '#34d399' : '#94a3b8', marginBottom: '4px' }}>{line}</div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>search</span>
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by title, author..."
            style={{ width: '100%', padding: '12px 14px 12px 44px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
        </div>
        <select
          value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}
          style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
        >
          {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
        </select>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Books', value: totalBooks, icon: 'menu_book', color: '#8b5cf6' },
          { label: 'Categories', value: CATEGORIES.length - 1, icon: 'category', color: '#0ea5e9' },
          { label: 'Showing', value: books.length, icon: 'visibility', color: '#10b981' },
          { label: 'Page', value: `${page + 1} of ${Math.max(1, Math.ceil(totalBooks / PAGE_SIZE))}`, icon: 'pages', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '22px' }}>{stat.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && books.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '2px dashed #334155' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#334155', display: 'block', marginBottom: '16px' }}>library_books</span>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Catalog is Empty</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Click "Seed Curated Catalog" above to add 70+ academic books instantly.</p>
          <button onClick={handleSeedCatalog} style={{ padding: '14px 28px', background: '#8b5cf6', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '15px' }}>
            Add Books Now
          </button>
        </div>
      )}

      {/* Book Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', height: '340px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {books.map(book => (
            <div key={book.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', borderRadius: '16px',
              overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
              display: 'flex', flexDirection: 'column'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              {/* Cover */}
              <div style={{ height: '200px', position: 'relative', overflow: 'hidden', background: '#1e293b' }}>
                <img
                  src={book.cover_url || `https://via.placeholder.com/220x200/1e293b/8b5cf6?text=${encodeURIComponent(book.title?.substring(0, 15) || 'Book')}`}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/220x200/1e293b/8b5cf6?text=📚`; }}
                />
                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(139,92,246,0.9)', padding: '3px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                  {book.category || 'General'}
                </div>
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(book.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center' }}
                  title="Remove from catalog"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                  {book.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px' }}>{book.author}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {'★'.repeat(Math.round(book.rating || 4))}
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>{parseFloat(book.rating || 4).toFixed(1)}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: book.available ? '#10b981' : '#ef4444', fontWeight: 700, background: book.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: '8px' }}>
                    {book.available ? 'AVAILABLE' : 'BORROWED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalBooks > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px', alignItems: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
          >← Previous</button>
          <span style={{ color: '#64748b', fontSize: '14px' }}>
            Page {page + 1} of {Math.ceil(totalBooks / PAGE_SIZE)} · {totalBooks} books
          </span>
          <button
            onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= totalBooks}
            style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#fff', cursor: (page + 1) * PAGE_SIZE >= totalBooks ? 'not-allowed' : 'pointer', opacity: (page + 1) * PAGE_SIZE >= totalBooks ? 0.4 : 1 }}
          >Next →</button>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );
};
