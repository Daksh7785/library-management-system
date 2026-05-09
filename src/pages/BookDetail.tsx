import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookService } from '../services/books';
import type { BookRecord } from '../services/books';
import { UserService } from '../services/users';
import type { ReadingStatus } from '../services/users';
import { useAuth } from '../context/AuthContext';

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookRecord | null>(null);
  const [userStatus, setUserStatus] = useState<ReadingStatus | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const b = await BookService.getById(id);
      setBook(b);

      if (user) {
        const lib = await UserService.getLibrary(user.id);
        const entry = lib.find(e => e.book_id === id);
        if (entry) {
          setUserStatus(entry.status);
          setUserRating(entry.rating || 0);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleStatusChange = async (status: ReadingStatus) => {
    if (!user || !id) return;
    setSaving(true);
    try {
      if (!userStatus) {
        await UserService.addToLibrary(user.id, id, status);
      } else {
        await UserService.updateStatus(user.id, id, status);
      }
      setUserStatus(status);
    } catch (e) {
      console.error('Status update error:', e);
    }
    setSaving(false);
  };

  const handleRate = async (rating: number) => {
    if (!user || !id) return;
    setSaving(true);
    try {
      if (!userStatus) {
        await UserService.addToLibrary(user.id, id, 'reading');
        setUserStatus('reading');
      }
      await UserService.rateBook(user.id, id, rating);
      setUserRating(rating);
    } catch (e) {
      console.error('Rating error:', e);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading book...
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        <h2>Book not found</h2>
        <button onClick={() => navigate('/books')} style={{ marginTop: '16px', padding: '10px 24px', background: '#8b5cf6', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const statuses: { value: ReadingStatus; label: string; icon: string }[] = [
    { value: 'reading', label: 'Reading', icon: 'menu_book' },
    { value: 'completed', label: 'Completed', icon: 'check_circle' },
    { value: 'wishlist', label: 'Wishlist', icon: 'bookmark' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '14px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
        {/* Cover */}
        <div>
          <img
            src={book.cover_url || 'https://via.placeholder.com/280x400/1e293b/8b5cf6?text=📚'}
            alt={book.title}
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x400/1e293b/8b5cf6?text=📚'; }}
          />

          {/* Status Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            {statuses.map(s => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                disabled={saving}
                style={{
                  padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: userStatus === s.value ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                  color: userStatus === s.value ? '#fff' : '#94a3b8',
                  fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>{book.title}</h1>
          {book.subtitle && <h2 style={{ fontSize: '18px', fontWeight: 400, color: '#94a3b8', margin: '0 0 12px' }}>{book.subtitle}</h2>}
          <p style={{ fontSize: '16px', color: '#8b5cf6', fontWeight: 600, marginBottom: '20px' }}>{book.author}</p>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Year', value: book.published_year || '—' },
              { label: 'Pages', value: book.total_pages || book.pages || '—' },
              { label: 'Language', value: (book.language || 'en').toUpperCase() },
              { label: 'Category', value: book.category || book.genre || '—' },
              { label: 'Publisher', value: book.publisher || '—' },
              { label: 'ISBN', value: book.isbn_13 || book.isbn || '—' },
            ].map(m => (
              <div key={m.label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>YOUR RATING</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={saving}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '28px', color: star <= userRating ? '#f59e0b' : '#334155', transition: 'color 0.15s' }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>About this book</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '14px' }}>{book.description}</p>
            </div>
          )}

          {/* Subjects */}
          {book.subjects && book.subjects.length > 0 && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Subjects</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {book.subjects.slice(0, 12).map((s, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', fontSize: '12px', color: '#a78bfa' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          <div style={{ marginTop: '28px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid #1e293b', display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
            <span>Source: {book.source || 'manual'}</span>
            {book.confidence_score && <span>Confidence: {Math.round(book.confidence_score * 100)}%</span>}
            {book.google_id && <span>Google: {book.google_id}</span>}
            {book.open_lib_id && <span>OpenLib: {book.open_lib_id}</span>}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
