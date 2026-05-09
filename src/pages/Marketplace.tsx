import React, { useState } from 'react';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

export const Marketplace: React.FC = () => {
  // Mock data since marketplace table wasn't in phase 1 schema, but UI is required
  const [items] = useState([
    { id: 1, title: 'Cracking the Coding Interview', condition: 'Like New', type: 'Trade', owner: 'Alice' },
    { id: 2, title: 'Calculus Early Transcendentals', condition: 'Worn', type: 'Gift', owner: 'Bob' },
    { id: 3, title: 'The Pragmatic Programmer', condition: 'Good', type: 'Trade', owner: 'Charlie' },
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>Student Marketplace</h1>
        <button style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          + List Personal Book
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <select style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          <option>All Types</option>
          <option>Trade</option>
          <option>Gift</option>
        </select>
        <select style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          <option>Condition: Any</option>
          <option>Like New</option>
          <option>Good</option>
          <option>Worn</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {items.map(item => (
          <Card key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ padding: '4px 8px', background: item.type === 'Gift' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: item.type === 'Gift' ? '#10b981' : '#3b82f6', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{item.type}</span>
              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Condition: {item.condition}</span>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{item.title}</h3>
            <p style={{ margin: '0 0 24px', color: '#a1a1aa', fontSize: '14px' }}>Listed by {item.owner}</p>
            
            <button style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <span className="material-symbols-outlined">chat</span> Message {item.owner}
            </button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
