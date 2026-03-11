import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';
import { useToastStore } from '../components/Toast';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanDef {
  key: string;
  name: string;
  price: number;
  period: string;
  desc: string;
  popular: boolean;
  ctaLabel: string;
  features: PlanFeature[];
}

const plans: PlanDef[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Get started with the basics',
    popular: false,
    ctaLabel: 'Get Started',
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
    desc: 'For serious job seekers',
    popular: true,
    ctaLabel: 'Upgrade to Pro',
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
    desc: 'Everything, unlimited',
    popular: false,
    ctaLabel: 'Upgrade to Premium',
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

const faqs = [
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes, you can cancel at any time. Your plan stays active until the end of the current billing period with no further charges.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data is always safe. If you downgrade to Free, applications beyond the 20-item limit become read-only until you reduce or re-upgrade.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'All paid plans include a 14-day free trial. No credit card required to start — upgrade whenever you\'re ready.',
  },
  {
    q: 'Do you offer team or recruiter plans?',
    a: 'Team plans are on the roadmap. Contact us at support@hireflow.app and we\'ll set you up early.',
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
      await api.post('/billing/checkout', { plan: planKey, successUrl: '/' });
      await fetchProfile();
      addToast('success', `Successfully upgraded to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan`);
    } catch {
      addToast('error', 'Failed to change plan. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlanName = plans.find((p) => p.key === currentPlan)?.name ?? 'Free';

  return (
    <div>
      <TopBar
        title="Plans & Pricing"
        subtitle="Choose the plan that fits your job search"
      />

      <div className="page-content">
        {/* Current plan banner */}
        <div className="plan-banner">
          <span>💼</span>
          <span>
            You are currently on the <strong>{currentPlanName}</strong> plan.
            {currentPlan === 'free' && ' Upgrade to unlock all features.'}
          </span>
        </div>

        {/* 3-column pricing grid */}
        <div className="pricing-grid animate-fade-up">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const isLoading = loadingPlan === plan.key;

            return (
              <div
                key={plan.key}
                className={[
                  'pricing-card',
                  plan.popular ? 'pricing-popular' : '',
                  isCurrent ? 'is-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Most Popular badge — Pro only */}
                {plan.popular && (
                  <div className="pricing-badge-pop">MOST POPULAR</div>
                )}

                {/* Card header */}
                <div className="pricing-header">
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-amount">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </div>
                  {plan.price > 0 && (
                    <div className="pricing-period">{plan.period}</div>
                  )}
                  <div className="pricing-desc">{plan.desc}</div>
                </div>

                {/* Feature list */}
                <div className="pricing-features">
                  {plan.features.map((feature, i) => (
                    <div
                      key={i}
                      className={`pf-item ${feature.included ? 'pf-yes' : 'pf-no'}`}
                    >
                      <span className="pf-icon">
                        {feature.included ? '✓' : '✕'}
                      </span>
                      {feature.text}
                    </div>
                  ))}
                </div>

                {/* CTA footer */}
                <div className="pricing-footer">
                  {isCurrent ? (
                    <button
                      disabled
                      className="btn btn-outline pricing-btn"
                      style={{ opacity: 0.55, cursor: 'not-allowed' }}
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={isLoading}
                      className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} pricing-btn`}
                      style={isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            style={{
                              width: 14,
                              height: 14,
                              animation: 'spin 0.7s linear infinite',
                              display: 'inline-block',
                            }}
                          />
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

        {/* Footnote */}
        <p className="pricing-footnote" style={{ marginTop: 16 }}>
          All plans include a 14-day free trial on paid features. No credit card required to start. Prices in USD.
        </p>

        {/* FAQ section */}
        <div className="faq-section">
          <div className="faq-section-title">Frequently Asked Questions</div>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q">{faq.q}</div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}