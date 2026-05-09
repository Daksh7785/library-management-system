import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

export const SocialFeed: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocial = async () => {
      // Mocking activities since there isn't a dedicated activities table, 
      // ideally we would listen to realtime audit_logs or transactions
      setActivities([
        { id: 1, type: 'return', user: 'Alice', book: 'Dune', time: '2 mins ago' },
        { id: 2, type: 'duel', user: 'Bob', detail: 'won a reading duel against Charlie', time: '1 hour ago' },
        { id: 3, type: 'annotation', user: 'Dave', detail: 'left a public annotation on', book: '1984', time: '3 hours ago' },
      ]);

      const { data: leaders } = await supabase.from('profiles').select('id, full_name, xp, avatar_url').order('xp', { ascending: false }).limit(5);
      setLeaderboard(leaders || []);
      setLoading(false);
    };
    fetchSocial();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Social & Leaderboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Activity Stream */}
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Campus Activity</h2>
          {loading ? <Skeleton height="400px" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map(act => (
                <Card key={act.id} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: act.type === 'return' ? '#10b981' : act.type === 'duel' ? '#ef4444' : '#8b5cf6' }}>
                      {act.type === 'return' ? 'library_books' : act.type === 'duel' ? 'swords' : 'edit_note'}
                    </span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      <strong>{act.user}</strong> {act.type === 'return' ? 'returned a copy of' : act.detail} {act.book && <strong style={{ color: '#3b82f6' }}>{act.book}</strong>}
                    </p>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{act.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <Card>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>trophy</span> Top Readers (XP)
            </h2>
            {loading ? <Skeleton height="200px" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leaderboard.map((u, idx) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'transparent', borderRadius: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#e4e4e7' : idx === 2 ? '#b45309' : '#a1a1aa', width: '20px' }}>
                      #{idx + 1}
                    </span>
                    <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{u.full_name || 'Student'}</p>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{u.xp}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
