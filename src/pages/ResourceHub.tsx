import React, { useState } from 'react';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

export const ResourceHub: React.FC = () => {
  const [resources] = useState([
    { id: 1, title: 'CS301 Midterm Syllabus.pdf', course: 'CS301', uploader: 'Dr. Smith', type: 'PDF' },
    { id: 2, title: 'Calculus Cheat Sheet', course: 'MATH200', uploader: 'Prof. Davis', type: 'DOCX' },
    { id: 3, title: 'Physics Lab 4 Data.csv', course: 'PHYS101', uploader: 'Dr. Jones', type: 'CSV' },
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', margin: 0 }}>Universal Resource Hub</h1>
        <button style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Upload Material
        </button>
      </div>

      <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Access course materials, syllabi, and supplemental reading uploaded directly by faculty.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {resources.map(res => (
          <Card key={res.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: res.type === 'PDF' ? '#ef4444' : res.type === 'CSV' ? '#10b981' : '#3b82f6' }}>
                  {res.type === 'PDF' ? 'picture_as_pdf' : res.type === 'CSV' ? 'table_chart' : 'description'}
                </span>
              </div>
              <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{res.course}</span>
            </div>
            
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', wordBreak: 'break-all' }}>{res.title}</h3>
            <p style={{ margin: '0 0 24px', color: '#a1a1aa', fontSize: '14px' }}>Uploaded by {res.uploader}</p>
            
            <button style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <span className="material-symbols-outlined">download</span> Download
            </button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
