import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

export const PeerMatchmaking: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const findTwin = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-matchmaker', {
        body: { user_id: user.id }
      });
      if (error) throw error;
      setMatches(data.matches || []);
    } catch (err: any) {
      addToast('Failed to find matches: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '40px', margin: '0 0 16px' }}>Peer Matchmaking</h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Discover your "Reading Twin" using AI. We analyze your past borrows, genres, and reading pace to find students with the exact same literary DNA.
        </p>
        
        <button 
          onClick={findTwin}
          disabled={loading}
          style={{ padding: '16px 32px', borderRadius: '30px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: loading ? 'wait' : 'pointer', boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)' }}
        >
          {loading ? 'Analyzing DNA...' : 'Find My Reading Twin'}
        </button>
      </div>

      {searched && (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Your Top Matches</h2>
          
          {loading ? (
            <div style={{ display: 'grid', gap: '24px' }}>
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </div>
          ) : matches.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px' }}>
              <h3 style={{ color: '#a1a1aa' }}>No matches found yet. Try reading more books!</h3>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {matches.map((match, idx) => (
                <motion.div key={match.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                       <img src={match.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`} style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff' }} />
                       <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                         {match.overlap_score}x Match
                       </div>
                    </div>
                    
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{match.full_name || 'Anonymous Student'}</h3>
                      <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>Shares your interest in Sci-Fi and Dystopia.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ padding: '12px 24px', borderRadius: '8px', background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined">group_add</span> Invite to Club
                      </button>
                      <button style={{ padding: '12px 24px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined">swords</span> Duel
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
