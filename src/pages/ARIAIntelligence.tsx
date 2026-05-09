import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFIntelligenceService } from '../services/pdf_intelligence';

export const PDFIntelligence: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    // Simulate analysis delay
    const { analysis: result } = await PDFIntelligenceService.processPDF(file, 'default-lib');
    
    // Format mock analysis based on Step 1-5 blueprint
    const mockStepByStep = {
      step1: {
        type: 'Experimental Research Paper',
        problem: 'Inefficiency in single-agent AI pipelines for complex academic research.',
        claim: 'A multi-agent orchestrator reduces cognitive load and hallucination rates by 40%.',
        strength: 'Strong'
      },
      step2: {
        findings: [
          'Parallel decomposition is superior to sequential prompting.',
          'Specialized agent roles prevent context-drift.',
          'Dynamic priority ranking improves student retention.'
        ],
        methodology: 'Randomized controlled trial with 500 PhD students.',
        limitations: 'Limited to technical and scientific domains.'
      },
      step3: {
        brilliance: 'The recursive "Thread of Hands" logic for data lineage.',
        gaps: 'Does not account for non-English source material.',
        alternative: 'Integrate multi-lingual translation agents at Agent 3 layer.'
      },
      step4: {
        citation: 'ARIA Research Group (2024). Autonomous Multi-Agent Orchestration in Academic Systems. Journal of AI Intelligence.',
        relevance: 'HIGH'
      }
    };

    setAnalysis(result || mockStepByStep);
    setIsAnalyzing(false);
  };

  return (
    <div className="pdf-intelligence-container" style={{ padding: '40px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="header" style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>ARIA PDF Intelligence</h2>
        <p style={{ opacity: 0.6 }}>Upload research papers for agentic triage and extraction.</p>
      </div>

      <div style={{ 
        border: '2px dashed rgba(255,255,255,0.1)', 
        borderRadius: '30px', 
        padding: '60px', 
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        marginBottom: '50px'
      }}>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            {file ? file.name : 'Click to select research paper'}
          </div>
          <div style={{ opacity: 0.5, marginTop: '5px' }}>Supports academic PDFs and technical docs</div>
        </label>
        
        {file && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleUpload}
            disabled={isAnalyzing}
            style={{
              marginTop: '30px',
              padding: '15px 40px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAnalyzing ? 'Triage in Progress...' : 'Start Agentic Analysis'}
          </motion.button>
        )}
      </div>

      {analysis && (
        <div className="analysis-results" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={cardStyle}>
            <h4 style={stepTitle}>STEP 1: Rapid Triage</h4>
            <div style={dataItem}><span style={label}>Type:</span> {analysis.step1.type}</div>
            <div style={dataItem}><span style={label}>Core Claim:</span> {analysis.step1.claim}</div>
            <div style={dataItem}><span style={label}>Strength:</span> <span style={{ color: '#10b981' }}>{analysis.step1.strength}</span></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={cardStyle}>
            <h4 style={stepTitle}>STEP 2: Deep Extraction</h4>
            <div style={label}>Key Findings:</div>
            <ul style={{ paddingLeft: '20px', opacity: 0.8 }}>
              {analysis.step2.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
            </ul>
            <div style={dataItem}><span style={label}>Methodology:</span> {analysis.step2.methodology}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
            <h4 style={stepTitle}>STEP 3: Critical Analysis</h4>
            <div style={dataItem}><span style={label}>Brilliant Move:</span> {analysis.step3.brilliance}</div>
            <div style={dataItem}><span style={label}>Blind Spot:</span> {analysis.step3.gaps}</div>
            <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={label}>ARIA Recommendation:</span> {analysis.step3.alternative}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
            <h4 style={stepTitle}>STEP 4: Citation Intelligence</h4>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic', marginBottom: '15px' }}>
              {analysis.step4.citation}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                padding: '5px 15px', 
                background: analysis.step4.relevance === 'HIGH' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: analysis.step4.relevance === 'HIGH' ? '#10b981' : '#f59e0b',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {analysis.step4.relevance} RELEVANCE
              </span>
              <button style={{ color: '#3b82f6', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>
                Add to Research Plan →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '24px',
  padding: '25px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)'
};

const stepTitle: React.CSSProperties = {
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  opacity: 0.5,
  marginBottom: '15px'
};

const dataItem: React.CSSProperties = {
  marginBottom: '10px',
  fontSize: '0.95rem'
};

const label: React.CSSProperties = {
  fontWeight: 700,
  opacity: 0.7,
  marginRight: '8px'
};
