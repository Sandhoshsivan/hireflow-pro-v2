import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Briefcase,
  Send,
  Users,
  HandCoins,
  Kanban,
  Bot,
  Download,
  CreditCard,
  Crown,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../lib/auth';
import { useState } from 'react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-blue-600/20 text-blue-400'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
  );

interface NavSection {
  label: string;
  items: Array<{
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: number;
    adminOnly?: boolean;
  }>;
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Overview: true,
    Applications: true,
    Tools: true,
    Account: true,
    Admin: true,
  });

  const toggleSection = (label: string) =>
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const sections: NavSection[] = [
    {
      label: 'Overview',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      ],
    },
    {
      label: 'Applications',
      items: [
        { to: '/applications', icon: Briefcase, label: 'All Jobs' },
        { to: '/applications?status=applied', icon: Send, label: 'Applied' },
        { to: '/applications?status=interview', icon: Users, label: 'Interviews' },
        { to: '/applications?status=offer', icon: HandCoins, label: 'Offers' },
        { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
        { to: '/export', icon: Download, label: 'Export CSV' },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/pricing', icon: Crown, label: 'Pricing' },
        { to: '/billing', icon: CreditCard, label: 'Billing' },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      label: 'Admin',
      items: [
        { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Manage Users' },
      ],
    });
  }

  const planColors: Record<string, string> = {
    free: 'bg-slate-600',
    pro: 'bg-blue-600',
    premium: 'bg-violet-600',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-blue-400" />
          <span className="text-lg font-bold tracking-tight">HireFlowPro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {sections.map((section) => (
          <div key={section.label} className="mb-3">
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400"
            >
              {section.label}
              <ChevronDown
                className={clsx(
                  'w-3 h-3 transition-transform',
                  !expandedSections[section.label] && '-rotate-90'
                )}
              />
            </button>
            {expandedSections[section.label] && (
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/admin'}>
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? 'User'}</p>
            <div className="flex items-center gap-1.5">
              <span
                className={clsx(
                  'inline-block w-1.5 h-1.5 rounded-full',
                  planColors[user?.plan ?? 'free'] ?? 'bg-slate-600'
                )}
              />
              <span className="text-xs text-slate-500 capitalize">{user?.plan ?? 'free'} plan</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
