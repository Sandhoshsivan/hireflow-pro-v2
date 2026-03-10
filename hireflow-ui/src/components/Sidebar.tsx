import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Briefcase, Send, Users, HandCoins,
  Kanban, Bot, Download, CreditCard, Crown, Shield, LogOut, Zap,
} from 'lucide-react';
import { useAuthStore } from '../lib/auth';

const SIDEBAR_BG = '#0c1220';

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
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#ffffff',
              background: 'rgba(99,102,241,0.12)',
              boxShadow: 'inset 3px 0 0 #6366f1',
              textDecoration: 'none',
              transition: 'background 0.15s, box-shadow 0.15s',
            }
          : {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#64748b',
              background: 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
            };
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (!el.style.boxShadow) {
          el.style.background = 'rgba(255,255,255,0.04)';
          el.style.color = '#94a3b8';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (!el.style.boxShadow) {
          el.style.background = 'transparent';
          el.style.color = '#64748b';
        }
      }}
    >
      {({ isActive: navIsActive }) => {
        const active = item.to.includes('?') ? isActive : navIsActive;
        return (
          <>
            <item.icon
              className="shrink-0"
              style={{ width: 16, height: 16, color: active ? '#818cf8' : '#475569' }}
            />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.badge === 'pro' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                padding: '1px 6px', borderRadius: 99,
                fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.04em',
                background: 'rgba(139,92,246,0.18)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.25)',
              }}>
                <Zap style={{ width: 9, height: 9 }} />
                PRO
              </span>
            )}
            {item.badge === 'free' && isFreePlan && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '1px 6px', borderRadius: 99,
                fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.04em',
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.2)',
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
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Briefcase style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>HireFlow</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.02em' }}>Pro</span>
          </div>
          <span style={{
            marginLeft: 'auto', fontSize: '0.625rem', fontWeight: 600,
            padding: '1px 5px', borderRadius: 4,
            background: 'rgba(255,255,255,0.07)',
            color: '#475569',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>v2</span>
        </div>
      </div>

      {/* User card */}
      <div style={{ padding: '12px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name ?? 'User'}
            </p>
            <span style={{
              display: 'inline-block', marginTop: 2,
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
              padding: '0px 6px', borderRadius: 99,
              background: planStyle.bg, color: planStyle.color,
            }}>
              {plan}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {sections.map((section, si) => (
          <div key={section.label} style={{ marginBottom: si < sections.length - 1 ? 20 : 0 }}>
            <p style={{
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#334155', padding: '0 12px', marginBottom: 4,
            }}>
              {section.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map((item) => (
                <SidebarNavItem key={item.to} item={item} isFreePlan={isFreePlan} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: '0.8125rem', fontWeight: 500, color: '#475569',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
