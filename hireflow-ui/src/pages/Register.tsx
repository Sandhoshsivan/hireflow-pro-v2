import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Shield, Zap, Star, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const BRAND_PERKS = [
  { icon: Zap, text: 'Free forever — no credit card needed' },
  { icon: Star, text: 'AI match scoring on every application' },
  { icon: Shield, text: 'Your data stays private and secure' },
];

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: '', color: '#E5E7EB' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw) || pw.length >= 12) score++;
  if (score === 1) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Medium', color: '#f59e0b' };
  return { level: 3, label: 'Strong', color: '#10b981' };
}

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

        {/* Violet orb — top right */}
        <div style={{
          position: 'absolute',
          top: -140,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.2) 0%, transparent 70%)',
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
              Your job search,<br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                organized.
              </span>
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#9CA3AF',
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
                  background: 'rgba(26,86,219,0.12)',
                  border: '1px solid rgba(26,86,219,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 15, height: 15, color: '#60a5fa' }} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#D1D5DB', lineHeight: 1.5 }}>
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
              color: '#9CA3AF',
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
                background: 'linear-gradient(135deg, #7c3aed, #1a56db)',
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
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB', lineHeight: 1.3 }}>Sarah K.</p>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.3 }}>Software Engineer at Meta</p>
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
              Create your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
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
              <label className="form-label">
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#9CA3AF', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#9CA3AF', pointerEvents: 'none',
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

            {/* Password */}
            <div>
              <label className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#9CA3AF', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                          background: strength.level >= i ? strength.color : '#E5E7EB',
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
              <label className="form-label">
                Confirm password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  width: 15, height: 15, color: '#9CA3AF', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: 42,
                    borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : undefined,
                  }}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {passwordsMismatch && (
                <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#ef4444' }}>Passwords do not match</p>
              )}
            </div>

            {/* Account type */}
            <div>
              <label className="form-label">
                Account type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select"
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
                style={{ marginTop: 2, width: 15, height: 15, accentColor: '#1a56db', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: '#4B5563', cursor: 'pointer', userSelect: 'none', lineHeight: 1.55 }}>
                I agree to the{' '}
                <span style={{ fontWeight: 600, color: '#1a56db' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ fontWeight: 600, color: '#1a56db' }}>Privacy Policy</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || passwordsMismatch}
              className="btn-primary"
              style={{ width: '100%', marginTop: 4 }}
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
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4B5563' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#1a56db', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
