import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading, children, disabled, style, ...props }) => {
  const base: React.CSSProperties = {
    padding: '12px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
    opacity: disabled || isLoading ? 0.6 : 1
  };

  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: '#8b5cf6', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' },
    outline: { ...base, background: 'transparent', color: '#f8fafc', border: '1px solid #334155' }
  };

  return (
    <button style={{ ...styles[variant], ...style }} disabled={disabled || isLoading} {...props}>
      {isLoading && <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>refresh</span>}
      {children}
    </button>
  );
};
