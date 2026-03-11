import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, ArrowLeft, CheckCircle, Loader2, ExternalLink, KeyRound } from 'lucide-react';
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
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
      background: '#111827',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background dot grid */}
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
        top: -180,
        left: -180,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,86,219,0.2) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Violet orb — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: -160,
        right: -160,
        width: 440,
        height: 440,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,86,219,0.15) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Centered content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 36,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1a56db 0%, #1341B2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(26,86,219,0.4), 0 4px 12px rgba(26,86,219,0.3)',
          }}>
            <Briefcase style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>HireFlow</span>
            <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1a56db', letterSpacing: '-0.02em' }}>Pro</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 16,
          padding: '36px 36px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
        }}>
          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              {/* Check icon */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 16,
                marginBottom: 20,
                background: 'rgba(16,185,129,0.08)',
                border: '2px solid rgba(16,185,129,0.18)',
              }}>
                <CheckCircle style={{ width: 30, height: 30, color: '#10b981' }} />
              </div>

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#111827',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>
                Check your email
              </h3>
              <p style={{
                fontSize: '0.9375rem',
                color: '#4B5563',
                lineHeight: 1.65,
                marginBottom: 28,
              }}>
                We sent a password reset link to{' '}
                <span style={{ fontWeight: 600, color: '#111827' }}>{email}</span>.
                Check your inbox and spam folder.
              </p>

              {/* Dev reset link */}
              {resetLink && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  textAlign: 'left',
                  marginBottom: 24,
                  background: 'rgba(26,86,219,0.05)',
                  border: '1px solid rgba(26,86,219,0.14)',
                }}>
                  <p style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    marginBottom: 8,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#1a56db',
                  }}>
                    Demo reset link
                  </p>
                  <a
                    href={resetLink}
                    style={{
                      fontSize: '0.8125rem',
                      color: '#4B5563',
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: '#60a5fa' }} />
                    {resetLink}
                  </a>
                </div>
              )}

              <button
                onClick={() => { setSent(false); setEmail(''); setResetLink(''); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#4B5563',
                  background: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F6F7F9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Icon header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(26,86,219,0.08)',
                border: '1px solid rgba(26,86,219,0.15)',
                marginBottom: 20,
              }}>
                <KeyRound style={{ width: 22, height: 22, color: '#1a56db' }} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: 6,
                  letterSpacing: '-0.02em',
                }}>
                  Reset your password
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6 }}>
                  Enter your email and we'll send you a secure reset link right away.
                </p>
              </div>

              {/* Error alert */}
              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderRadius: 8,
                  marginBottom: 20,
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{ width: '100%' }}
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

        {/* Back to sign in */}
        <div style={{ marginTop: 24 }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4B5563',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#4B5563'; }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
