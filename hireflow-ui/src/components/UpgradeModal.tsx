import { create } from 'zustand';
import { X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeState {
  isOpen: boolean;
  requiredPlan: string;
  show: (plan: string) => void;
  hide: () => void;
}

export const useUpgradeStore = create<UpgradeState>((set) => ({
  isOpen: false,
  requiredPlan: 'pro',
  show: (plan) => set({ isOpen: true, requiredPlan: plan }),
  hide: () => set({ isOpen: false }),
}));

export default function UpgradeModal() {
  const { isOpen, requiredPlan, hide } = useUpgradeStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Upgrade Required</h2>
          </div>
          <button onClick={hide} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          This feature requires the{' '}
          <span className="font-semibold text-violet-600 capitalize">{requiredPlan}</span> plan.
          Upgrade now to unlock all premium features.
        </p>
        <div className="flex gap-3">
          <button
            onClick={hide}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              hide();
              navigate('/pricing');
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}
