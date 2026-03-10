import { useState, useEffect, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    if (!done) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [done, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch {
      setError('Reset failed. The link may have expired or is invalid.');
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
          {done ? (
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
                Password updated!
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.65, marginBottom: 24 }}>
                Your password has been reset successfully.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10,
                background: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '0.9375rem', color: '#6366f1', fontWeight: 500,
              }}>
                <Loader2 style={{ width: 16, height: 16, color: '#6366f1' }} className="animate-spin" />
                Redirecting in {countdown}s...
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Set new password
                </h2>
                <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.55 }}>
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
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
                    New Password
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
                      placeholder="New password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

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
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  {passwordsMismatch && (
                    <p style={{ marginTop: 4, fontSize: '0.75rem', color: '#ef4444' }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || passwordsMismatch}
                  className="btn-primary"
                  style={{ padding: '13px 20px', borderRadius: 10, fontSize: '0.9375rem' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
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
