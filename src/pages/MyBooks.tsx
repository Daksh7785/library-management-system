import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const MyBooks: React.FC = () => {
  const { user } = useAuth();
  const [activeBorrows, setActiveBorrows] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);
  const [pastReads, setPastReads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMyBooks = async () => {
      setLoading(true);
      const { data: active } = await supabase.from('transactions').select('*, books(*), book_copies(qr_code)').eq('user_id', user.id).is('returned_at', null);
      const { data: waitlist } = await supabase.from('holds').select('*, books(*)').eq('user_id', user.id).eq('status', 'waiting');
      const { data: past } = await supabase.from('transactions').select('*, books(*)').eq('user_id', user.id).not('returned_at', 'is', null).order('returned_at', { ascending: false });

      setActiveBorrows(active || []);
      setHolds(waitlist || []);
      setPastReads(past || []);
      setLoading(false);
    };
    fetchMyBooks();
  }, [user]);

  if (loading) return <div style={{ padding: '24px' }}><Skeleton height="300px" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>My Library</h1>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <Card style={{ flex: 1 }}><h3 style={{ margin: 0, color: '#a1a1aa' }}>XP Level</h3><p style={{ margin: '8px 0 0', fontSize: '28px', color: '#10b981' }}>{user?.xp || 0}</p></Card>
        <Card style={{ flex: 1 }}><h3 style={{ margin: 0, color: '#a1a1aa' }}>Streak</h3><p style={{ margin: '8px 0 0', fontSize: '28px', color: '#f59e0b' }}>{user?.streak_days || 0} Days</p></Card>
        <Card style={{ flex: 1 }}><h3 style={{ margin: 0, color: '#a1a1aa' }}>Pages Read</h3><p style={{ margin: '8px 0 0', fontSize: '28px' }}>---</p></Card>
      </div>

      {/* Active Borrows */}
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Active Borrows</h2>
      {activeBorrows.length === 0 ? <p style={{ color: '#a1a1aa', marginBottom: '40px' }}>No active borrows.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {activeBorrows.map(tx => {
            const daysRemaining = Math.ceil((new Date(tx.due_at).getTime() - Date.now()) / (1000 * 3600 * 24));
            return (
              <Card key={tx.id} style={{ display: 'flex', gap: '16px', padding: '16px' }}>
                <img src={tx.books.cover_url || 'https://via.placeholder.com/80x120'} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{tx.books.title}</h3>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '12px' }}>Copy {tx.book_copies?.qr_code?.split('-').pop()}</p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    {daysRemaining < 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Overdue by {Math.abs(daysRemaining)} days</span>
                    ) : daysRemaining <= 3 ? (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Due in {daysRemaining} days</span>
                    ) : (
                      <span style={{ color: '#10b981' }}>Due in {daysRemaining} days</span>
                    )}
                  </div>
                  
                  <button style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log Reading Session
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Waitlist */}
      {holds.length > 0 && (
        <>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>My Waitlist</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {holds.map(h => (
              <Card key={h.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                  #{h.position}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>{h.books.title}</h4>
                  <Link to={`/books/${h.book_id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>View Book</Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Past Reads */}
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Past Reads</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {pastReads.map(tx => (
          <Link key={tx.id} to={`/books/${tx.book_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
             <Card style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <img src={tx.books.cover_url || 'https://via.placeholder.com/150'} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px' }} />
                <p style={{ margin: '8px 0 0', fontSize: '12px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.books.title}</p>
             </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};
