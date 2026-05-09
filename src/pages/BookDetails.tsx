import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Skeleton } from '../components/Skeleton';
import { PresenceGhosts } from '../components/PresenceGhosts';
import { HoldButton } from '../components/HoldButton';
import { CopyTimeline } from '../components/CopyTimeline';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

export const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [book, setBook] = useState<any>(null);
  const [copies, setCopies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBorrow, setActiveBorrow] = useState<any>(null);
  const [selectedCopy, setSelectedCopy] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: bData } = await supabase.from('books').select('*, inventory_health(*)').eq('id', id).single();
      const { data: cData } = await supabase.from('book_copies').select('*').eq('book_id', id).order('condition_score', { ascending: false });
      
      setBook(bData);
      setCopies(cData || []);

      if (user && cData && cData.length > 0) {
        const { data: active } = await supabase.from('transactions').select('*').eq('user_id', user.id).eq('book_id', id).is('returned_at', null).single();
        if (active) {
          setActiveBorrow(active);
          setSelectedCopy(active.copy_id);
        } else {
          setSelectedCopy(cData[0].id);
        }
      } else if (cData && cData.length > 0) {
        setSelectedCopy(cData[0].id);
      }
      setLoading(false);
    };
    if (id) fetchData();
  }, [id, user]);

  const handleIssue = async (copyId: string) => {
    if (!user) return addToast('Must be logged in', 'error');
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        copy_id: copyId,
        book_id: book.id,
        due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
      });
      if (error) throw error;
      await supabase.from('book_copies').update({ status: 'issued' }).eq('id', copyId);
      addToast('Book issued successfully!', 'success');
      window.location.reload();
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  if (loading) return <div style={{ padding: '24px' }}><Skeleton height="400px" /></div>;
  if (!book) return <div style={{ padding: '24px', color: '#fff' }}>Book not found</div>;

  const health = book.inventory_health?.[0];
  const availableCopies = copies.filter(c => c.status === 'available');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
        
        {/* Left Col: Cover & Actions */}
        <div>
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <img src={book.cover_url || 'https://via.placeholder.com/400x600'} alt={book.title} style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}><PresenceGhosts bookId={book.id} /></div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeBorrow ? (
              <Card style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }}>
                <h4 style={{ margin: '0 0 8px', color: '#10b981' }}>Currently Borrowed</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Due: {new Date(activeBorrow.due_at).toLocaleDateString()}</p>
              </Card>
            ) : availableCopies.length > 0 ? (
              <button 
                onClick={() => handleIssue(availableCopies[0].id)}
                style={{ padding: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
              >
                Issue Volume (Copy {availableCopies[0].qr_code.split('-').pop()})
              </button>
            ) : (
              <HoldButton bookId={book.id} />
            )}
            
            <button style={{ padding: '16px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">swords</span> Challenge to Duel
            </button>
          </div>
        </div>

        {/* Right Col: Details & Timeline */}
        <div>
          <h1 style={{ fontSize: '48px', margin: '0 0 8px', lineHeight: 1.1 }}>{book.title}</h1>
          <p style={{ fontSize: '24px', color: '#a1a1aa', margin: '0 0 24px' }}>{book.author}</p>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px' }}>{book.genre}</span>
            <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px' }}>{book.total_pages} Pages</span>
            <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px' }}>Demand: {book.demand_score}</span>
          </div>

          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#e4e4e7', marginBottom: '40px' }}>{book.description}</p>

          {/* Living ISBN Section */}
          <h2 style={{ fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>history_edu</span>
            The Living ISBN: Physical Copies
          </h2>

          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '12px' }}>
            {copies.map(c => (
              <Card 
                key={c.id} 
                onClick={() => setSelectedCopy(c.id)}
                style={{ 
                  cursor: 'pointer', 
                  minWidth: '200px', 
                  borderColor: selectedCopy === c.id ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  background: selectedCopy === c.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)'
                }}
              >
                <h4 style={{ margin: '0 0 8px' }}>Copy {c.qr_code.split('-').pop()}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#a1a1aa' }}>
                  <span>Cond: {c.condition_score}%</span>
                  <span style={{ color: c.status === 'available' ? '#10b981' : '#ef4444' }}>{c.status}</span>
                </div>
              </Card>
            ))}
          </div>

          {selectedCopy && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px' }}>Journey Timeline (Copy {copies.find(c => c.id === selectedCopy)?.qr_code.split('-').pop()})</h3>
              <CopyTimeline copyId={selectedCopy} isActiveBorrower={activeBorrow?.copy_id === selectedCopy} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
