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
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '1.5rem', // mb-6
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Title block */}
      <div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              marginTop: '2px',
              fontWeight: 400,
              lineHeight: 1.5,
              margin: '2px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions — right-aligned, vertically centered with title */}
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '16px',
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
