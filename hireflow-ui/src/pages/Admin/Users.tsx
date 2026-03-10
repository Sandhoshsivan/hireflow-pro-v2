import { useEffect, useState, useCallback } from 'react';
import {
  Search, X, Shield, Lock, Unlock, Trash2, Eye, Crown,
  Mail, Calendar, Briefcase, Key, ChevronDown, Users,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import { useToastStore } from '../../components/Toast';
import type { User } from '../../types';

const planConfig: Record<string, { label: string; badge: string; dot: string }> = {
  free:    { label: 'Free',    badge: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  pro:     { label: 'Pro',     badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  premium: { label: 'Premium', badge: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
};

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const gradients = [
    'from-indigo-400 to-indigo-600',
    'from-violet-400 to-violet-600',
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
  ];
  const colorIdx = name.charCodeAt(0) % gradients.length;
  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br shrink-0',
        gradients[colorIdx],
        size === 'lg' ? 'w-14 h-14 text-xl rounded-2xl' : 'w-9 h-9 text-xs'
      )}
    >
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      if (blockedOnly) params.set('blocked', 'true');
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users ?? data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, blockedOnly]);

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, [fetchUsers]);

  const withLoading = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBlock = async (user: User) => {
    await withLoading(`block-${user.id}`, async () => {
      try {
        await api.post(`/admin/users/${user.id}/toggle-block`);
        const updated = { ...user, isActive: !user.isActive };
        addToast('success', user.isActive ? `${user.name} blocked` : `${user.name} unblocked`);
        if (selectedUser?.id === user.id) setSelectedUser(updated);
        fetchUsers();
      } catch {
        addToast('error', 'Failed to update user status');
      }
    });
  };

  const toggleAdmin = async (user: User) => {
    await withLoading(`admin-${user.id}`, async () => {
      try {
        await api.post(`/admin/users/${user.id}/toggle-admin`);
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const updated = { ...user, role: newRole };
        addToast('success', `${user.name} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`);
        if (selectedUser?.id === user.id) setSelectedUser(updated);
        fetchUsers();
      } catch {
        addToast('error', 'Failed to change user role');
      }
    });
  };

  const changePlan = async (userId: number, plan: string) => {
    await withLoading(`plan-${userId}`, async () => {
      try {
        await api.put(`/admin/users/${userId}/plan`, { plan });
        if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser!, plan });
        addToast('success', `Plan changed to ${plan}`);
        fetchUsers();
      } catch {
        addToast('error', 'Failed to change plan');
      }
    });
  };

  const resetPassword = async (userId: number) => {
    await withLoading(`pwd-${userId}`, async () => {
      try {
        await api.post(`/admin/users/${userId}/reset-password`);
        addToast('success', 'Password reset email sent');
      } catch {
        addToast('error', 'Failed to send password reset');
      }
    });
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone.`)) return;
    await withLoading(`delete-${user.id}`, async () => {
      try {
        await api.delete(`/admin/users/${user.id}`);
        addToast('success', `${user.name} deleted`);
        if (selectedUser?.id === user.id) setSelectedUser(null);
        fetchUsers();
      } catch {
        addToast('error', 'Failed to delete user');
      }
    });
  };

  const filteredUsers = users.filter((u) => {
    if (blockedOnly && u.isActive) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="Users"
        subtitle={`${filteredUsers.length} registered user${filteredUsers.length !== 1 ? 's' : ''}`}
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none w-56"
              style={{
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#0f172a',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5 animate-fade-up">
        {/* Plan filter */}
        <div className="relative">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="pl-4 pr-8 py-2 rounded-lg text-sm outline-none appearance-none cursor-pointer"
            style={{
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
            }}
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <ChevronDown
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: '#94a3b8' }}
          />
        </div>

        {/* Blocked only toggle */}
        <button
          onClick={() => setBlockedOnly((b) => !b)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
            blockedOnly
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
          style={blockedOnly ? {} : { color: '#475569' }}
        >
          <Lock className="w-3.5 h-3.5" />
          Blocked only
        </button>

        {/* Clear filters */}
        {(search || planFilter || blockedOnly) && (
          <button
            onClick={() => { setSearch(''); setPlanFilter(''); setBlockedOnly(false); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5 animate-fade-up"
        style={{
          boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
          animationDelay: '60ms',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Plan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Apps</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Joined</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        <Users className="w-5 h-5" style={{ color: '#94a3b8' }} />
                      </div>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>No users match your filters</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredUsers.map((user, idx) => {
                const planCfg = planConfig[user.plan] ?? planConfig.free;
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
                            {user.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={clsx(
                          'text-xs font-semibold px-2.5 py-1 rounded-full border capitalize',
                          planCfg.badge
                        )}
                      >
                        {planCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs capitalize" style={{ color: '#94a3b8' }}>{user.role}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        )}
                      >
                        <span
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                          )}
                        />
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-right" style={{ color: '#334155' }}>
                      {user.applicationCount ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:bg-slate-200"
                        style={{ background: '#f1f5f9', color: '#475569' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer */}
          <div
            className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col animate-slide-in-from-right"
          >
            {/* Gradient header */}
            <div
              className="px-6 py-6 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: '#0f172a' }}>User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors"
                  style={{ color: '#64748b' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <UserAvatar name={selectedUser.name} size="lg" />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>{selectedUser.name}</h3>
                  <p className="text-sm" style={{ color: '#64748b' }}>{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={clsx(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                        planConfig[selectedUser.plan]?.badge ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      )}
                    >
                      {planConfig[selectedUser.plan]?.label ?? selectedUser.plan}
                    </span>
                    <span
                      className={clsx(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full',
                        selectedUser.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {selectedUser.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {/* Meta info */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
                  <span className="truncate" style={{ color: '#475569' }}>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
                  <span style={{ color: '#475569' }}>
                    Member since{' '}
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
                  <span style={{ color: '#475569' }}>
                    <span className="font-semibold" style={{ color: '#0f172a' }}>
                      {selectedUser.applicationCount ?? 0}
                    </span>{' '}
                    applications tracked
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Crown className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
                  <span style={{ color: '#475569' }}>
                    Role:{' '}
                    <span className="font-semibold capitalize" style={{ color: '#0f172a' }}>
                      {selectedUser.role}
                    </span>
                  </span>
                </div>
              </div>

              {/* Change Plan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: '#475569' }}>
                  Set Plan
                </label>
                <div className="relative">
                  <select
                    value={selectedUser.plan}
                    onChange={(e) => changePlan(selectedUser.id, e.target.value)}
                    disabled={actionLoading === `plan-${selectedUser.id}`}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none disabled:opacity-50 cursor-pointer"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      color: '#334155',
                    }}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#94a3b8' }}
                  />
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                  Admin Actions
                </p>

                {/* Toggle Admin */}
                <button
                  onClick={() => toggleAdmin(selectedUser)}
                  disabled={actionLoading === `admin-${selectedUser.id}`}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                    selectedUser.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'hover:bg-slate-200'
                  )}
                  style={selectedUser.role === 'admin' ? {} : { background: '#f1f5f9', color: '#475569' }}
                >
                  <Shield className="w-4 h-4" />
                  {selectedUser.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
                  {actionLoading === `admin-${selectedUser.id}` && (
                    <div className="ml-auto w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  )}
                </button>

                {/* Toggle Block */}
                <button
                  onClick={() => toggleBlock(selectedUser)}
                  disabled={actionLoading === `block-${selectedUser.id}`}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                    selectedUser.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  )}
                >
                  {selectedUser.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  {selectedUser.isActive ? 'Block User' : 'Unblock User'}
                  {actionLoading === `block-${selectedUser.id}` && (
                    <div className="ml-auto w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  )}
                </button>

                {/* Reset Password */}
                <button
                  onClick={() => resetPassword(selectedUser.id)}
                  disabled={actionLoading === `pwd-${selectedUser.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 hover:bg-slate-200"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                >
                  <Key className="w-4 h-4" />
                  Reset Password
                  {actionLoading === `pwd-${selectedUser.id}` && (
                    <div className="ml-auto w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  )}
                </button>

                {/* Delete User */}
                <button
                  onClick={() => deleteUser(selectedUser)}
                  disabled={actionLoading === `delete-${selectedUser.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                  {actionLoading === `delete-${selectedUser.id}` && (
                    <div className="ml-auto w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
