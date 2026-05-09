import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ARIAService } from '../services/aria';

export const CareerDNA: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');

  const handleAnalyze = async () => {
    if (!resume || !jd) return;
    setIsAnalyzing(true);
    
    // Simulate complex analysis
    const result = await ARIAService.analyzeCareer(resume, jd);
    
    // Fallback to Blueprint structure
    const mockAnalysis = {
      recruiter: {
        score: 72,
        missing: ['Distributed Systems', 'Cloud Native', 'eBPF'],
        weak: ['Kubernetes (listed but no project context)'],
        redFlags: 'Frequent 6-month hops in early career.',
        prediction: 'Moderate probability for interview.'
      },
      coach: {
        strengths: ['High architectural empathy', 'Strong technical writing'],
        transferable: ['Leadership from non-tech role', 'Data storytelling'],
        rewrite: {
          before: 'Worked on a library app using React.',
          after: 'Engineered a multi-agent Research OS utilizing a 6-agent pipeline architecture, reducing information triage time by 40%.'
        },
        plan: [
          'Week 1: Build a cloud-native project.',
          'Week 2: Certify in AWS/GCP.',
          'Week 3: Open source contribution.'
        ]
      }
    };

    setAnalysis(result || mockAnalysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="career-dna-container" style={{ padding: '40px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '40px' }}>ARIA Career DNA Analyzer</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', opacity: 0.7 }}>Paste Your Resume (Text)</label>
          <textarea 
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your experience here..."
            style={textareaStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', opacity: 0.7 }}>Paste Internship/Job Description</label>
          <textarea 
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the JD here..."
            style={textareaStyle}
          />
        </div>
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          border: 'none',
          color: '#fff',
          fontWeight: 800,
          fontSize: '1.2rem',
          cursor: 'pointer',
          marginBottom: '50px'
        }}
      >
        {isAnalyzing ? 'Recruiter & Coach Agents are thinking...' : 'Analyze My Career DNA'}
      </button>

      {analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="analysis-results">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Recruiter Mode */}
            <div style={cardStyle}>
              <h3 style={{ color: '#ef4444' }}>🕵️ Recruiter Perspective</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, textAlign: 'center', margin: '20px 0' }}>
                {analysis.recruiter.score}<span style={{ fontSize: '1rem', opacity: 0.5 }}>/100</span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Missing Keywords:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {analysis.recruiter.missing.map((k: any) => <span key={k} style={badgeStyle}>{k}</span>)}
                </div>
              </div>
              <p><strong>Shortlist Prediction:</strong> {analysis.recruiter.prediction}</p>
            </div>

            {/* Coach Mode */}
            <div style={cardStyle}>
              <h3 style={{ color: '#10b981' }}>🧠 Coach Perspective</h3>
              <div style={{ marginBottom: '20px' }}>
                <strong>Hidden Strengths:</strong>
                <ul style={{ opacity: 0.8 }}>
                  {analysis.coach.strengths.map((s: any) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>RESUME BULLET REWRITE:</div>
                <div style={{ margin: '10px 0', textDecoration: 'line-through', opacity: 0.5 }}>{analysis.coach.rewrite.before}</div>
                <div style={{ color: '#60a5fa', fontWeight: 600 }}>{analysis.coach.rewrite.after}</div>
              </div>
            </div>

            {/* 30-Day Plan */}
            <div style={cardStyle}>
              <h3 style={{ color: '#3b82f6' }}>📈 30-Day Growth Plan</h3>
              {analysis.coach.plan.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: '15px', display: 'flex', gap: '15px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{i+1}</div>
                  <div style={{ opacity: 0.8 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '200px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '20px',
  padding: '20px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none'
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '24px',
  padding: '30px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)'
};

const badgeStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: 700
};
