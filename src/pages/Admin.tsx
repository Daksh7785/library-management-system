import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      const { data: health } = await supabase.from('inventory_health').select('*').order('health_grade', { ascending: false });
      const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: wishes } = await supabase.from('faculty_wishlists').select('*, profiles(full_name)').order('priority_score', { ascending: false });
      
      setHealthData(health || []);
      setUsers(profs || []);
      setWishlists(wishes || []);
      setLoading(false);
    };
    if (user?.role === 'admin') fetchAdminData();
  }, [user]);

  if (user?.role !== 'admin') {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Unauthorized. Admins only.</div>;
  }

  if (loading) return <div style={{ padding: '24px' }}><Skeleton height="500px" /></div>;

  const gradeCounts = healthData.reduce((acc, curr) => {
    acc[curr.health_grade] = (acc[curr.health_grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(gradeCounts).map(k => ({ name: k, value: gradeCounts[k] }));
  const COLORS = { 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#ef4444', 'F': '#7f1d1d' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <Card>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>Inventory Health Distribution</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || '#a1a1aa'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
           <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>Critical Health Alerts (Grade D/F)</h2>
           <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             {healthData.filter(h => h.health_grade === 'D' || h.health_grade === 'F').map(h => (
               <div key={h.id} style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                 <strong>{h.title}</strong>
                 <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Avg Condition: {Math.round(h.avg_condition)}% | Available: {h.available_copies}</div>
               </div>
             ))}
             {healthData.filter(h => h.health_grade === 'D' || h.health_grade === 'F').length === 0 && <p style={{ color: '#10b981' }}>No critical inventory items.</p>}
           </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>Faculty Wishlist Queue</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#a1a1aa' }}>
                <th style={{ padding: '12px 8px' }}>Title</th>
                <th style={{ padding: '12px 8px' }}>Faculty</th>
                <th style={{ padding: '12px 8px' }}>Priority</th>
                <th style={{ padding: '12px 8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlists.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{w.title}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{w.profiles?.full_name}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', color: '#f59e0b', fontWeight: 'bold' }}>{w.priority_score}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <button style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>User Management</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{u.full_name || u.email}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#a1a1aa' }}>{u.email}</p>
                </div>
                <select defaultValue={u.role} style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
