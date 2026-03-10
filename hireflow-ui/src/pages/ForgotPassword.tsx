import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, ArrowLeft, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.resetLink) setResetLink(data.resetLink);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', background: '#f1f5f9',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
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

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 20, padding: 32,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
        }}>
          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
              <div
                className="animate-pop-in"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 68, height: 68, borderRadius: 18, marginBottom: 20,
                  background: 'rgba(16,185,129,0.1)',
                  border: '2px solid rgba(16,185,129,0.2)',
                }}
              >
                <CheckCircle style={{ width: 32, height: 32, color: '#10b981' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Check your email
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.65, marginBottom: 24 }}>
                We've sent a password reset link to{' '}
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{email}</span>.
                Check your inbox and spam folder.
              </p>

              {resetLink && (
                <div style={{
                  padding: '14px 16px', borderRadius: 12, textAlign: 'left', marginBottom: 24,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6366f1' }}>
                    Demo reset link
                  </p>
                  <a
                    href={resetLink}
                    style={{ fontSize: '0.8125rem', color: '#64748b', wordBreak: 'break-all', display: 'flex', alignItems: 'flex-start', gap: 6, textDecoration: 'none' }}
                  >
                    <ExternalLink style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#818cf8' }} />
                    {resetLink}
                  </a>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setEmail(''); setResetLink(''); }}
                className="btn-secondary"
                style={{ width: '100%', padding: '11px 20px', borderRadius: 10 }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Reset your password
                </h2>
                <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.55 }}>
                  Enter your email and we'll send you a secure reset link.
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  fontSize: '0.875rem', color: '#dc2626',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{ padding: '13px 20px', borderRadius: 10, fontSize: '0.9375rem' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.9375rem', fontWeight: 500, color: '#64748b', textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
