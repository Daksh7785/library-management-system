import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const KnowledgeGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Mock nodes for the force-directed graph UI
  const nodes = [
    { id: 1, title: 'The Hobbit', genre: 'Fantasy', x: 200, y: 150, r: 40 },
    { id: 2, title: 'Dune', genre: 'Sci-Fi', x: 350, y: 250, r: 60 },
    { id: 3, title: '1984', genre: 'Dystopia', x: 500, y: 100, r: 50 },
    { id: 4, title: 'Brave New World', genre: 'Dystopia', x: 650, y: 200, r: 45 },
    { id: 5, title: 'Project Hail Mary', genre: 'Sci-Fi', x: 400, y: 400, r: 55 },
    { id: 6, title: 'The Midnight Library', genre: 'Fiction', x: 150, y: 350, r: 35 },
  ];

  const edges = [
    { from: 1, to: 2 },
    { from: 2, to: 5 },
    { from: 3, to: 4 },
    { from: 2, to: 3 },
    { from: 6, to: 1 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Global Knowledge Graph</h1>
      <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Explore how books are connected through shared readers and semantic AI vectors.</p>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {edges.map((e, i) => {
            const n1 = nodes.find(n => n.id === e.from);
            const n2 = nodes.find(n => n.id === e.to);
            if (!n1 || !n2) return null;
            return (
              <line 
                key={i} 
                x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
                stroke={hoveredNode === n1.id || hoveredNode === n2.id ? '#3b82f6' : 'rgba(255,255,255,0.2)'} 
                strokeWidth={hoveredNode === n1.id || hoveredNode === n2.id ? 3 : 1} 
              />
            );
          })}
          
          {nodes.map(n => (
            <g 
              key={n.id} 
              onMouseEnter={() => setHoveredNode(n.id)} 
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              <circle 
                cx={n.x} cy={n.y} r={hoveredNode === n.id ? n.r + 10 : n.r} 
                fill={n.genre === 'Sci-Fi' ? '#8b5cf6' : n.genre === 'Dystopia' ? '#ef4444' : '#10b981'} 
                opacity={hoveredNode === null || hoveredNode === n.id ? 0.8 : 0.3}
              />
              <text 
                x={n.x} y={n.y} 
                fill="#fff" 
                fontSize="12px" 
                fontWeight="bold" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                style={{ pointerEvents: 'none' }}
                opacity={hoveredNode === null || hoveredNode === n.id ? 1 : 0.3}
              >
                {n.title}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Info Overlay */}
        {hoveredNode && (
          <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', width: '300px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>{nodes.find(n => n.id === hoveredNode)?.title}</h3>
            <p style={{ margin: '0 0 16px', color: '#a1a1aa' }}>Genre: {nodes.find(n => n.id === hoveredNode)?.genre}</p>
            <p style={{ margin: 0, fontSize: '14px' }}>This node is strongly connected based on user overlap. 42% of readers who read this also read connected nodes.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
