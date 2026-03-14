import { useEffect, useState } from 'react';
import {
  Crown,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Zap,
  Star,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';
import type { Payment } from '../types';

const planConfig: Record<string, {
  label: string;
  planBadgeStyle: React.CSSProperties;
  barColor: string;
  limit: number | 'Unlimited';
  icon: React.ReactNode;
  price: string;
  iconBg: string;
}> = {
  free: {
    label: 'Free',
    planBadgeStyle: { background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border2)' },
    barColor: 'var(--text3)',
    limit: 5,
    icon: <Star size={18} color="var(--text3)" />,
    price: '$0',
    iconBg: 'var(--bg2)',
  },
  pro: {
    label: 'Pro',
    planBadgeStyle: { background: 'var(--blue-lt)', color: 'var(--blue)', border: '1px solid var(--blue-md)' },
    barColor: 'var(--blue)',
    limit: 'Unlimited',
    icon: <Zap size={18} color="var(--blue)" />,
    price: '$9',
    iconBg: 'linear-gradient(135deg, var(--blue-lt), #dbeafe)',
  },
  premium: {
    label: 'Premium',
    planBadgeStyle: { background: 'var(--violet-lt)', color: 'var(--violet)', border: '1px solid var(--violet-md)' },
    barColor: 'var(--violet)',
    limit: 'Unlimited',
    icon: <Crown size={18} color="var(--violet)" />,
    price: '$19',
    iconBg: 'linear-gradient(135deg, var(--violet-lt), var(--violet-md))',
  },
};

const paymentStatusConfig: Record<string, {
  label: string;
  badgeStyle: React.CSSProperties;
  icon: React.ReactNode;
}> = {
  succeeded: {
    label: 'Succeeded',
    badgeStyle: { background: 'var(--green-lt)', color: 'var(--green)', border: '1px solid var(--green-md)' },
    icon: <CheckCircle2 size={11} />,
  },
  completed: {
    label: 'Succeeded',
    badgeStyle: { background: 'var(--green-lt)', color: 'var(--green)', border: '1px solid var(--green-md)' },
    icon: <CheckCircle2 size={11} />,
  },
  failed: {
    label: 'Failed',
    badgeStyle: { background: 'var(--red-lt)', color: 'var(--red)', border: '1px solid var(--red-md)' },
    icon: <AlertCircle size={11} />,
  },
  pending: {
    label: 'Pending',
    badgeStyle: { background: 'var(--amber-lt)', color: 'var(--amber)', border: '1px solid var(--amber-md)' },
    icon: <Clock size={11} />,
  },
};

export default function Billing() {
  const { user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appCount, setAppCount] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const planKey = user?.plan ?? 'free';
  const plan = planConfig[planKey] ?? planConfig.free;
  const limitNum = typeof plan.limit === 'number' ? plan.limit : Infinity;
  const usagePct =
    typeof plan.limit === 'number'
      ? Math.min(Math.round((appCount / limitNum) * 100), 100)
      : Math.min(Math.round((appCount / 9999) * 100) * 5, 100);

  let usageBarColor = plan.barColor;
  if (usagePct >= 100) usageBarColor = 'var(--red)';
  else if (usagePct >= 80) usageBarColor = 'var(--amber)';

  useEffect(() => {
    const load = async () => {
      try {
        const [payRes, statsRes] = await Promise.all([
          api.get('/billing/history'),
          api.get('/applications/stats'),
        ]);
        setPayments(payRes.data ?? []);
        setAppCount(statsRes.data?.totalApplications ?? statsRes.data?.total ?? 0);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { fetchProfile } = useAuthStore();

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) return;
    setCancelling(true);
    try {
      await api.post('/billing/downgrade');
      await fetchProfile(); // Refresh user profile so plan updates in sidebar
      addToast('success', 'Subscription cancelled. You have been moved to the Free plan.');
    } catch {
      addToast('error', 'Failed to cancel subscription. Please contact support.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', margin: '0 auto 12px' }}
            className="animate-spin"
          />
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading billing...</div>
        </div>
      </div>
    );
  }

  const sinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div>
      <TopBar
        title="Billing &amp; Subscription"
        subtitle="Manage your plan and view payment history"
        actions={
          <a href="/pricing" className="btn btn-primary btn-sm">
            View Plans
            <ArrowUpRight size={13} />
          </a>
        }
      />

      <div className="page-content">

        {/* Two-column grid: Current Plan + Payment History */}
        <div className="grid-2 mb-6">

          {/* Current Plan Card */}
          <div className="card animate-fade-up">
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon">📋</span>
                Current Plan
              </span>
              {/* Plan badge inline in header */}
              <span className={`badge badge-${planKey}`}>
                {plan.label}
              </span>
            </div>

            <div className="card-body">
              {/* Plan icon + name + price */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: plan.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {plan.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 2 }}>
                    {plan.label} Plan
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                    Member since {sinceDate}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                    {plan.price}
                    {planKey !== 'free' && (
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)', marginLeft: 4 }}>/month</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage bar */}
              <div
                style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Application usage</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Fira Code', monospace" }}>
                    {appCount.toLocaleString()} / {typeof plan.limit === 'number' ? plan.limit.toLocaleString() : 'Unlimited'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 100, background: 'var(--bg2)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 100,
                      background: usageBarColor,
                      width: `${typeof plan.limit === 'string'
                        ? Math.min((appCount / 100) * 5, 100)
                        : usagePct}%`,
                      transition: 'width 0.7s var(--ease)',
                    }}
                  />
                </div>
                {usagePct >= 80 && typeof plan.limit === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--amber)' }}>
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    You're approaching your plan limit. Consider upgrading.
                  </div>
                )}
              </div>

              {/* Active features */}
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
                {planKey === 'free' ? (
                  <span style={{ color: 'var(--text3)' }}>Upgrade to unlock AI, Analytics, Export & more</span>
                ) : (
                  <>
                    <strong style={{ color: 'var(--text)' }}>Active features:</strong>{' '}
                    {[
                      planKey !== 'free' && 'AI Assistant',
                      planKey !== 'free' && 'Advanced Analytics',
                      planKey !== 'free' && 'CSV Export',
                      planKey !== 'free' && 'Pipeline View',
                      planKey !== 'free' && 'Contact Tracking',
                      planKey === 'premium' && 'Priority Support',
                    ].filter(Boolean).join(', ')}
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href="/pricing"
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  {planKey === 'free' ? 'Upgrade Plan' : planKey === 'pro' ? 'Upgrade to Premium' : 'Current: Premium'}
                </a>
                {planKey !== 'free' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text3)', fontSize: 12 }}
                  >
                    {cancelling ? 'Cancelling...' : 'Downgrade to Free'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment History Card */}
          <div className="card animate-fade-up stagger-2" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon">🧾</span>
                Payment History
              </span>
              {payments.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'Fira Code', monospace" }}>
                  {payments.length} transaction{payments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="empty-state" style={{ flex: 1 }}>
                <div className="empty-icon">
                  <ShoppingBag size={36} color="var(--text3)" strokeWidth={1.5} />
                </div>
                <div className="empty-text">No payment history</div>
                <div className="empty-sub">Your transactions will appear here once you upgrade</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const statusKey = p.status?.toLowerCase() ?? 'pending';
                      const statusCfg = paymentStatusConfig[statusKey] ?? paymentStatusConfig.pending;
                      return (
                        <tr key={p.id}>
                          <td className="td-mono" style={{ whiteSpace: 'nowrap' }}>
                            {new Date(p.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--text2)' }}>
                            {p.description ?? 'Subscription payment'}
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <span className="td-salary">${p.amount.toFixed(2)}</span>{' '}
                            <span className="td-mono" style={{ textTransform: 'uppercase' }}>{p.currency}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge badge-${statusKey}`}>
                              {statusCfg.icon}
                              {statusCfg.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              className="td-mono"
                              style={{ color: 'var(--text4)' }}
                              title="Invoice not available"
                            >
                              —
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stripe info banner */}
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: 13,
            color: 'var(--text2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 16 }}>🔒</div>
          <div>
            <strong>Secure payments powered by Stripe</strong>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              All transactions are encrypted and processed securely. We never store your card details.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}