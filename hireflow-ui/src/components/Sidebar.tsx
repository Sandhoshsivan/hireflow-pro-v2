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
  icon: React.ComponentType<{ className?: string }>;
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
      className={`ml-auto shrink-0 min-w-[20px] text-center rounded-full px-[7px] py-px text-[10px] font-bold font-mono leading-tight transition-colors duration-100 ${
        isActive
          ? 'bg-[#1a56db]/10 text-[#1a56db]'
          : 'bg-[#E4E6EC] text-[#9CA3AF]'
      }`}
    >
      {count !== null ? count : '\u2014'}
    </span>
  );
}

/* ─── AI / PRO badge ─── */
function AiBadge() {
  return (
    <span className="ml-auto shrink-0 rounded px-[5px] py-[2px] text-[8px] font-extrabold tracking-wide bg-gradient-to-br from-[#F5F3FF] to-[#EBF2FF] text-[#7C3AED] border border-[#DDD6FE]">
      AI
    </span>
  );
}

function FreeBadge() {
  return (
    <span className="ml-auto shrink-0 rounded px-[5px] py-[2px] text-[8px] font-extrabold tracking-wide bg-[#1a56db]/8 text-[#1a56db] border border-[#1a56db]/15">
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

  // Manual active check for query-string routes
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
      className="group"
    >
      {({ isActive: navIsActive }) => {
        const active = item.to.includes('?') ? isActive : navIsActive;
        return (
          <div
            className={`flex items-center gap-2 px-[10px] py-[7px] rounded-lg text-[13px] font-medium mb-px transition-all duration-100 border-l-2 ${
              active
                ? 'border-l-[#1a56db] bg-[#EBF2FF] text-[#1a56db] font-semibold'
                : 'border-l-transparent text-[#4B5563] hover:text-[#111827] hover:bg-[#EDEEF2]'
            }`}
          >
            <item.icon
              className={`w-[16px] h-[16px] shrink-0 transition-opacity duration-100 ${
                active ? 'opacity-100' : 'opacity-70'
              }`}
            />
            <span className="flex-1 truncate">{item.label}</span>

            {/* Badges */}
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

  // Fetch nav counts
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
      // Silently fail - counts will show dash
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const plan = user?.plan ?? 'free';

  // Plan badge colors
  const planColors: Record<string, { bg: string; text: string; border: string }> = {
    free: { bg: 'bg-[#9CA3AF]/10', text: 'text-[#9CA3AF]', border: 'border-[#D1D5DB]' },
    pro: { bg: 'bg-[#1a56db]/10', text: 'text-[#1a56db]', border: 'border-[#1a56db]/20' },
    premium: { bg: 'bg-[#7C3AED]/10', text: 'text-[#7C3AED]', border: 'border-[#7C3AED]/20' },
  };
  const pc = planColors[plan] ?? planColors.free;

  // Navigation structure
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
      className="w-[236px] min-w-[236px] h-screen flex flex-col shrink-0 border-r border-[#E5E7EB] relative z-10 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%)',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div className="h-16 flex items-center px-4 gap-[10px] border-b border-[#E5E7EB] shrink-0">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1a56db 0%, #7C3AED 100%)',
            boxShadow: '0 2px 8px rgba(26,86,219,.3)',
          }}
        >
          <span className="text-[13px] font-extrabold text-white" style={{ letterSpacing: '-0.5px' }}>
            HF
          </span>
        </div>

        {/* Wordmark */}
        <div className="leading-none">
          <span className="text-[15px] font-extrabold text-[#111827]" style={{ letterSpacing: '-0.4px' }}>
            Hire
          </span>
          <span className="text-[15px] font-extrabold text-[#1a56db]" style={{ letterSpacing: '-0.4px' }}>
            Flow
          </span>
          <span
            className="ml-[3px] text-[8px] font-extrabold text-[#1a56db] rounded px-[5px] py-[2px] align-middle border border-[#1a56db]/15"
            style={{
              background: 'linear-gradient(135deg, #EBF2FF, #F5F3FF)',
              letterSpacing: '0.6px',
            }}
          >
            PRO
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-[10px]"
        style={{ scrollbarWidth: 'thin' }}
      >
        {sections.map((section, si) => (
          <div key={section.label} className={si < sections.length - 1 ? 'mb-[18px]' : ''}>
            {/* Section label */}
            <p
              className={`text-[10px] font-bold uppercase tracking-[1px] px-[10px] mb-[3px] ${
                section.adminOnly ? 'text-[#DC2626]' : 'text-[#9CA3AF]'
              }`}
            >
              {section.label}
            </p>

            {/* Items */}
            <div className="flex flex-col">
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
      <div className="px-2 pb-3 pt-2 border-t border-[#E5E7EB] shrink-0">
        {/* User card */}
        <button
          type="button"
          onClick={() => setLogoutOpen((v) => !v)}
          className="w-full flex items-center gap-[9px] px-[10px] py-2 rounded-[10px] bg-[#EDEEF2] border border-[#E5E7EB] cursor-pointer transition-colors duration-100 hover:bg-[#E4E6EC] text-left"
        >
          {/* Avatar */}
          <div
            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-white text-[12px] font-extrabold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1a56db 0%, #7C3AED 100%)',
              boxShadow: '0 2px 6px rgba(26,86,219,.25)',
            }}
          >
            {initials}
          </div>

          {/* Name + role + plan */}
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#111827] truncate leading-tight">
              {user?.name ?? 'User'}
            </div>
            <div className="flex items-center gap-[5px] mt-[1px]">
              <span className="text-[10px] text-[#9CA3AF] truncate">
                {user?.role === 'admin' ? 'Admin' : 'Job Seeker'}
              </span>
              <span
                className={`text-[8px] font-extrabold uppercase tracking-wide px-[5px] py-px rounded border leading-tight shrink-0 ${pc.bg} ${pc.text} ${pc.border}`}
                style={{ letterSpacing: '0.6px' }}
              >
                {plan}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-3 h-3 text-[#D1D5DB] shrink-0 transition-transform duration-200 ${
              logoutOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Sign out dropdown */}
        {logoutOpen && (
          <div className="pt-[6px]">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-[10px] px-[10px] py-[7px] rounded-lg text-[13px] font-medium text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/15 cursor-pointer transition-colors duration-100 hover:bg-[#FECACA]"
            >
              <LogOut className="w-[15px] h-[15px] shrink-0" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
