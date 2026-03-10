import { useEffect, useState } from 'react';
import { CreditCard, Crown } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import type { Payment } from '../types';

export default function Billing() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appCount, setAppCount] = useState(0);

  const planLimits: Record<string, number> = { free: 10, pro: 100, premium: 999 };
  const limit = planLimits[user?.plan ?? 'free'] ?? 10;

  useEffect(() => {
    const load = async () => {
      try {
        const [payRes, statsRes] = await Promise.all([
          api.get('/payments'),
          api.get('/applications/stats'),
        ]);
        setPayments(payRes.data ?? []);
        setAppCount(statsRes.data?.total ?? 0);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const usagePct = Math.min((appCount / limit) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Billing" subtitle="Manage your subscription and payments" />

      {/* Current Plan Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Crown className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Current Plan</h3>
            <p className="text-lg font-bold text-slate-900 capitalize">{user?.plan ?? 'Free'}</p>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500">Applications used</span>
            <span className="font-medium text-slate-700">
              {appCount} / {limit === 999 ? 'Unlimited' : limit}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-500' : 'bg-blue-500'
              )}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Payment History
          </h3>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No payment history</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Description
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Plan
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Amount
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-900">
                    {p.description || 'Subscription payment'}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 capitalize">{p.plan}</td>
                  <td className="px-6 py-3 text-sm text-slate-900 text-right font-medium">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={clsx(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        p.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
