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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)',
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
            fontSize: 20,
            fontWeight: 700,
            color: '#0f172a',
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
              color: '#94a3b8',
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
