import { useEffect } from 'react';
import { create } from 'zustand';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const CONFIG: Record<ToastType, { icon: React.ComponentType<{ style?: React.CSSProperties }>; border: string; icon_color: string }> = {
  success: { icon: CheckCircle, border: '#22c55e', icon_color: '#22c55e' },
  error: { icon: XCircle, border: '#ef4444', icon_color: '#ef4444' },
  warning: { icon: AlertTriangle, border: '#f59e0b', icon_color: '#f59e0b' },
  info: { icon: Info, border: '#6366f1', icon_color: '#6366f1' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(onRemove, 4200);
    return () => clearTimeout(t);
  }, [onRemove]);

  return (
    <div
      className="animate-toast"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: '#fff', borderRadius: 12, padding: '14px 16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${cfg.border}`,
        minWidth: 300, maxWidth: 380,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <Icon style={{ width: 18, height: 18, color: cfg.icon_color, flexShrink: 0, marginTop: 1 }} />
      <p style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', lineHeight: 1.4 }}>
        {toast.message}
      </p>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94a3b8', flexShrink: 0 }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
      {/* Progress bar */}
      <div
        className="animate-shrink"
        style={{
          position: 'absolute', bottom: 0, left: 0, height: 2,
          background: cfg.border, borderRadius: '0 0 0 12px',
          opacity: 0.4,
        }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
