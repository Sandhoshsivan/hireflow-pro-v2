import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Briefcase, Send, Users, HandCoins,
  Kanban, Bot, Download, CreditCard, Crown, Shield, LogOut, Zap,
} from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const SIDEBAR_BG = '#0f172a';

type BadgeType = 'pro' | 'free';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  badge?: BadgeType;
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function SidebarNavItem({ item, isFreePlan }: { item: NavItem; isFreePlan: boolean }) {
  const location = useLocation();

  const isActive = item.to.includes('?')
    ? location.pathname + location.search === item.to ||
      (location.pathname === item.to.split('?')[0] &&
        location.search === '?' + item.to.split('?')[1])
    : item.exact
    ? location.pathname === item.to
    : location.pathname === item.to;

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      style={({ isActive: navIsActive }) => {
        const active = item.to.includes('?') ? isActive : navIsActive;
        return active
          ? {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 10px 7px 13px',
              borderRadius: 7,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#e2e8f0',
              background: 'rgba(99,102,241,0.15)',
              borderLeft: '3px solid #6366f1',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              marginLeft: 0,
            }
          : {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 10px 7px 13px',
              borderRadius: 7,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#94a3b8',
              background: 'transparent',
              borderLeft: '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            };
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        // Only apply hover styles if not active (active has boxShadow via borderLeft)
        if (!el.style.borderLeftColor || el.style.borderLeftColor === 'transparent') {
          el.style.background = 'rgba(255,255,255,0.05)';
          el.style.color = '#cbd5e1';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (!el.style.borderLeftColor || el.style.borderLeftColor === 'transparent') {
          el.style.background = 'transparent';
          el.style.color = '#94a3b8';
        }
      }}
    >
      {({ isActive: navIsActive }) => {
        const active = item.to.includes('?') ? isActive : navIsActive;
        return (
          <>
            <item.icon
              className="shrink-0"
              style={{ width: 15, height: 15, color: active ? '#818cf8' : '#64748b', flexShrink: 0 }}
            />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.badge === 'pro' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                padding: '1px 5px',
                borderRadius: 99,
                fontSize: '0.5625rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                background: 'rgba(139,92,246,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.22)',
                flexShrink: 0,
              }}>
                <Zap style={{ width: 8, height: 8 }} />
                PRO
              </span>
            )}
            {item.badge === 'free' && isFreePlan && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1px 5px',
                borderRadius: 99,
                fontSize: '0.5625rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                background: 'rgba(99,102,241,0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.18)',
                flexShrink: 0,
              }}>
                FREE
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  const isFreePlan = !user?.plan || user.plan === 'free';

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const planBadge: Record<string, { bg: string; color: string }> = {
    free: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
    pro: { bg: 'rgba(99,102,241,0.18)', color: '#818cf8' },
    premium: { bg: 'rgba(139,92,246,0.18)', color: '#a78bfa' },
  };
  const plan = user?.plan ?? 'free';
  const planStyle = planBadge[plan] ?? planBadge.free;

  const sections: NavSection[] = [
    {
      label: 'Overview',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      ],
    },
    {
      label: 'Applications',
      items: [
        { to: '/applications', icon: Briefcase, label: 'All Jobs', exact: true },
        { to: '/applications?status=applied', icon: Send, label: 'Applied' },
        { to: '/applications?status=interview', icon: Users, label: 'Interviews' },
        { to: '/applications?status=offer', icon: HandCoins, label: 'Offers' },
        { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', badge: 'pro' },
        { to: '/export', icon: Download, label: 'Export Data' },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/pricing', icon: Crown, label: 'Upgrade', badge: 'free' },
        { to: '/billing', icon: CreditCard, label: 'Billing' },
      ],
    },
    ...(isAdmin ? [{
      label: 'Admin',
      items: [
        { to: '/admin', icon: Shield, label: 'Admin Panel', exact: true },
        { to: '/admin/users', icon: Users, label: 'Users' },
      ],
    }] : []),
  ];

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        background: SIDEBAR_BG,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Logo area — 64px height */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {/* Icon */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 1px rgba(99,102,241,0.35), 0 2px 8px rgba(99,102,241,0.25)',
          }}>
            <Briefcase style={{ width: 16, height: 16, color: '#fff' }} />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
            <span style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}>HireFlow</span>
            <span style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#6366f1',
              letterSpacing: '-0.02em',
            }}>Pro</span>
          </div>

          {/* v2 badge */}
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.5625rem',
            fontWeight: 700,
            padding: '2px 5px',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            color: '#475569',
            border: '1px solid rgba(255,255,255,0.07)',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>v2</span>
        </div>
      </div>

      {/* User card */}
      <div style={{
        padding: '10px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '9px 10px',
          borderRadius: 9,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Avatar */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}>
            {initials}
          </div>

          {/* Name + plan */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#f1f5f9',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.name ?? 'User'}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: 2,
              fontSize: '0.5625rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '1px 6px',
              borderRadius: 99,
              background: planStyle.bg,
              color: planStyle.color,
            }}>
              {plan}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px 6px',
        scrollbarWidth: 'none',
      }}>
        {sections.map((section, si) => (
          <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 18 : 0 }}>
            {/* Section label */}
            <p style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: '#475569',
              padding: '0 13px',
              marginBottom: 4,
            }}>
              {section.label}
            </p>

            {/* Nav items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map((item) => (
                <SidebarNavItem key={item.to} item={item} isFreePlan={isFreePlan} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div style={{
        padding: '8px 6px 14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 10px 7px 13px',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#64748b',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
