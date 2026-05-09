import React, { useState } from 'react';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';

export const SmartStudy: React.FC = () => {
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  React.useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimer(25 * 60); };

  const formatTime = () => {
    const m = Math.floor(timer / 60).toString().padStart(2, '0');
    const s = (timer % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Smart Study Mode</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Focus Timer */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <h2 style={{ color: '#a1a1aa', margin: '0 0 24px', fontSize: '18px' }}>Deep Work</h2>
          
          <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: `4px solid ${isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 30px rgba(59,130,246,0.5)' : 'none', transition: 'all 0.3s ease' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime()}</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            <button onClick={toggleTimer} style={{ padding: '12px 32px', borderRadius: '8px', background: isActive ? '#ef4444' : '#3b82f6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button onClick={resetTimer} style={{ padding: '12px', borderRadius: '8px', background: 'transparent', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </Card>

        {/* Exam Radar & Study Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>radar</span> Exam Radar
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 8px' }}>CS301: Advanced Algorithms</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#a1a1aa' }}>Midterm in 12 days</p>
                <div style={{ marginTop: '12px', fontSize: '12px' }}>
                  <strong style={{ color: '#3b82f6' }}>AI Recommendation:</strong> Review "Introduction to Algorithms" (Available in catalog).
                </div>
              </div>
            </div>
          </Card>

          <Card>
             <h2 style={{ margin: '0 0 16px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981' }}>groups</span> Active Study Groups
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '16px' }}>Autopilot book clubs based on your courses.</p>
            <button style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
              + Form new AI-guided Study Group
            </button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
