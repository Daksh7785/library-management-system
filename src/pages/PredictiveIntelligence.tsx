import React from 'react';
import { Card } from '../components/Card';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const PredictiveIntelligence: React.FC = () => {
  // Mock data for AI predictions since this relies on long-term data tracking
  const decayData = [
    { borrow: 1, score: 95 },
    { borrow: 5, score: 92 },
    { borrow: 10, score: 85 },
    { borrow: 15, score: 78 },
    { borrow: 20, score: 65 },
    { borrow: 25, score: 50 },
    { borrow: 30, score: 20 },
    { borrow: 35, score: 0 }, // predicted
  ];

  const demandData = [
    { month: 'Jan', demand: 120 },
    { month: 'Feb', demand: 150 },
    { month: 'Mar', demand: 200 }, // Midterms
    { month: 'Apr', demand: 180 },
    { month: 'May', demand: 300 }, // Finals
    { month: 'Jun', demand: 80 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Predictive Intelligence</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        <Card>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>Condition Decay Projection</h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>Predicts when a physical copy will reach 0% usability based on historical wear-and-tear patterns.</p>
          
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decayData}>
                <XAxis dataKey="borrow" stroke="#a1a1aa" label={{ value: 'Borrow Count', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#a1a1aa" label={{ value: 'Condition Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff' }} />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>Seasonal Demand Forecast</h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>AI-driven forecast of campus reading volume correlating with academic calendar events.</p>
          
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandData}>
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="demand" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.3)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      <Card style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">smart_toy</span> Smart Reorder Bot
        </h2>
        <p style={{ margin: '0 0 16px', color: '#e4e4e7' }}>Based on predictive models, the following books will hit 0 available copies in the next 14 days and require immediate re-ordering:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>Introduction to Algorithms</strong> by Thomas H. Cormen</span>
            <button style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve P.O.</button>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>The Great Gatsby</strong> by F. Scott Fitzgerald</span>
            <button style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve P.O.</button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
