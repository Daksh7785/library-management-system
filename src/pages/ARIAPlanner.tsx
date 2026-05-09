import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARIAService, ARIAResponse } from '../services/aria';

const AGENTS = [
  { id: 'decomposer', name: 'Agent 1: Decomposer', desc: 'Breaking topic into atomic units...' },
  { id: 'ranker', name: 'Agent 2: Priority Ranker', desc: 'Calculating impact & difficulty scores...' },
  { id: 'strategist', name: 'Agent 3: Source Strategist', desc: 'Mapping academic & practical resources...' },
  { id: 'architect', name: 'Agent 4: Knowledge Architect', desc: 'Building dependency maps...' },
  { id: 'planner', name: 'Agent 5: Weekly Plan Generator', desc: 'Generating 4-week adaptive path...' },
  { id: 'scout', name: 'Agent 6: Innovation Scout', desc: 'Identifying research gaps & novel ideas...' }
];

export const ARIAPlanner: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [result, setResult] = useState<ARIAResponse | null>(null);

  const handlePlan = async () => {
    if (!topic) return;
    setIsPlanning(true);
    setCurrentAgentIndex(0);
    setResult(null);

    // Orchestration Animation Loop
    for (let i = 0; i < AGENTS.length; i++) {
      setCurrentAgentIndex(i);
      await new Promise(r => setTimeout(r, 1200)); // Dramatic pause for "thinking"
    }

    const data = await ARIAService.planResearch(topic);
    setResult(data);
    setIsPlanning(false);
    setCurrentAgentIndex(-1);
  };

  return (
    <div className="aria-planner-container" style={{ padding: '40px', color: '#fff' }}>
      <div className="header" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          ARIA Research OS
        </motion.h1>
        <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>PhD-Level Autonomous Research Orchestration</p>
      </div>

      <div className="search-box" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '60px' }}>
        <div style={{ position: 'relative', display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Enter research topic (e.g. 'Quantum Computing in Medicine')" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              flex: 1,
              padding: '20px 30px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '1.1rem',
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />
          <button 
            onClick={handlePlan}
            disabled={isPlanning}
            style={{
              padding: '0 40px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isPlanning ? 'Orchestrating...' : 'Plan Research'}
          </button>
        </div>
      </div>

      {isPlanning && (
        <div className="orchestration-overlay" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {AGENTS.map((agent, idx) => (
            <motion.div 
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: idx <= currentAgentIndex ? 1 : 0.3,
                x: 0,
                scale: idx === currentAgentIndex ? 1.05 : 1
              }}
              style={{
                background: idx === currentAgentIndex ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                padding: '15px 25px',
                borderRadius: '15px',
                border: idx === currentAgentIndex ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: idx < currentAgentIndex ? '#10b981' : idx === currentAgentIndex ? '#3b82f6' : '#334155',
                boxShadow: idx === currentAgentIndex ? '0 0 15px #3b82f6' : 'none'
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{agent.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{agent.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {result && !isPlanning && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results-grid" 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}
        >
          {/* Knowledge Map Visualization */}
          <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <h3 style={titleStyle}>🧠 Knowledge Dependency Map</h3>
            <div style={{ position: 'relative', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="rgba(96, 165, 250, 0.5)" />
                  </marker>
                </defs>
                {result.knowledge_map.edges.map((edge: any, i: number) => {
                  const from = result.knowledge_map.nodes.find((n: any) => n.id === edge.from);
                  const to = result.knowledge_map.nodes.find((n: any) => n.id === edge.to);
                  if (!from || !to) return null;
                  return (
                    <line 
                      key={i}
                      x1={`${(parseInt(from.id) * 30)}%`} 
                      y1="50%" 
                      x2={`${(parseInt(to.id) * 30)}%`} 
                      y2="50%" 
                      stroke="rgba(96, 165, 250, 0.3)" 
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                  );
                })}
              </svg>
              <div style={{ display: 'flex', gap: '80px', zIndex: 1 }}>
                {result.knowledge_map.nodes.map((node: any) => (
                  <motion.div 
                    key={node.id}
                    whileHover={{ scale: 1.1 }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      padding: '15px 25px',
                      borderRadius: '15px',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    {node.label}
                  </motion.div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.85rem', opacity: 0.5, textAlign: 'center' }}>
              This map identifies the critical prerequisite flow identified by the Knowledge Architect Agent.
            </div>
          </div>

          {/* Executive Summary */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>📜 Executive Summary</h3>
            <p style={{ opacity: 0.8, lineHeight: 1.6 }}>{result.executive_summary}</p>
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 700 }}>Confidence Score: </span>
              <span style={{ color: '#60a5fa' }}>{result.confidence_score}</span>
            </div>
          </div>

          {/* 4-Week Plan */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>📅 Adaptive 4-Week Plan</h3>
            {Object.entries(result.four_week_plan).map(([week, desc]: any) => (
              <div key={week} style={{ marginBottom: '15px', borderLeft: '2px solid #3b82f6', paddingLeft: '15px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.5 }}>{week}</div>
                <div style={{ fontSize: '0.95rem' }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Priority Subtopics */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>⚖️ Priority Matrix</h3>
            {result.priority_subtopics.map((sub, idx) => (
              <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{sub.name}</span>
                  <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{sub.time}h total</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.impact * 10}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #c084fc)' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '4px' }}>
                  Difficulty: {sub.difficulty}/10 • Prerequisite: {sub.pre}
                </div>
              </div>
            ))}
          </div>

          {/* Innovation Hooks */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>🚀 Innovation Scout</h3>
            {result.innovation_opportunities.map((opp, idx) => (
              <div key={idx} style={{ 
                padding: '15px', 
                background: 'rgba(192, 132, 252, 0.1)', 
                borderRadius: '12px', 
                marginBottom: '10px',
                border: '1px solid rgba(192, 132, 252, 0.2)'
              }}>
                {opp}
              </div>
            ))}
            <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '0.9rem', opacity: 0.7 }}>
              Next Step: {result.next_prompt_suggestion}
            </div>
          </div>
        </motion.div>
      )}
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
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};
