import { useEffect, useState } from 'react';
import {
  Crown,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Zap,
  Star,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';
import type { Payment } from '../types';

const planConfig: Record<string, {
  label: string;
  badge: string;
  barColor: string;
  limit: number | 'Unlimited';
  icon: React.ReactNode;
  price: string;
  iconBg: string;
}> = {
  free: {
    label: 'Free',
    badge: 'bg-slate-100 text-slate-600',
    barColor: '#94a3b8',
    limit: 20,
    icon: <Star className="w-5 h-5 text-slate-400" />,
    price: '$0',
    iconBg: '#f1f5f9',
  },
  pro: {
    label: 'Pro',
    badge: 'bg-indigo-100 text-indigo-700',
    barColor: '#6366f1',
    limit: 500,
    icon: <Zap className="w-5 h-5 text-indigo-600" />,
    price: '$9.99',
    iconBg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  },
  premium: {
    label: 'Premium',
    badge: 'bg-violet-100 text-violet-700',
    barColor: '#8b5cf6',
    limit: 'Unlimited',
    icon: <Crown className="w-5 h-5 text-violet-600" />,
    price: '$19.99',
    iconBg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
  },
};

const paymentStatusConfig: Record<string, {
  label: string;
  badgeStyle: React.CSSProperties;
  icon: React.ReactNode;
}> = {
  succeeded: {
    label: 'Succeeded',
    badgeStyle: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  completed: {
    label: 'Succeeded',
    badgeStyle: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: 'Failed',
    badgeStyle: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
    icon: <AlertCircle className="w-3 h-3" />,
  },
  pending: {
    label: 'Pending',
    badgeStyle: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
    icon: <Clock className="w-3 h-3" />,
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
  if (usagePct >= 100) usageBarColor = '#ef4444';
  else if (usagePct >= 80) usageBarColor = '#f59e0b';

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

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) return;
    setCancelling(true);
    try {
      await api.post('/billing/downgrade');
      addToast('success', 'Subscription cancelled. You have been moved to the Free plan.');
    } catch {
      addToast('error', 'Failed to cancel subscription. Please contact support.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading billing...</p>
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
        title="Billing"
        subtitle="Manage your subscription and payments"
      />

      {/* Current Plan Card */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 animate-fade-up"
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
      >
        {/* Top section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          {/* Plan icon + info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: plan.iconBg }}
            >
              {plan.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                  {plan.label} Plan
                </h3>
                <span className={clsx('text-xs font-semibold px-2.5 py-0.5 rounded-full', plan.badge)}>
                  {plan.label}
                </span>
              </div>
              <p className="text-sm mb-0.5" style={{ color: '#64748b' }}>
                Since {sinceDate}
              </p>
              <p className="text-lg font-bold" style={{ color: '#0f172a' }}>
                {plan.price}
                {planKey !== 'free' && (
                  <span className="text-sm font-normal ml-1" style={{ color: '#94a3b8' }}>/month</span>
                )}
              </p>
            </div>
          </div>

          {/* Right-side action buttons */}
          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
            <a
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            >
              Change Plan
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            {planKey !== 'free' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-xs transition-colors hover:underline disabled:opacity-50"
                style={{ color: '#94a3b8' }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Usage section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-medium" style={{ color: '#475569' }}>Application usage</span>
            <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
              {appCount.toLocaleString()} / {typeof plan.limit === 'number' ? plan.limit.toLocaleString() : 'Unlimited'}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${typeof plan.limit === 'string'
                  ? Math.min((appCount / 100) * 5, 100)
                  : usagePct}%`,
                background: usageBarColor,
              }}
            />
          </div>
          {usagePct >= 80 && typeof plan.limit === 'number' && (
            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#d97706' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              You're approaching your plan limit. Consider upgrading.
            </p>
          )}
        </div>
      </div>

      {/* Payment History Card */}
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-up"
        style={{
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          animationDelay: '80ms',
        }}
      >
        {/* Card header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
          <Receipt className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>Payment History</h3>
          {payments.length > 0 && (
            <span className="ml-auto text-xs" style={{ color: '#94a3b8' }}>
              {payments.length} transaction{payments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {payments.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: '#f1f5f9' }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: '#94a3b8' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#475569' }}>No payment history</p>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                Your transactions will appear here once you upgrade
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Date
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Description
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Amount
                  </th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Status
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => {
                  const statusKey = p.status?.toLowerCase() ?? 'pending';
                  const statusCfg = paymentStatusConfig[statusKey] ?? paymentStatusConfig.pending;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors"
                      style={{ borderBottom: idx < payments.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: '#475569' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#475569' }}>
                        {p.description ?? 'Subscription payment'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-right whitespace-nowrap" style={{ color: '#0f172a' }}>
                        ${p.amount.toFixed(2)}{' '}
                        <span className="text-xs font-normal uppercase" style={{ color: '#94a3b8' }}>
                          {p.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={statusCfg.badgeStyle}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="text-xs select-none"
                          style={{ color: '#cbd5e1' }}
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
  );
}
