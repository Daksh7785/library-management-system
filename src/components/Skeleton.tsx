import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton: React.FC<{ width?: string | number, height?: string | number, borderRadius?: string | number, style?: React.CSSProperties }> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  style = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        ...style
      }}
    />
  );
};
