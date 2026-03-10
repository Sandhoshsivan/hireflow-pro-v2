import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Star, Shield, Zap, Loader2 } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9' }}>
      {/* Left form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: '#f1f5f9',
      }}>
        <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420 }}>
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

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.025em' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
              Join thousands of professionals landing better jobs
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                  Full Name
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
                    className="input-field"
                    style={{ paddingLeft: 38 }}
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                  Email
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
                    className="input-field"
                    style={{ paddingLeft: 38 }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Password
              </label>
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
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {([1, 2, 3] as const).map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: 3, borderRadius: 99,
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
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: '#94a3b8', pointerEvents: 'none',
                }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{
                    paddingLeft: 42,
                    borderColor: passwordsMismatch ? '#ef4444' : passwordsMatch ? '#10b981' : '#e2e8f0',
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

            {/* Role */}
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Account type
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                style={{
                  appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
              >
                <option value="user">Job Seeker</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 4 }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                style={{ marginTop: 2, width: 15, height: 15, accentColor: '#6366f1', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: '#64748b', cursor: 'pointer', userSelect: 'none', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ fontWeight: 600, color: '#6366f1' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ fontWeight: 600, color: '#6366f1' }}>Privacy Policy</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || passwordsMismatch}
              className="btn-primary"
              style={{ padding: '13px 20px', borderRadius: 10, fontSize: '0.9375rem', marginTop: 4 }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span style={{ marginLeft: 2 }}>→</span>
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.9375rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right brand panel */}
      <div
        style={{
          width: '45%',
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
        {/* Violet orb top-right */}
        <div style={{
          position: 'absolute', top: -120, right: -120, width: 380, height: 380,
          borderRadius: '50%', opacity: 0.18,
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Indigo orb bottom-left */}
        <div style={{
          position: 'absolute', bottom: -100, left: -100, width: 340, height: 340,
          borderRadius: '50%', opacity: 0.14,
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
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

          <div style={{ marginBottom: 48 }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 800,
              color: '#fff', lineHeight: 1.15, marginBottom: 16,
              letterSpacing: '-0.03em',
            }}>
              Join 10,000+<br />
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                job seekers
              </span>
            </h1>
            <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.65, maxWidth: 320 }}>
              Get organized, get insights, get hired. Start tracking
              your applications in minutes, completely free.
            </p>
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BRAND_PERKS.map(({ icon: Icon, text }) => (
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

        {/* Testimonial */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: '20px 20px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ fontSize: '0.9375rem', color: '#94a3b8', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 16 }}>
              "HireFlow Pro helped me track 40+ applications and land offers from 3 companies. The AI matching is incredible."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              }}>
                S
              </div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Sarah K.</p>
                <p style={{ fontSize: '0.75rem', color: '#475569' }}>Software Engineer at Meta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
