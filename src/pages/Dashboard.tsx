import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RecommendationService } from '../services/recommendations';
import type { Recommendation } from '../services/recommendations';
import { SearchService } from '../services/search';
import { supabase } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_books: 0, total_users: 0, books_today: 0 });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [recs, countRes] = await Promise.allSettled([
          RecommendationService.getForUser(user.id),
          supabase.from('books').select('id', { count: 'exact', head: true }),
        ]);
        if (recs.status === 'fulfilled') setRecommendations(recs.value);
        if (countRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, total_books: countRes.value.count || 0 }));
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (user) {
      await SearchService.logSearch(user.id, searchQuery, 0);
    }
    navigate(`/books?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Hero Search */}
      <div style={{ textAlign: 'center', marginBottom: '60px', padding: '80px 20px', background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 70%)', borderRadius: '32px', border: '1px solid #1e293b', position: 'relative', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '52px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-2px' }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0] || 'Scholar'}</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '32px' }}>
          {stats.total_books.toLocaleString()} books in the global catalog
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, ISBN, or topic..."
            style={{ width: '100%', padding: '20px 140px 20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid #334155', color: '#fff', fontSize: '17px', outline: 'none' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 28px', background: '#8b5cf6', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
            Search
          </button>
        </form>
      </div>

      {/* Recommendations */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>auto_awesome</span>
            Recommended for You
          </h2>
          <button onClick={() => navigate('/books')} style={{ color: '#8b5cf6', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
            Browse All →
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '280px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {recommendations.map((book) => (
              <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <img
                  src={book.cover_url || `https://via.placeholder.com/180x260/1e293b/8b5cf6?text=${encodeURIComponent(book.title.substring(0, 10))}`}
                  alt={book.title}
                  style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/180x260/1e293b/8b5cf6?text=📚'; }}
                />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '10px 0 2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{book.author}</p>
                <p style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px' }}>{book.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <p style={{ color: '#64748b' }}>Start reading books to get personalized recommendations!</p>
            <button onClick={() => navigate('/books')} style={{ marginTop: '12px', padding: '10px 24px', background: '#8b5cf6', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Browse Catalog
            </button>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { icon: 'smart_toy', label: 'AI Librarian', desc: 'Ask anything about books', path: '/librarian', color: '#8b5cf6' },
          { icon: 'add_circle', label: 'Add Book', desc: 'ISBN, search, or PDF upload', path: '/add-book', color: '#0ea5e9' },
          { icon: 'person', label: 'My Profile', desc: 'Stats, reading DNA, history', path: '/profile', color: '#10b981' },
          { icon: 'auto_stories', label: 'My Library', desc: 'Reading, completed, wishlist', path: '/my-books', color: '#f59e0b' },
        ].map((a) => (
          <div key={a.path} onClick={() => navigate(a.path)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', borderRadius: '16px', cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = a.color)} onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e293b')}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: a.color, fontSize: '22px' }}>{a.icon}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{a.label}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <style>{`@keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }`}</style>
    </div>
  );
};
