import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const BRAND_FEATURES = [
  { text: 'Track every application in one organized place' },
  { text: 'AI-powered resume and job matching insights' },
  { text: 'Visual pipeline with interview stage tracking' },
];

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
          background: '#111827',
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
          background: 'radial-gradient(circle, rgba(26,86,219,0.22) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(26,86,219,0.16) 0%, transparent 70%)',
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
              background: 'linear-gradient(135deg, #1a56db 0%, #1341B2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(26,86,219,0.4), 0 4px 12px rgba(26,86,219,0.3)',
            }}>
              <Briefcase style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>HireFlow</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1a56db', letterSpacing: '-0.02em' }}>Pro</span>
            </div>
            <span style={{
              marginLeft: 4,
              fontSize: '0.6rem',
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.07)',
              color: '#4B5563',
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
                background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Land your dream job.
              </span>
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#9CA3AF',
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
                  background: 'rgba(26,86,219,0.15)',
                  border: '1px solid rgba(26,86,219,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle style={{ width: 12, height: 12, color: '#60a5fa' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#D1D5DB', lineHeight: 1.5 }}>
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
              color: '#9CA3AF',
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
                background: 'linear-gradient(135deg, #1a56db, #7c3aed)',
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
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', lineHeight: 1.3 }}>Alex M.</p>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.3 }}>Software Engineer at Google</p>
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
              background: 'linear-gradient(135deg, #1a56db 0%, #1341B2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase style={{ width: 17, height: 17, color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              HireFlow<span style={{ color: '#1a56db' }}>Pro</span>
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: '1.625rem',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.025em',
              marginBottom: 6,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
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
              <label className="form-label">
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
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1a56db', textDecoration: 'none' }}
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
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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
                style={{ width: 15, height: 15, accentColor: '#1a56db', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#4B5563', cursor: 'pointer', userSelect: 'none' }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 2 }}
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
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4B5563' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#1a56db', textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
