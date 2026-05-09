import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedBackground3D } from '../components/AnimatedBackground3D';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, signup, loginWithProvider } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signup(name, email, password);
      // Always redirect to verify-email page after signup (Supabase sends confirmation email)
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      console.error('Signup error:', err);
      let message = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      if (message.includes('already registered') || message.includes('already exists') || message.includes('User already registered')) {
        message = 'This email is already registered. Try signing in instead.';
      } else if (message.includes('Password should be') || message.includes('weak')) {
        message = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(message);
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '16px 16px 16px 48px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid #334155',
    borderRadius: '14px', color: '#f8fafc', fontSize: '15px',
    outline: 'none', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', background: '#0f172a',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Branding */}
      <div style={{
        width: '50%', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRight: '1px solid #334155', position: 'relative', overflow: 'hidden'
      }}>
        {/* 3D Background */}
        <AnimatedBackground3D />
        
        {/* Content overlaid on 3D */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '80px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.5)' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>library_books</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>SmartLibrary</span>
            </div>
            <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
              Join the<br/><span style={{ color: '#0ea5e9' }}>Revolution.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#e2e8f0', lineHeight: 1.7, maxWidth: '400px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              Create your account today and gain unlimited access to a world of curated knowledge.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            {['verified_user', 'auto_stories', 'insights'].map((icon, i) => (
              <div key={i} style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: i === 1 ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)'
              }}>
                <span className="material-symbols-outlined" style={{ color: i === 1 ? '#0ea5e9' : '#fff', fontSize: '32px' }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '40px' }}>Register your profile to start exploring.</p>

          {error && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>person</span>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoComplete="name" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>mail</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" autoComplete="email" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '20px' }}>lock</span>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'} onBlur={(e) => e.target.style.borderColor = '#334155'} />
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Must be at least 6 characters</p>
            </div>

            <button type="submit" disabled={isLoading} style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff',
              fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: isLoading ? 0.6 : 1, boxShadow: '0 8px 24px rgba(14,165,233,0.3)'
            }}>
              {isLoading ? 'Creating...' : 'Create Account'}
              {!isLoading && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>how_to_reg</span>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px' }}>or signup with</span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          </div>

          {/* Social Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => loginWithProvider('google')}
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
            <button 
              type="button"
              onClick={() => loginWithProvider('apple')}
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

          <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '14px', color: '#94a3b8' }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );
};
