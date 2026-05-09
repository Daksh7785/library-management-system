import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground3D } from '../components/AnimatedBackground3D';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await verifyEmail(email, code);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', background: '#0f172a',
      fontFamily: "'Inter', sans-serif"
    }}>
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
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.5)' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>verified_user</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Security</span>
            </div>
            <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px' }}>
              Verify Your<br/><span style={{ color: '#0ea5e9' }}>Identity.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#e2e8f0', lineHeight: 1.7, maxWidth: '400px' }}>
              We've sent a 6-digit secure code to your email. Enter it to activate your portal access.
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Enter Code</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px' }}>Sent to {email}</p>

          {error && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>6-Digit OTP</label>
              <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" 
                style={{
                  width: '100%', padding: '16px', textAlign: 'center', letterSpacing: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                  borderRadius: '14px', color: '#f8fafc', fontSize: '24px', fontWeight: 600,
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: isLoading ? 0.6 : 1, boxShadow: '0 8px 24px rgba(14,165,233,0.3)'
            }}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <button onClick={() => navigate('/login')} style={{ width: '100%', marginTop: '16px', background: 'transparent', border: '1px solid #334155', padding: '12px', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer' }}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
