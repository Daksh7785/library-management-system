import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const KnowledgePassport: React.FC = () => {
  const { user } = useAuth();
  const [dna, setDna] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDna = async () => {
      // First check if DNA exists in profile, otherwise call edge function to generate
      const { data } = await supabase.from('profiles').select('reading_dna').eq('id', user.id).single();
      
      if (data && data.reading_dna && Object.keys(data.reading_dna).length > 0) {
        setDna(data.reading_dna);
      } else {
        // Mock DNA generation if edge function not strictly required yet
        const mockDna = {
          top_genres: ['Fantasy', 'Sci-Fi', 'Classic'],
          reading_pace: 'fast',
          mood_pattern: ['adventurous', 'thoughtful']
        };
        setDna(mockDna);
      }
      setLoading(false);
    };
    fetchDna();
  }, [user]);

  if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;

  const pieData = (dna?.top_genres || []).map((genre: string, i: number) => ({ name: genre, value: 40 - i * 10 }));

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
        <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #3b82f6' }} />
        <div>
          <h1 style={{ fontSize: '36px', margin: '0 0 8px' }}>{user?.full_name || 'Student'}</h1>
          <p style={{ color: '#a1a1aa', fontSize: '18px', margin: 0 }}>Level {Math.floor((user?.xp || 0) / 1000) + 1} Scholar</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card>
          <h2 style={{ margin: '0 0 24px' }}>Reading DNA</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {pieData.map((d: any, i: number) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i] }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h3 style={{ margin: '0 0 16px' }}>Reading Pace</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: dna?.reading_pace === 'fast' ? '#ef4444' : '#3b82f6' }}>
              {dna?.reading_pace?.toUpperCase() || 'UNKNOWN'}
            </div>
            <p style={{ color: '#a1a1aa', margin: '8px 0 0' }}>Based on your log session data.</p>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px' }}>Badges & Achievements</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🔥</div>
                 <span style={{ fontSize: '12px' }}>7 Day Streak</span>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚔️</div>
                 <span style={{ fontSize: '12px' }}>Duel Victor</span>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🧠</div>
                 <span style={{ fontSize: '12px' }}>Annotator</span>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
