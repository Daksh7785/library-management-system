import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground3D } from '../components/AnimatedBackground3D';
import { supabase } from '../lib/supabase';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  useEffect(() => {
    // Optional: Check if we actually have a session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired recovery link. Please request a new one.');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        width: '50%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRight: '1px solid #334155', position: 'relative', overflow: 'hidden'
      }}>
        <AnimatedBackground3D />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '80px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.5)' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>lock_reset</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AcademicOS</span>
            </div>
            <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px' }}>
              Secure Your<br/><span style={{ color: '#8b5cf6' }}>Access.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#e2e8f0', lineHeight: 1.7, maxWidth: '400px' }}>
              Enter a new, strong password to secure your institutional account.
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>New Password</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px' }}>Update your secret key to continue.</p>

          {error && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          {success ? (
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '32px' }}>check</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Password Updated!</h3>
              <p style={{ color: '#a7f3d0', fontSize: '15px', marginBottom: '24px' }}>Redirecting you to the dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>lock</span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    style={{
                      width: '100%', padding: '16px 16px 16px 48px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                      borderRadius: '14px', color: '#f8fafc', fontSize: '15px',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>lock_clock</span>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                    style={{
                      width: '100%', padding: '16px 16px 16px 48px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                      borderRadius: '14px', color: '#f8fafc', fontSize: '15px',
                      outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '16px', borderRadius: '12px', background: '#8b5cf6', color: '#fff',
                fontSize: '16px', fontWeight: 700, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(139,92,246,0.3)'
              }}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
