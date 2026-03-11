import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Briefcase, Send, Users, HandCoins,
  Kanban, Bot, Download, CreditCard, Crown, Shield, LogOut, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../lib/auth';
import api from '../lib/api';

/* ─── Types ─── */
interface NavCounts {
  all: number;
  applied: number;
  interview: number;
  offer: number;
}

type BadgeVariant = 'ai' | 'pro' | 'free' | 'count';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  badge?: BadgeVariant;
  countKey?: keyof NavCounts;
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
  adminOnly?: boolean;
}

/* ─── Nav count badge (monospace pill) ─── */
function CountBadge({ count, isActive }: { count: number | null; isActive: boolean }) {
  return (
    <span
      style={{
        marginLeft: 'auto',
        flexShrink: 0,
        minWidth: 22,
        textAlign: 'center',
        borderRadius: 9999,
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 1,
        paddingBottom: 1,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        lineHeight: 1.4,
        transition: 'background 100ms, color 100ms',
        background: isActive ? 'rgba(26,86,219,0.1)' : '#e4e6ec',
        color: isActive ? '#1a56db' : '#9ca3af',
      }}
    >
      {count !== null ? count : '\u2014'}
    </span>
  );
}

/* ─── AI / PRO badge ─── */
function AiBadge() {
  return (
    <span
      style={{
        marginLeft: 'auto',
        flexShrink: 0,
        borderRadius: 4,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 2,
        paddingBottom: 2,
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: '0.5px',
        background: 'linear-gradient(135deg, #f5f3ff, #ebf2ff)',
        color: '#7c3aed',
        border: '1px solid #ddd6fe',
      }}
    >
      AI
    </span>
  );
}

function FreeBadge() {
  return (
    <span
      style={{
        marginLeft: 'auto',
        flexShrink: 0,
        borderRadius: 4,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 2,
        paddingBottom: 2,
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: '0.5px',
        background: 'rgba(26,86,219,0.08)',
        color: '#1a56db',
        border: '1px solid rgba(26,86,219,0.15)',
      }}
    >
      FREE
    </span>
  );
}

/* ─── Single nav item ─── */
function SidebarNavItem({
  item,
  isFreePlan,
  counts,
}: {
  item: NavItem;
  isFreePlan: boolean;
  counts: NavCounts | null;
}) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const isActive = item.to.includes('?')
    ? location.pathname + location.search === item.to ||
      (location.pathname === item.to.split('?')[0] &&
        location.search === '?' + item.to.split('?')[1])
    : item.exact
    ? location.pathname === item.to
    : location.pathname === item.to;

  const count = item.countKey && counts ? counts[item.countKey] : null;

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {({ isActive: navIsActive }) => {
        const active = item.to.includes('?') ? isActive : navIsActive;
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              marginBottom: 1,
              transition: 'all 100ms ease',
              borderLeft: active ? '2px solid #1a56db' : '2px solid transparent',
              background: active ? '#EBF2FF' : hovered ? '#EDEEF2' : 'transparent',
              color: active ? '#1a56db' : hovered ? '#0f172a' : '#4B5563',
              cursor: 'pointer',
            }}
          >
            <item.icon
              style={{
                width: 18,
                height: 18,
                flexShrink: 0,
                opacity: active ? 1 : 0.7,
                transition: 'opacity 100ms',
              }}
            />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>

            {item.badge === 'count' && (
              <CountBadge count={count} isActive={active} />
            )}
            {item.badge === 'ai' && <AiBadge />}
            {item.badge === 'free' && isFreePlan && <FreeBadge />}
          </div>
        );
      }}
    </NavLink>
  );
}

