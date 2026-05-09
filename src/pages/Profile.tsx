import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/users';
import type { UserBookEntry } from '../services/users';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentBooks, setRecentBooks] = useState<UserBookEntry[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [s, lib, hist] = await Promise.allSettled([
          UserService.getStats(user.id),
          UserService.getLibrary(user.id),
          UserService.getSearchHistory(user.id, 5),
        ]);

        if (s.status === 'fulfilled') setStats(s.value);
        if (lib.status === 'fulfilled') setRecentBooks(lib.value.slice(0, 8));
        if (hist.status === 'fulfilled') setSearchHistory(hist.value);
      } catch (e) {
        console.error('Profile load error:', e);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', padding: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid #1e293b' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, flexShrink: 0 }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900 }}>{user?.name || 'Scholar'}</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{user?.email}</p>
          <p style={{ margin: '4px 0 0', color: '#8b5cf6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{user?.role || 'Student'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#8b5cf6' }}>{(user as any)?.xp || 0}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>XP EARNED</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
        {[
          { label: 'Reading', value: stats?.books_reading || 0, color: '#0ea5e9', icon: 'menu_book' },
          { label: 'Completed', value: stats?.books_completed || 0, color: '#10b981', icon: 'check_circle' },
          { label: 'Wishlist', value: stats?.books_wishlist || 0, color: '#f59e0b', icon: 'bookmark' },
          { label: 'Total', value: stats?.total_interactions || 0, color: '#8b5cf6', icon: 'library_books' },
        ].map(s => (
          <div key={s.label} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid #1e293b', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: s.color, fontSize: '24px', marginBottom: '8px', display: 'block' }}>{s.icon}</span>
            <div style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Books */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Your Library</h2>
        {recentBooks.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>No books in your library yet. Start by browsing the catalog!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {recentBooks.map(entry => (
              <div key={entry.id} style={{ display: 'flex', gap: '12px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <img
                  src={(entry.books as any)?.cover_url || 'https://via.placeholder.com/60x80/1e293b/8b5cf6?text=📚'}
                  alt=""
                  style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x80/1e293b/8b5cf6?text=📚'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(entry.books as any)?.title || 'Unknown'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{(entry.books as any)?.author || ''}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase',
                      background: entry.status === 'completed' ? '#10b98120' : entry.status === 'reading' ? '#0ea5e920' : '#f59e0b20',
                      color: entry.status === 'completed' ? '#10b981' : entry.status === 'reading' ? '#0ea5e9' : '#f59e0b',
                    }}>{entry.status}</span>
                    {entry.rating && (
                      <span style={{ fontSize: '12px', color: '#f59e0b' }}>{'★'.repeat(Math.round(entry.rating))}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Recent Searches</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {searchHistory.map((h: any) => (
              <span key={h.id} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', fontSize: '12px', color: '#94a3b8', border: '1px solid #1e293b' }}>
                🔍 {h.query}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
