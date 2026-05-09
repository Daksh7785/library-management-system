import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockHeatmapData = [
  { time: '08:00', load: 20, predict: 25 },
  { time: '10:00', load: 65, predict: 70 },
  { time: '12:00', load: 85, predict: 90 },
  { time: '14:00', load: 75, predict: 80 },
  { time: '16:00', load: 50, predict: 55 },
  { time: '18:00', load: 40, predict: 45 },
  { time: '20:00', load: 30, predict: 35 },
];

export const CampusIntelligence: React.FC = () => {
  return (
    <div className="campus-intel-container" style={{ padding: '40px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Campus Intelligence System</h2>
          <p style={{ opacity: 0.6 }}>Real-time predictive analytics and cognitive load monitoring.</p>
        </div>
        <div style={{ padding: '15px 25px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '15px', color: '#10b981', fontWeight: 700 }}>
          SYSTEM STATUS: OPTIMAL
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Predictive Heatmap */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>📉 Resource Load Prediction</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockHeatmapData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" />
                <Area type="monotone" dataKey="predict" stroke="#8b5cf6" strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '15px' }}>
            Dashed line represents ARIA's prediction for peak study hours based on upcoming exam schedules.
          </p>
        </div>

        {/* Cognitive Load Monitor */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>🧠 Student Cognitive Load</h3>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Average Focus Duration</span>
              <span style={{ color: '#60a5fa' }}>42m</span>
            </div>
            <div style={progressBg}><div style={{ ...progressFill, width: '65%', background: '#3b82f6' }}></div></div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Knowledge Retention Rate</span>
              <span style={{ color: '#10b981' }}>88%</span>
            </div>
            <div style={progressBg}><div style={{ ...progressFill, width: '88%', background: '#10b981' }}></div></div>
          </div>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: '#f59e0b' }}>⚠️ ARIA ADVISORY</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              Peak cognitive load detected in CS Block. Suggesting 15-minute "Neuro-Refresh" breaks to all active students.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
        <div style={statCard}>
          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>CAMPUS VIBE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Productive 🚀</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>COLLABORATION INDEX</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>High (9.2)</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>ACTIVE PEER MATCHES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>142</div>
        </div>
      </div>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '24px',
  padding: '30px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)'
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 700,
  marginBottom: '20px'
};

const progressBg: React.CSSProperties = {
  height: '8px',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px'
};

const statCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '20px',
  padding: '20px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  textAlign: 'center'
};
