import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground3D } from '../components/AnimatedBackground3D';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { isAuthenticated, user, login, demoLogin, loginWithProvider } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      // Navigation is handled by useEffect above
    } catch (err: any) {
      let message = err?.message || 'Failed to sign in.';
      if (message.includes('Email not confirmed')) {
        message = 'Please confirm your email address before signing in. Check your inbox.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      }
      setError(message);
      setIsLoading(false);
    }
  };

  const handleProvider = async (provider: 'google' | 'apple') => {
    try {
      await loginWithProvider(provider);
    } catch (err: any) {
      setError(`${provider} login failed. Please try again or use email.`);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: '#0f172a',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Branding Panel */}
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRight: '1px solid #334155',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* <AnimatedBackground3D /> */}
        
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '80px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139,92,246,0.5)'
              }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>school</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>AcademicOS</span>
            </div>

            <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              The Global<br/>
              <span style={{ color: '#8b5cf6' }}>Academy.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#e2e8f0', lineHeight: 1.7, maxWidth: '400px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              A unified ecosystem for students, teachers, and researchers to thrive through connected knowledge.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Portal Access</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px' }}>Enter your institutional credentials to continue.</p>

          {error && (
            <div style={{
              padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                Academic Email
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>mail</span>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                    borderRadius: '14px', color: '#f8fafc', fontSize: '15px',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Secret Key
                </label>
                <a onClick={() => navigate('/forgot-password')} style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', textDecoration: 'none', cursor: 'pointer' }}>
                  Recovery
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '16px 48px 16px 48px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
                    borderRadius: '14px', color: '#f8fafc', fontSize: '15px',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: isLoading ? '#4c1d95' : '#8b5cf6',
                color: '#fff', fontSize: '16px', fontWeight: 700, border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
                marginBottom: '20px'
              }}
            >
              {isLoading ? 'Verifying...' : 'Enter Academy'}
            </button>

            {/* Demo Bypass */}
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#1e293b' }} />
              <span style={{ position: 'relative', background: '#0f172a', padding: '0 12px', color: '#64748b', fontSize: '13px' }}>INSTITUTIONAL BYPASS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
              <button type="button" onClick={() => demoLogin('student')}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Demo Student
              </button>
              <button type="button" onClick={() => demoLogin('teacher')}
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Demo Teacher
              </button>
              <button type="button" onClick={() => demoLogin('admin')}
                style={{ gridColumn: '1 / -1', padding: '12px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                System Admin (Master Access)
              </button>
            </div>
          </form>

          {/* OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          </div>

          {/* OAuth Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => handleProvider('google')}
              style={{
                flex: 1, padding: '12px', border: '1px solid #334155', borderRadius: '12px',
                background: 'transparent', color: '#f8fafc', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '18px', height: '18px' }} />
              Google
            </button>
            <button type="button" onClick={() => handleProvider('apple')}
              style={{
                flex: 1, padding: '12px', border: '1px solid #334155', borderRadius: '12px',
                background: 'transparent', color: '#f8fafc', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>smartphone</span>
              Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '36px', fontSize: '14px', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} style={{ fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              Create one free
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
