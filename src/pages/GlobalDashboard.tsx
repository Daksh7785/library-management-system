import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const GlobalDashboard = () => {
  const [stats, setStats] = useState({ totalLibraries: 0, totalBooks: 0, activeReaders: 0 });

  // Synthetic data for the global trend
  const trendData = [
    { name: 'Mon', reads: 400 },
    { name: 'Tue', reads: 300 },
    { name: 'Wed', reads: 550 },
    { name: 'Thu', reads: 450 },
    { name: 'Fri', reads: 700 },
    { name: 'Sat', reads: 1200 },
    { name: 'Sun', reads: 1500 },
  ];

  useEffect(() => {
    const fetchGlobalStats = async () => {
      // setStats loading omitted for clean-up
      // In a real SaaS, these would be RPC calls that aggregate across partitions safely
      // For this demo, we'll fetch basic counts where permitted
      const { count: libCount } = await supabase.from('libraries').select('*', { count: 'exact', head: true });
      const { count: bookCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
      const { count: transCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('returned', false);
      
      setStats({
        totalLibraries: libCount || 1, // Assume at least 1 for the demo
        totalBooks: bookCount || 0,
        activeReaders: transCount || 0
      });
      // setLoading(false); omitted for clean-up
    };

    fetchGlobalStats();
  }, []);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>Global SaaS Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Multi-tenant network overview and predictive intelligence.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Active Libraries" value={stats.totalLibraries.toString()} icon="account_balance" color="#3b82f6" />
        <StatCard title="Books Indexed" value={stats.totalBooks.toLocaleString()} icon="library_books" color="#8b5cf6" />
        <StatCard title="Live Readers" value={stats.activeReaders.toLocaleString()} icon="vital_signs" color="#10b981" />
        <StatCard title="Network Health" value="99.99%" icon="dns" color="#f59e0b" />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>trending_up</span>
          Global Reading Velocity
        </h2>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#8b5cf6', fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="reads" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={{ 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      borderRadius: '24px', 
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}
  >
    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{icon}</span>
    </div>
    <div>
      <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: '#f8fafc', fontSize: '28px', fontWeight: 800 }}>{value}</div>
    </div>
  </motion.div>
);
