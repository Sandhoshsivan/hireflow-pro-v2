import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, CheckCircle, Shield, Zap, Star, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const BRAND_PERKS = [
  { icon: Zap, text: 'Free forever — no credit card needed' },
  { icon: Star, text: 'AI match scoring on every application' },
  { icon: Shield, text: 'Your data stays private and secure' },
];

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: '', color: '#e2e8f0' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw) || pw.length >= 12) score++;
  if (score === 1) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Medium', color: '#f59e0b' };
  return { level: 3, label: 'Strong', color: '#10b981' };
}

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

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#6366f1';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.boxShadow = 'none';
  },
};

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch {
      // error in store
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

        {/* Violet orb — top right */}
        <div style={{
          position: 'absolute',
          top: -140,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Indigo orb — bottom left */}
        <div style={{
          position: 'absolute',
          bottom: -110,
          left: -110,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)',
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
              Your job search,<br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                organized.
              </span>
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.7,
              maxWidth: 340,
            }}>
              Get organized, get insights, get hired. Start tracking your applications in minutes — completely free.
            </p>
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BRAND_PERKS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 15, height: 15, color: '#818cf8' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
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
              "HireFlow Pro helped me track 40+ applications and land offers from 3 companies. The AI matching is incredible."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                S
              </div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>Sarah K.</p>
                <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.3 }}>Software Engineer at Meta</p>
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
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

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
              Create your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Join thousands of professionals landing better jobs
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Full name */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  {...focusHandlers}
                />
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {([1, 2, 3] as const).map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 99,
                          background: strength.level >= i ? strength.color : '#e2e8f0',
                          transition: 'background 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>
                    {strength.label}
                    {strength.level < 2 && ' — try adding numbers or symbols'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : '#e2e8f0',
                  }}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  onFocus={(e) => {
                    if (!passwordsMismatch && !passwordsMatch) {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    if (!passwordsMismatch && !passwordsMatch) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                />
              </div>
              {passwordsMismatch && (
                <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#ef4444' }}>Passwords do not match</p>
              )}
            </div>

            {/* Account type */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Account type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingLeft: '12px',
                  appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="user">Job Seeker</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, paddingTop: 2 }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                style={{ marginTop: 2, width: 15, height: 15, accentColor: '#6366f1', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: '#64748b', cursor: 'pointer', userSelect: 'none', lineHeight: 1.55 }}>
                I agree to the{' '}
                <span style={{ fontWeight: 600, color: '#6366f1' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ fontWeight: 600, color: '#6366f1' }}>Privacy Policy</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || passwordsMismatch}
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
                background: isLoading || passwordsMismatch
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: 8,
                border: 'none',
                cursor: isLoading || passwordsMismatch ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s ease',
                boxShadow: '0 1px 2px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.2)',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !passwordsMismatch) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
