import { create } from 'zustand';
import { Crown, X, Check, Zap } from 'lucide-react';

interface UpgradeStore {
  isOpen: boolean;
  requiredPlan: string;
  show: (plan?: string) => void;
  hide: () => void;
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  isOpen: false,
  requiredPlan: 'pro',
  show: (plan = 'pro') => set({ isOpen: true, requiredPlan: plan }),
  hide: () => set({ isOpen: false }),
}));

const PLAN_FEATURES: Record<string, string[]> = {
  pro: ['Unlimited applications', 'Pipeline board view', 'Advanced analytics', 'AI Assistant (5/day)', 'CSV & JSON export', 'Priority support'],
  premium: ['Everything in Pro', 'Unlimited AI queries', 'Resume analysis', 'API access', 'Dedicated support', 'Early access to features'],
};

export default function UpgradeModal() {
  const { isOpen, requiredPlan, hide } = useUpgradeStore();
  if (!isOpen) return null;

  const features = PLAN_FEATURES[requiredPlan] ?? PLAN_FEATURES.pro;
  const price = requiredPlan === 'premium' ? '$19.99' : '$9.99';
  const isPremium = requiredPlan === 'premium';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) hide(); }}
    >
      <div
        className="animate-fade-up"
        style={{
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          width: '100%', maxWidth: 440,
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          background: isPremium ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          padding: '28px 28px 24px',
          position: 'relative',
        }}>
          <button
            onClick={hide}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 16,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown style={{ width: 26, height: 26, color: '#fcd34d' }} />
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            This feature requires a higher plan. Upgrade now to unlock it.
          </p>
        </div>

        {/* Features */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                  background: isPremium ? '#ede9fe' : '#eef2ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check style={{ width: 11, height: 11, color: isPremium ? '#7c3aed' : '#6366f1' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              style={{
                width: '100%', padding: '13px 20px',
                background: isPremium ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: isPremium ? '0 4px 16px rgba(124,58,237,0.35)' : '0 4px 16px rgba(99,102,241,0.35)',
              }}
            >
              <Zap style={{ width: 16, height: 16 }} />
              Upgrade for {price}/mo
            </button>
            <button
              onClick={hide}
              style={{
                width: '100%', padding: '11px 20px',
                background: 'transparent', color: '#6b7280',
                border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 500,
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
