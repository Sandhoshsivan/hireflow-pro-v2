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
    period: '/forever',
    desc: 'Get started with basic tracking',
    popular: false,
    ctaLabel: 'Get Started',
    features: [
      { text: 'Up to 5 applications', included: true },
      { text: 'Dashboard overview', included: true },
      { text: 'Status tracking', included: true },
      { text: 'Follow-up reminders', included: true },
      { text: 'AI Career Assistant', included: false },
      { text: 'Advanced Analytics', included: false },
      { text: 'Pipeline / Kanban view', included: false },
      { text: 'CSV Export', included: false },
      { text: 'Contact tracking', included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 9,
    period: '/month',
    desc: 'Everything you need to land your dream job',
    popular: true,
    ctaLabel: 'Upgrade to Pro',
    features: [
      { text: 'Unlimited applications', included: true },
      { text: 'Dashboard overview', included: true },
      { text: 'Status tracking', included: true },
      { text: 'Follow-up reminders', included: true },
      { text: 'AI Career Assistant', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Pipeline / Kanban view', included: true },
      { text: 'CSV Export', included: true },
      { text: 'Contact tracking', included: true },
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 19,
    period: '/month',
    desc: 'For serious job seekers & career changers',
    popular: false,
    ctaLabel: 'Upgrade to Premium',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
      { text: 'Resume review (coming soon)', included: true },
      { text: 'Interview coaching (coming soon)', included: true },
    ],
  },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes! You can downgrade to Free at any time from your billing settings. No questions asked.',
  },
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your data is never deleted. On the Free plan, you can still view all applications but can\'t add new ones beyond the limit.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'The Free plan is your trial! Use it as long as you want. Upgrade when you need more power.',
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
        title="Pricing"
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

        {/* Center text */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>Simple, transparent pricing. Cancel anytime.</span>
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
                  <div className="pricing-price">
                    <span className="pricing-amount">${plan.price}</span>
                    <span className="pricing-period">{plan.period}</span>
                  </div>
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
                      style={
                        isLoading
                          ? { opacity: 0.7, cursor: 'not-allowed' }
                          : plan.key === 'premium'
                          ? { borderColor: 'var(--violet)', color: 'var(--violet)' }
                          : undefined
                      }
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