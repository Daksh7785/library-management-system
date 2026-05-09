import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const VisualKnowledgeGraph: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch some books and their topics
      const { data: books } = await supabase
        .from('books')
        .select('id, title, category, subjects')
        .limit(15);
      
      if (books) {
        // Create nodes for visualization
        const newNodes = books.map((b, i) => ({
          id: b.id,
          title: b.title,
          category: b.category,
          x: Math.cos(i * 0.5) * 300 + 400,
          y: Math.sin(i * 0.5) * 300 + 400,
        }));
        setNodes(newNodes);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#020617', position: 'relative', overflow: 'hidden', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HUD Header */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Academic Knowledge Graph
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Visualizing semantic connections across 200M+ works</p>
      </div>

      {/* SVG Graph Container */}
      <svg width="100%" height="100%" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Lines (Connections) */}
        {nodes.map((node, i) => (
          <line
            key={`line-${i}`}
            x1="400" y1="400"
            x2={node.x} y2={node.y}
            stroke="rgba(139,92,246,0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Central Hub */}
        <circle cx="400" cy="400" r="10" fill="#0ea5e9" filter="drop-shadow(0 0 10px #0ea5e9)" />

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <circle
              cx={node.x} cy={node.y} r="6"
              fill="#8b5cf6"
              style={{ cursor: 'pointer' }}
            />
            <text
              x={node.x + 10} y={node.y + 4}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="600"
              style={{ pointerEvents: 'none' }}
            >
              {node.title.substring(0, 20)}...
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid #1e293b' }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, marginBottom: '12px' }}>GRAPH LEGEND</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />
          <span style={{ fontSize: '13px' }}>Academic Work</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }} />
          <span style={{ fontSize: '13px' }}>Universal Topic</span>
        </div>
      </div>

    </div>
  );
};
