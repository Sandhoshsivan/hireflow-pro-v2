import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div
      style={{
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 0 #E5E7EB, 0 2px 8px rgba(0,0,0,.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        gap: 16,
        flexShrink: 0,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Title block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: 12,
              color: '#9CA3AF',
              fontWeight: 400,
              lineHeight: 1.5,
              margin: '2px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions -- right-aligned */}
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
