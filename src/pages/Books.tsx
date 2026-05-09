import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchService } from '../services/search';
import type { SearchResult } from '../services/search';
import { BookService } from '../services/books';
import { useAuth } from '../context/AuthContext';

export const Books: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [engine, setEngine] = useState('');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    BookService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const result = await SearchService.search({
          query: search,
          page,
          limit: LIMIT,
          filters: selectedCategory ? { category: selectedCategory } : undefined,
        });
        setBooks(result.results);
        setTotal(result.total);
        setEngine(result.engine);

        if (search && user) {
          SearchService.logSearch(user.id, search, result.total);
        }
      } catch (e) {
        console.error('Search error:', e);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [search, page, selectedCategory]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 800 }}>Library Catalog</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            {total.toLocaleString()} results {engine && `· via ${engine}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '300px', outline: 'none', fontSize: '14px' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ padding: '10px 12px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '340px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '12px', display: 'block' }}>search_off</span>
          <p>No books found. Try a different search term.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {books.map(book => (
            <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '240px', position: 'relative' }}>
                  <img src={book.cover_url || 'https://via.placeholder.com/200x300/1e293b/8b5cf6?text=📚'} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/1e293b/8b5cf6?text=📚'; }} />
                  {book.category && (
                    <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, color: '#8b5cf6' }}>{book.category}</span>
                  )}
                </div>
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>{book.author}</p>
                  {book.published_year && <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '11px' }}>{book.published_year}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: '8px', background: page <= 1 ? '#1e293b' : '#8b5cf6', border: 'none', color: '#fff', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}>
            ← Prev
          </button>
          <span style={{ padding: '8px 16px', color: '#94a3b8', fontSize: '14px' }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: '8px', background: page >= totalPages ? '#1e293b' : '#8b5cf6', border: 'none', color: '#fff', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>
            Next →
          </button>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }`}</style>
    </div>
  );
};
