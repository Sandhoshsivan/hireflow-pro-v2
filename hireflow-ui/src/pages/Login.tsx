import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Briefcase, TrendingUp, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const BRAND_FEATURES = [
  { icon: TrendingUp, text: 'Track every application in one place' },
  { icon: Users, text: 'AI-powered resume & job matching' },
  { icon: CheckCircle, text: 'Visual pipeline & interview tracking' },
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9' }}>
      {/* Left brand panel */}
      <div
        style={{
          width: '52%',
          minHeight: '100vh',
          background: '#0c1220',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        {/* Indigo orb top-left */}
        <div style={{
          position: 'absolute', top: -120, left: -120, width: 400, height: 400,
          borderRadius: '50%', opacity: 0.18,
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Violet orb bottom-right */}
        <div style={{
          position: 'absolute', bottom: -100, right: -100, width: 360, height: 360,
          borderRadius: '50%', opacity: 0.14,
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>HireFlow</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.02em' }}>Pro</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontSize: 'clamp(2.25rem, 3.5vw, 3rem)', fontWeight: 800,
              color: '#fff', lineHeight: 1.15, marginBottom: 16,
              letterSpacing: '-0.03em',
            }}>
              Land your<br />
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                dream job faster
              </span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.65, maxWidth: 360 }}>
              The most intelligent job application tracker for
              ambitious professionals. Stay organized, stay ahead.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BRAND_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 17, height: 17, color: '#818cf8' }} />
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#cbd5e1' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 99,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}>
            <span style={{ display: 'flex', marginRight: -4 }}>
              {['#6366f1', '#8b5cf6', '#06b6d4'].map((c, i) => (
                <span key={c} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, border: '2px solid #0c1220',
                  marginLeft: i === 0 ? 0 : -6, display: 'inline-block',
                }} />
              ))}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
              Trusted by 10,000+ job seekers worldwide
            </span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: '#f1f5f9',
      }}>
        <div className="animate-fade-up" style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{
            alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
              HireFlow<span style={{ color: '#6366f1' }}>Pro</span>
            </span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.025em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748b', fontWeight: 400 }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <span style={{ flex: 1, fontSize: '0.875rem', color: '#dc2626', lineHeight: 1.5 }}>{error}</span>
              <button
                onClick={clearError}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#dc2626', fontSize: '1.125rem', lineHeight: 1, opacity: 0.6,
                  padding: 0, marginTop: -1,
                }}
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
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
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ padding: '13px 20px', borderRadius: 10, fontSize: '0.9375rem', marginTop: 4 }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span style={{ marginLeft: 2 }}>→</span>
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.9375rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
