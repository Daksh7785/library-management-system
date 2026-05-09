import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

export const LiveHeatmap: React.FC = () => {
  const { user } = useAuth();
  const [heatData, setHeatData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      // Fetch active transactions
      const { data } = await supabase.from('transactions').select('*, books(title), profiles(full_name)').is('returned_at', null);
      
      const mapped = (data || []).map(tx => {
        const due = new Date(tx.due_at).getTime();
        const issued = new Date(tx.issued_at).getTime();
        const now = Date.now();
        const totalDuration = due - issued;
        const elapsed = now - issued;
        
        // Risk = elapsed / totalDuration (if > 1, it's overdue. Closer to 1 is high risk)
        let riskScore = 0;
        if (totalDuration > 0) {
          riskScore = (elapsed / totalDuration) * 100;
        } else if (elapsed > 0) {
          riskScore = 100; // Overdue if there's no duration but time has elapsed
        }
        if (riskScore < 0) riskScore = 0;
        
        return {
          ...tx,
          riskScore
        };
      });

      setHeatData(mapped.sort((a, b) => b.riskScore - a.riskScore));
    };
    if (user?.role === 'admin') fetchHeatmap();
  }, [user]);

  if (user?.role !== 'admin') return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Predictive Overdue Heatmap</h1>
      <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Real-time risk assessment of all active borrows.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {heatData.map(tx => {
          let bgColor = 'rgba(16, 185, 129, 0.2)'; // Green
          let borderColor = '#10b981';
          if (tx.riskScore > 100) { bgColor = 'rgba(239, 68, 68, 0.3)'; borderColor = '#ef4444'; } // Overdue
          else if (tx.riskScore > 80) { bgColor = 'rgba(245, 158, 11, 0.3)'; borderColor = '#f59e0b'; } // High Risk
          
          return (
            <Card key={tx.id} style={{ background: bgColor, borderColor: borderColor, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: borderColor }}>Risk: {Math.round(tx.riskScore)}%</span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{new Date(tx.due_at).toLocaleDateString()}</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{tx.books?.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#e4e4e7' }}>Borrowed by {tx.profiles?.full_name}</p>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};
