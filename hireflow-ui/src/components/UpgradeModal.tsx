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
  const price = requiredPlan === 'premium' ? '$19' : '$9';
  const isPremium = requiredPlan === 'premium';
  const accentGradient = isPremium
    ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
    : 'linear-gradient(135deg, #6366f1, #4f46e5)';
  const accentColor = isPremium ? '#7c3aed' : '#6366f1';
  const accentBg = isPremium ? '#ede9fe' : '#eef2ff';
  const accentShadow = isPremium
    ? '0 4px 16px rgba(124,58,237,0.35)'
    : '0 4px 16px rgba(99,102,241,0.35)';

  return (
    <div className="modal-overlay open" onClick={hide}>
      <div
        className="modal"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div
          className="modal-header"
          style={{
            background: accentGradient,
            borderBottom: 'none',
            padding: '28px 28px 24px',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
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
          <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginTop: 6 }}>
            This feature requires a higher plan. Upgrade now to unlock it.
          </p>
        </div>

        {/* Features */}
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 99, flexShrink: 0,
                  background: accentBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check style={{ width: 11, height: 11, color: accentColor }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              background: accentGradient,
              boxShadow: accentShadow,
              justifyContent: 'center',
            }}
            onClick={() => {
              hide();
              window.location.href = '/pricing';
            }}
          >
            <Zap style={{ width: 16, height: 16 }} />
            Upgrade for {price}/mo
          </button>
          <button
            className="btn btn-secondary"
            onClick={hide}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
