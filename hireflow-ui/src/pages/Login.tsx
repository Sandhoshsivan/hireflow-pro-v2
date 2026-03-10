import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const BRAND_FEATURES = [
  { text: 'Track every application in one organized place' },
  { text: 'AI-powered resume and job matching insights' },
  { text: 'Visual pipeline with interview stage tracking' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px 10px 42px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // error is set in store
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* LEFT PANEL — 45% dark branding */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          minHeight: '100vh',
          background: '#0f172a',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Dot grid texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        {/* Indigo orb — top left */}
        <div style={{
          position: 'absolute',
          top: -140,
          left: -140,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Violet orb — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: -110,
          right: -110,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 72 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 4px 12px rgba(99,102,241,0.3)',
            }}>
              <Briefcase style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>HireFlow</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.02em' }}>Pro</span>
            </div>
            <span style={{
              marginLeft: 4,
              fontSize: '0.6rem',
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.07)',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.08)',
              letterSpacing: '0.04em',
            }}>v2</span>
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: 52 }}>
            <h1 style={{
              fontSize: 'clamp(1.875rem, 3vw, 2.625rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}>
              Track every application.<br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Land your dream job.
              </span>
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: 340,
            }}>
              The intelligent job application tracker built for ambitious professionals. Stay organized, stay ahead.
            </p>
          </div>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BRAND_FEATURES.map(({ text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle style={{ width: 12, height: 12, color: '#818cf8' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial quote */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: '20px 22px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              fontStyle: 'italic',
              marginBottom: 16,
            }}>
              "HireFlow Pro transformed my job search. I went from scattered spreadsheets to landing my dream role at Google in 6 weeks."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                A
              </div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>Alex M.</p>
                <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.3 }}>Software Engineer at Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — 55% white form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div
            className="flex lg:hidden"
            style={{ alignItems: 'center', gap: 8, marginBottom: 36, justifyContent: 'center' }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase style={{ width: 17, height: 17, color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              HireFlow<span style={{ color: '#6366f1' }}>Pro</span>
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              marginBottom: 6,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              marginBottom: 20,
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}>
              <span style={{ flex: 1, fontSize: '0.875rem', color: '#dc2626', lineHeight: 1.5 }}>{error}</span>
              <button
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626',
                  fontSize: '1rem',
                  lineHeight: 1,
                  opacity: 0.7,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email field */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 6,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#64748b',
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6366f1', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '11px 20px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                background: isLoading
                  ? 'rgba(99,102,241,0.7)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: 8,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease, transform 0.1s ease',
                boxShadow: '0 1px 2px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.2)',
                marginTop: 2,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
