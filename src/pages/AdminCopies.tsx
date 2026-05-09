import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Card } from '../components/Card';
import { QRStickerGenerator } from '../components/QRStickerGenerator';
import { motion } from 'framer-motion';

export const AdminCopies: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [copies, setCopies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCopy, setSelectedCopy] = useState<any>(null);
  
  useEffect(() => {
    const fetchCopies = async () => {
      let query = supabase.from('book_copies').select('*, books(title)').limit(50);
      if (search) query = query.ilike('qr_code', `%${search}%`);
      const { data } = await query;
      setCopies(data || []);
    };
    if (user?.role === 'admin') fetchCopies();
  }, [user, search]);

  const updateCondition = async (id: string, newScore: number) => {
    const { error } = await supabase.from('book_copies').update({ condition_score: newScore }).eq('id', id);
    if (!error) {
      addToast('Condition updated', 'success');
      setCopies(copies.map(c => c.id === id ? { ...c, condition_score: newScore } : c));
    }
  };

  const retireCopy = async (id: string) => {
    const { error } = await supabase.from('book_copies').update({ status: 'retired' }).eq('id', id);
    if (!error) {
      addToast('Copy retired', 'info');
      setCopies(copies.map(c => c.id === id ? { ...c, status: 'retired' } : c));
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Physical Inventory Management</h1>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search by QR Code (e.g. QR-A12B)..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
            {copies.map(c => (
              <Card key={c.id} onClick={() => setSelectedCopy(c)} style={{ cursor: 'pointer', padding: '16px', borderColor: selectedCopy?.id === c.id ? '#3b82f6' : 'rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{c.qr_code}</h3>
                  <span style={{ fontSize: '12px', color: c.status === 'available' ? '#10b981' : '#ef4444' }}>{c.status}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#a1a1aa' }}>{c.books?.title}</p>
                <div style={{ fontSize: '12px' }}>Condition: {c.condition_score}%</div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {selectedCopy ? (
            <Card style={{ position: 'sticky', top: '24px' }}>
              <h2 style={{ margin: '0 0 24px' }}>Manage Copy: {selectedCopy.qr_code}</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Print QR Sticker</h3>
                <QRStickerGenerator qrCode={selectedCopy.qr_code} title={selectedCopy.books?.title} copyId={selectedCopy.id} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Update Condition</h3>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={selectedCopy.condition_score} 
                  onChange={e => updateCondition(selectedCopy.id, parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
                <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>{selectedCopy.condition_score}%</div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', gap: '12px' }}>
                <button onClick={() => retireCopy(selectedCopy.id)} style={{ padding: '12px', flex: 1, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Retire Copy
                </button>
                <button style={{ padding: '12px', flex: 1, background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', border: '1px solid #8b5cf6', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Reincarnate (Link to New)
                </button>
              </div>
            </Card>
          ) : (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#a1a1aa' }}>
              Select a copy to manage
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};
