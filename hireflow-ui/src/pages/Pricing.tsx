import { useState } from 'react';
import { Check, X, Crown, Zap, Star, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

interface PlanDef {
  key: string;
  name: string;
  price: number;
  period: string;
  tagline: string;
  badge?: { label: string };
  highlighted: boolean;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  icon: React.ReactNode;
  ctaLabel: string;
  ctaStyle: React.CSSProperties;
  features: Array<{ text: string; included: boolean }>;
}

const plans: PlanDef[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    tagline: 'Get started with the basics',
    highlighted: false,
    accentColor: '#64748b',
    accentBg: '#f8fafc',
    accentBorder: '#e2e8f0',
    icon: <Star className="w-5 h-5 text-slate-500" />,
    ctaLabel: 'Get Started',
    ctaStyle: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
    features: [
      { text: 'Up to 20 applications', included: true },
      { text: 'Basic status tracking', included: true },
      { text: 'Simple dashboard', included: true },
      { text: 'Email support', included: true },
      { text: 'Pipeline view', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'AI Assistant', included: false },
      { text: 'CSV Export', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 9.99,
    period: 'per month',
    tagline: 'For serious job seekers',
    badge: { label: 'Most Popular' },
    highlighted: true,
    accentColor: '#6366f1',
    accentBg: '#eef2ff',
    accentBorder: '#c7d2fe',
    icon: <Zap className="w-5 h-5 text-indigo-600" />,
    ctaLabel: 'Upgrade to Pro',
    ctaStyle: {
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    },
    features: [
      { text: 'Unlimited applications', included: true },
      { text: 'Advanced status tracking', included: true },
      { text: 'Pipeline Kanban view', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'AI Assistant (5 queries/day)', included: true },
      { text: 'CSV Export', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 19.99,
    period: 'per month',
    tagline: 'Everything, unlimited',
    badge: { label: 'Best Value' },
    highlighted: false,
    accentColor: '#7c3aed',
    accentBg: '#f5f3ff',
    accentBorder: '#ddd6fe',
    icon: <Crown className="w-5 h-5 text-violet-600" />,
    ctaLabel: 'Upgrade to Premium',
    ctaStyle: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
    },
    features: [
      { text: 'Unlimited applications', included: true },
      { text: 'Advanced status tracking', included: true },
      { text: 'Pipeline Kanban view', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Unlimited AI queries', included: true },
      { text: 'CSV & JSON Export', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated support', included: true },
    ],
  },
];

export default function Pricing() {
  const { user, fetchProfile } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = user?.plan ?? 'free';

  const handleUpgrade = async (planKey: string) => {
    if (planKey === currentPlan) return;
    setLoadingPlan(planKey);
    try {
      await api.post('/payments/subscribe', { plan: planKey });
      await fetchProfile();
      addToast('success', `Successfully upgraded to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan`);
    } catch {
      addToast('error', 'Failed to change plan. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <TopBar
        title="Plans & Pricing"
        subtitle="Choose the plan that fits your job search"
      />

      {/* Current plan banner */}
      <div
        className="mb-8 flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ background: '#eef2ff', borderColor: '#c7d2fe' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
        <p className="text-sm" style={{ color: '#4338ca' }}>
          You are currently on the{' '}
          <span className="font-semibold capitalize">{currentPlan}</span> plan.
          {currentPlan === 'free' && ' Upgrade to unlock all features.'}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-up">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.key;
          const isLoading = loadingPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={clsx(
                'relative bg-white flex flex-col transition-all duration-200',
                plan.highlighted ? 'scale-[1.03]' : ''
              )}
              style={{
                borderRadius: 16,
                border: `1px solid ${plan.highlighted ? plan.accentColor + '60' : '#e2e8f0'}`,
                boxShadow: plan.highlighted
                  ? `0 8px 30px rgba(99,102,241,0.15), 0 1px 3px rgba(15,23,42,0.08)`
                  : '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
                animationDelay: `${idx * 80}ms`,
              }}
            >
              {/* Most Popular / Best Value ribbon */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                  <span
                    className="text-xs font-bold px-3.5 py-1.5 rounded-full"
                    style={
                      plan.key === 'pro'
                        ? { background: '#6366f1', color: 'white' }
                        : { background: '#ede9fe', color: '#5b21b6' }
                    }
                  >
                    {plan.badge.label}
                  </span>
                </div>
              )}

              {/* Top accent line */}
              {plan.highlighted && (
                <div
                  className="h-1 rounded-t-2xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                />
              )}

              {/* Tinted bg for highlighted */}
              {plan.highlighted && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 60%)' }}
                />
              )}

              <div className="relative p-7 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: plan.accentBg }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>{plan.name}</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black" style={{ color: '#0f172a' }}>
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{plan.period}</span>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                      Billed monthly · Cancel anytime
                    </p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: '#dcfce7' }}
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: '#f1f5f9' }}
                        >
                          <X className="w-2.5 h-2.5 stroke-[3]" style={{ color: '#94a3b8' }} />
                        </div>
                      )}
                      <span
                        className="text-sm"
                        style={{ color: feature.included ? '#334155' : '#94a3b8' }}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl text-sm font-semibold cursor-not-allowed border"
                    style={{ background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      ...plan.ctaStyle,
                      opacity: isLoading ? 0.7 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.ctaLabel
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs mt-10" style={{ color: '#94a3b8' }}>
        All plans include a 14-day free trial on paid features. No credit card required to start.
        Prices in USD.
      </p>
    </div>
  );
}