/* ─── Main Sidebar ─── */
export default function Sidebar() {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [counts, setCounts] = useState<NavCounts | null>(null);

  const isFreePlan = !user?.plan || user.plan === 'free';

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/counts');
      setCounts({
        all: data.total ?? data.all ?? 0,
        applied: data.applied ?? 0,
        interview: data.interview ?? data.interviews ?? 0,
        offer: data.offer ?? data.offers ?? 0,
      });
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const plan = user?.plan ?? 'free';

  const planColors: Record<string, { bg: string; text: string; border: string }> = {
    free: { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', border: '#d1d5db' },
    pro: { bg: 'rgba(26,86,219,0.1)', text: '#1a56db', border: 'rgba(26,86,219,0.2)' },
    premium: { bg: 'rgba(124,58,237,0.1)', text: '#7c3aed', border: 'rgba(124,58,237,0.2)' },
  };
  const pc = planColors[plan] ?? planColors.free;

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
        { to: '/applications', icon: Briefcase, label: 'All Jobs', exact: true, badge: 'count', countKey: 'all' },
        { to: '/applications?status=applied', icon: Send, label: 'Applied', badge: 'count', countKey: 'applied' },
        { to: '/applications?status=interview', icon: Users, label: 'Interviews', badge: 'count', countKey: 'interview' },
        { to: '/applications?status=offer', icon: HandCoins, label: 'Offers', badge: 'count', countKey: 'offer' },
        { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', badge: 'ai' },
        { to: '/export', icon: Download, label: 'Export CSV' },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/pricing', icon: Crown, label: 'Pricing', badge: 'free' },
        { to: '/billing', icon: CreditCard, label: 'Billing' },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Admin',
            adminOnly: true,
            items: [
              { to: '/admin', icon: Shield, label: 'Admin Dashboard', exact: true },
              { to: '/admin/users', icon: Users, label: 'Manage Users' },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      style={{
        width: 236,
        minWidth: 236,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #E5E7EB',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)',
            boxShadow: '0 2px 8px rgba(26,86,219,0.3)',
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            HF
          </span>
        </div>

        <div style={{ lineHeight: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
            Hire
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a56db', letterSpacing: '-0.4px' }}>
            Flow
          </span>
          <span
            style={{
              marginLeft: 4,
              fontSize: 8,
              fontWeight: 800,
              color: '#1a56db',
              borderRadius: 9999,
              paddingLeft: 6,
              paddingRight: 6,
              paddingTop: 2,
              paddingBottom: 2,
              verticalAlign: 'middle',
              border: '1px solid rgba(26,86,219,0.15)',
              background: 'linear-gradient(135deg, #ebf2ff, #f5f3ff)',
              letterSpacing: '0.6px',
            }}
          >
            PRO
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 12,
          paddingBottom: 12,
          scrollbarWidth: 'thin' as const,
        }}
      >
        {sections.map((section, si) => (
          <div key={section.label}>
            {/* Section label */}
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                paddingLeft: 12,
                paddingRight: 12,
                marginBottom: 6,
                marginTop: si === 0 ? 0 : 20,
                color: section.adminOnly ? '#dc2626' : '#9CA3AF',
                lineHeight: 1,
              }}
            >
              {section.label}
            </p>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  item={item}
                  isFreePlan={isFreePlan}
                  counts={counts}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User card + Sign out ── */}
      <div
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 12,
          paddingTop: 10,
          borderTop: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setLogoutOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px',
            borderRadius: 10,
            background: '#EDEEF2',
            border: '1px solid #E5E7EB',
            cursor: 'pointer',
            transition: 'background 100ms',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E4E6EC'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EDEEF2'; }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 800,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)',
              boxShadow: '0 2px 6px rgba(26,86,219,0.25)',
            }}
          >
            {initials}
          </div>

          {/* Name + role + plan */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              {user?.name ?? 'User'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span
                style={{
                  fontSize: 10,
                  color: '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.role === 'admin' ? 'Admin' : 'Job Seeker'}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  paddingLeft: 5,
                  paddingRight: 5,
                  paddingTop: 1,
                  paddingBottom: 1,
                  borderRadius: 4,
                  border: `1px solid ${pc.border}`,
                  background: pc.bg,
                  color: pc.text,
                  lineHeight: 1.4,
                  flexShrink: 0,
                }}
              >
                {plan}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            style={{
              width: 12,
              height: 12,
              color: '#d1d5db',
              flexShrink: 0,
              transition: 'transform 200ms',
              transform: logoutOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Sign out dropdown */}
        {logoutOpen && (
          <div style={{ paddingTop: 6 }}>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid rgba(220,38,38,0.15)',
                cursor: 'pointer',
                transition: 'background 100ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fecaca'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
            >
              <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
