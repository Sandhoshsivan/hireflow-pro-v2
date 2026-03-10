import { Check, Crown } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';
import type { PlanConfig } from '../types';

const plans: PlanConfig[] = [
  {
    name: 'free',
    price: 0,
    maxApplications: 10,
    features: [
      'Track up to 10 applications',
      'Basic status tracking',
      'Simple dashboard',
      'Email support',
    ],
  },
  {
    name: 'pro',
    price: 9.99,
    maxApplications: 100,
    recommended: true,
    features: [
      'Track up to 100 applications',
      'Advanced analytics',
      'AI job matching',
      'CSV export',
      'Priority support',
      'Timeline tracking',
    ],
  },
  {
    name: 'premium',
    price: 19.99,
    maxApplications: -1,
    features: [
      'Unlimited applications',
      'Full AI assistant',
      'Advanced analytics & reports',
      'API access',
      'Team collaboration',
      'Dedicated support',
      'Custom integrations',
    ],
  },
];

export default function Pricing() {
  const { user, fetchProfile } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleUpgrade = async (plan: string) => {
    try {
      await api.post('/payments/subscribe', { plan });
      await fetchProfile();
      addToast('success', `Upgraded to ${plan} plan`);
    } catch {
      addToast('error', 'Failed to change plan');
    }
  };

  return (
    <div>
      <TopBar title="Pricing" subtitle="Choose the plan that fits your needs" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.name;
          return (
            <div
              key={plan.name}
              className={clsx(
                'bg-white rounded-xl border shadow-sm p-6 relative transition-shadow hover:shadow-md',
                plan.recommended
                  ? 'border-blue-300 ring-2 ring-blue-100'
                  : 'border-slate-200'
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Crown className={clsx('w-5 h-5', plan.name === 'premium' ? 'text-violet-500' : plan.name === 'pro' ? 'text-blue-500' : 'text-slate-400')} />
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{plan.name}</h3>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-slate-500">/month</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {plan.maxApplications === -1
                    ? 'Unlimited applications'
                    : `Up to ${plan.maxApplications} applications`}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.name)}
                disabled={isCurrent}
                className={clsx(
                  'w-full py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                )}
              >
                {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
