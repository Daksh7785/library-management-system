import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';

interface HoldButtonProps {
  bookId: string;
}

export const HoldButton: React.FC<HoldButtonProps> = ({ bookId }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const checkHold = async () => {
      const { data } = await supabase.from('holds').select('position').eq('book_id', bookId).eq('user_id', user.id).eq('status', 'waiting').single();
      if (data) setPosition(data.position);
    };
    checkHold();
  }, [bookId, user]);

  const handleHold = async () => {
    if (!user) {
      addToast('Please login to place a hold', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('place_hold', { p_user_id: user.id, p_book_id: bookId });
      if (error) throw error;
      setPosition(data.position);
      addToast(`Waitlist joined! You are position #${data.position}.`, 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (position !== null) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: '12px 24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined">how_to_reg</span>
        On Waitlist (Position #{position})
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleHold}
      disabled={loading}
      style={{
        padding: '12px 24px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#fff',
        fontWeight: 600,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        opacity: loading ? 0.7 : 1,
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
      }}
    >
      <span className="material-symbols-outlined">queue</span>
      {loading ? 'Securing Position...' : 'Join Waitlist'}
    </motion.button>
  );
};
