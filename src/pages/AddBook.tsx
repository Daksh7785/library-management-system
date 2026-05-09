import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IngestionService } from '../services/ingestion';
import type { UniversalBookData } from '../services/ingestion';
import { PDFIntelligenceService } from '../services/pdf_intelligence';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const AddBook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const libraryId = user?.libraryId || user?.library_id || '1';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UniversalBookData | null>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'search' | 'pdf' | 'manual'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    const book = await IngestionService.searchAndAdd(query, libraryId);
    
    if (book) {
      setResult(book);
    } else {
      setError('Could not find book data. Try another title or ISBN.');
    }
    setLoading(false);
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const book = await PDFIntelligenceService.processPDF(file, libraryId);
    
    if (book) {
      setResult(book);
    } else {
      setError('Failed to extract metadata from PDF. Please try searching by ISBN.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Universal Book Ingestion
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', marginTop: '12px' }}>
          Add any book that exists in the world to your academic catalog.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
        {[
          { id: 'search', icon: 'search', label: 'ISBN / Title Search' },
          { id: 'pdf', icon: 'picture_as_pdf', label: 'PDF Upload' },
          { id: 'manual', icon: 'edit', label: 'Manual Entry' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as any)}
            style={{
              padding: '12px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: mode === tab.id ? 'rgba(139,92,246,0.1)' : 'transparent',
              color: mode === tab.id ? '#8b5cf6' : '#64748b',
              fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s', borderBottom: mode === tab.id ? '2px solid #8b5cf6' : '2px solid transparent'
            }}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      {mode === 'search' && (
        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '40px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', fontSize: '24px' }}>
            auto_stories
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter ISBN-13, Title, or Author..."
            style={{
              width: '100%', padding: '24px 24px 24px 64px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid #334155',
              color: '#fff', fontSize: '20px', outline: 'none', transition: 'border-color 0.2s',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              position: 'absolute', right: '12px', top: '12px', bottom: '12px',
              padding: '0 32px', borderRadius: '12px', background: '#8b5cf6',
              color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {loading ? 'Searching...' : 'Ingest Book'}
            {!loading && <span className="material-symbols-outlined">rocket_launch</span>}
          </button>
        </form>
      )}

      {/* PDF Upload */}
      {mode === 'pdf' && (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed #334155' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#8b5cf6', marginBottom: '16px' }}>cloud_upload</span>
          <h3 style={{ fontSize: '22px', fontWeight: 700 }}>Upload PDF for Auto-Ingestion</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>We will extract ISBN, title, and metadata automatically.</p>
          <input type="file" accept=".pdf" style={{ display: 'none' }} id="pdf-upload" onChange={handlePDFUpload} />
          <label htmlFor="pdf-upload" style={{ padding: '16px 32px', background: '#8b5cf6', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Analyzing PDF...' : 'Select PDF File'}
          </label>
        </div>
      )}

      {/* Manual Entry */}
      {mode === 'manual' && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Manual form coming in Phase 2. Use Search for now!
        </div>
      )}

      {/* Results / Preview */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid #334155',
              padding: '32px', display: 'flex', gap: '32px'
            }}
          >
            <div style={{ width: '200px', flexShrink: 0 }}>
              <img
                src={result.cover_url || 'https://via.placeholder.com/200x300/1e293b/8b5cf6?text=No+Cover'}
                alt={result.title}
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>{result.title}</h2>
                <div style={{ background: '#10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                  CONFIDENCE: {(result.confidence_score * 100).toFixed(0)}%
                </div>
              </div>
              <p style={{ fontSize: '18px', color: '#8b5cf6', fontWeight: 600, margin: '0 0 20px' }}>{result.author}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>ISBN-13</label>
                  <div style={{ fontWeight: 600 }}>{result.isbn_13 || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PUBLISHED</label>
                  <div style={{ fontWeight: 600 }}>{result.published_year || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>PAGES</label>
                  <div style={{ fontWeight: 600 }}>{result.pages || 'N/A'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>SOURCE</label>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{result.source}</div>
                </div>
              </div>

              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '15px' }}>
                {result.description?.substring(0, 300)}...
              </p>

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate(`/book/${result.isbn_13 || result.open_lib_id}`)}
                  style={{ padding: '14px 28px', background: 'rgba(139,92,246,0.1)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  View in Catalog
                </button>
                <button
                  onClick={() => { setQuery(''); setResult(null); }}
                  style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#fff', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Add Another
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '16px', color: '#ef4444', textAlign: 'center' }}>
          {error}
        </div>
      )}

    </div>
  );
};
