import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export const CopyTimeline: React.FC<{ copyId: string, isActiveBorrower: boolean }> = ({ copyId, isActiveBorrower }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: txs } = await supabase.from('transactions').select('*, profiles(full_name, avatar_url)').eq('copy_id', copyId).order('issued_at', { ascending: false });
      const { data: annos } = await supabase.from('annotations').select('*, profiles(full_name)').eq('copy_id', copyId).order('created_at', { ascending: false });
      
      setTransactions(txs || []);
      setAnnotations(annos || []);
    };
    fetchData();
  }, [copyId]);

  return (
    <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {transactions.map((tx, idx) => {
        const anno = annotations.find(a => a.author_id === tx.user_id && new Date(a.created_at) > new Date(tx.issued_at));
        
        return (
          <motion.div key={tx.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-31px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: tx.returned_at ? '#a1a1aa' : '#3b82f6', border: '2px solid #1a1a1a' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img src={tx.profiles?.avatar_url || 'https://via.placeholder.com/40'} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{tx.profiles?.full_name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>
                  Borrowed {new Date(tx.issued_at).toLocaleDateString()}
                  {tx.returned_at && ` • Returned ${new Date(tx.returned_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {tx.condition_on_return && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                Condition dropped to {tx.condition_on_return}%
              </div>
            )}

            {anno && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                {isActiveBorrower || anno.is_public ? (
                   <div>
                     <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a855f7', fontWeight: 'bold' }}>Secret Note Left (Page {anno.page_number})</p>
                     <p style={{ margin: 0, color: '#e4e4e7', fontStyle: 'italic' }}>"{anno.content_encrypted}"</p>
                   </div>
                ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                     <span className="material-symbols-outlined">lock</span>
                     <span style={{ fontSize: '14px' }}>Encrypted Note (Only current borrower can read)</span>
                   </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
      {transactions.length === 0 && <p style={{ color: '#a1a1aa', fontSize: '14px' }}>No history for this physical copy yet.</p>}
    </div>
  );
};
