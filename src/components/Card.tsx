import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.ComponentProps<typeof motion.div> {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...props }) => {
  return (
    <motion.div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        ...style
      }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
