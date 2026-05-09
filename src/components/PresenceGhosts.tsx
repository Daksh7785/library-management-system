import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export const PresenceGhosts: React.FC<{ bookId: string }> = ({ bookId }) => {
  const { user } = useAuth();
  const [viewers, setViewers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const room = supabase.channel(`room:${bookId}`, {
      config: { presence: { key: user.id } },
    });

    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      const currentViewers = Object.values(state).flat();
      setViewers(currentViewers);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await room.track({ 
          online_at: new Date().toISOString(),
          initials: user.full_name ? user.full_name.substring(0, 2).toUpperCase() : '??'
        });
      }
    });

    return () => {
      supabase.removeChannel(room);
    };
  }, [bookId, user]);

  if (viewers.length <= 1) return null; // Don't show if only I am here

  const others = viewers.filter(v => v.initials !== (user?.full_name?.substring(0,2).toUpperCase() || '??'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', marginLeft: '10px' }}>
        <AnimatePresence>
          {others.slice(0, 3).map((v, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0 }}
              style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold',
                color: '#fff', border: '2px solid #1a1a1a', marginLeft: '-10px', zIndex: 10 - i,
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
              }}
            >
              {v.initials}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span style={{ fontSize: '12px', color: '#ccc', marginRight: '8px' }}>
        {others.length > 3 ? `+${others.length - 3} viewing` : `${others.length} viewing`}
      </span>
    </div>
  );
};
