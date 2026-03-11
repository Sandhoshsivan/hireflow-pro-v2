import { useEffect, useState, useCallback } from 'react';
import {
  Search, X, Shield, Lock, Unlock, Trash2, Eye, Crown,
  Mail, Calendar, Briefcase, Key, ChevronDown, Users,
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import { useToastStore } from '../../components/Toast';
import type { User } from '../../types';

const planLabels: Record<string, string> = {
  free:    'Free',
  pro:     'Pro',
  premium: 'Premium',
};

const planBadgeStyle = (plan: string): React.CSSProperties => {
  if (plan === 'pro')
    return { background: 'var(--blue-lt)', color: 'var(--blue)', border: '1px solid var(--blue-md)' };
  if (plan === 'premium')
    return { background: 'var(--violet-lt)', color: 'var(--violet)', border: '1px solid var(--violet-md)' };
  return { background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border2)' };
};

const avatarGradients = [
  ['#60a5fa', '#2563eb'],
  ['#a78bfa', '#7c3aed'],
  ['#60a5fa', '#2563eb'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#d97706'],
  ['#f87171', '#dc2626'],
];

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const [c1, c2] = avatarGradients[name.charCodeAt(0) % avatarGradients.length];
  const isLg = size === 'lg';
  return (
    <div
      style={{
        width: isLg ? 52 : 34,
        height: isLg ? 52 : 34,
        borderRadius: isLg ? 12 : '50%',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: isLg ? 18 : 12,
        color: 'white',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Spinner({ color = 'var(--text3)' }: { color?: string }) {
  return (
    <div
      className="animate-spin"
      style={{
        marginLeft: 'auto',
        width: 14,
        height: 14,
        border: '2px solid transparent',
        borderTopColor: color,
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
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
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--blue)',
              borderRadius: '50%',
              margin: '0 auto 12px',
            }}
            className="animate-spin"
          />
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading users...</div>
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
          <div className="search-wrap">
            <Search className="search-icon" style={{ width: 14, height: 14 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input-field search-input"
              style={{ width: 220 }}
            />
          </div>
        }
      />

      {/* Filter bar */}
      <div className="filter-bar mb-4">
        {/* Plan filter */}
        <div style={{ position: 'relative' }}>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input-field"
            style={{ width: 140, paddingRight: 32 }}
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <ChevronDown
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 13,
              height: 13,
              color: 'var(--text3)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Blocked only toggle */}
        <button
          onClick={() => setBlockedOnly((b) => !b)}
          className="btn btn-sm"
          style={
            blockedOnly
              ? { background: 'var(--red-lt)', color: 'var(--red)', borderColor: 'rgba(220,38,38,.18)' }
              : { background: 'var(--white)', color: 'var(--text2)', borderColor: 'var(--border)' }
          }
        >
          <Lock style={{ width: 13, height: 13 }} />
          Blocked only
        </button>

        {/* Clear filters */}
        {(search || planFilter || blockedOnly) && (
          <button
            onClick={() => { setSearch(''); setPlanFilter(''); setBlockedOnly(false); }}
            className="btn-ghost btn btn-sm"
          >
            <X style={{ width: 13, height: 13 }} />
            Clear filters
          </button>
        )}
      </div>

      {/* Users table */}
      <div className="card mb-4" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Apps</th>
                <th>Joined</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div
                        className="empty-icon"
                        style={{ fontSize: 32, marginBottom: 10 }}
                      >
                        <Users style={{ width: 32, height: 32, color: 'var(--text3)', margin: '0 auto', display: 'block' }} />
                      </div>
                      <div className="empty-text">No users match your filters</div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => {
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* User column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserAvatar name={user.name} />
                        <div style={{ minWidth: 0 }}>
                          <div className="td-company truncate">{user.name}</div>
                          <div className="td-role truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Plan column */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          ...planBadgeStyle(user.plan),
                          fontFamily: 'inherit',
                          textTransform: 'capitalize',
                        }}
                      >
                        {planLabels[user.plan] ?? user.plan}
                      </span>
                    </td>

                    {/* Role column */}
                    <td>
                      {user.role === 'admin' ? (
                        <span
                          className="badge"
                          style={{
                            background: 'var(--amber-lt)',
                            color: 'var(--amber)',
                            border: '1px solid var(--amber-md)',
                            fontFamily: 'inherit',
                          }}
                        >
                          <Shield style={{ width: 11, height: 11 }} />
                          Admin
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'capitalize' }}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Status column */}
                    <td>
                      <span
                        className="badge"
                        style={
                          user.isActive
                            ? { background: 'var(--green-lt)', color: 'var(--green)', border: '1px solid var(--green-md)', fontFamily: 'inherit' }
                            : { background: 'var(--red-lt)', color: 'var(--red)', border: '1px solid var(--red-md)', fontFamily: 'inherit' }
                        }
                      >
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    {/* Apps column */}
                    <td style={{ textAlign: 'right' }}>
                      <span className="td-mono" style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {user.applicationCount ?? 0}
                      </span>
                    </td>

                    {/* Joined column */}
                    <td>
                      <span className="td-mono">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions column */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                        className="btn btn-sm btn-secondary"
                      >
                        <Eye style={{ width: 13, height: 13 }} />
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
      <div
        className={`drawer-overlay${selectedUser ? ' open' : ''}`}
        onClick={() => setSelectedUser(null)}
      />
      <div className={`drawer${selectedUser ? ' open' : ''}`}>
        {selectedUser && (
          <>
            {/* Gradient header area */}
            <div
              className="drawer-header"
              style={{
                background: 'linear-gradient(135deg, var(--blue-lt) 0%, var(--violet-lt) 100%)',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 16,
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>User Details</span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-ghost btn-icon"
                  style={{ width: 30, height: 30 }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* Avatar + name + email + badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <UserAvatar name={selectedUser.name} size="lg" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                    {selectedUser.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    {selectedUser.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <span
                      className="badge"
                      style={{
                        ...planBadgeStyle(selectedUser.plan),
                        fontFamily: 'inherit',
                        textTransform: 'capitalize',
                      }}
                    >
                      {planLabels[selectedUser.plan] ?? selectedUser.plan}
                    </span>
                    <span
                      className="badge"
                      style={
                        selectedUser.isActive
                          ? { background: 'var(--green-lt)', color: 'var(--green)', border: '1px solid var(--green-md)', fontFamily: 'inherit' }
                          : { background: 'var(--red-lt)', color: 'var(--red)', border: '1px solid var(--red-md)', fontFamily: 'inherit' }
                      }
                    >
                      {selectedUser.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer body */}
            <div className="drawer-body">

              {/* Meta info section */}
              <div className="drawer-section">
                <div className="drawer-section-label">User Info</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Mail style={{ width: 14, height: 14, color: 'var(--text3)', flexShrink: 0 }} />
                    <span className="truncate" style={{ color: 'var(--text2)' }}>{selectedUser.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Calendar style={{ width: 14, height: 14, color: 'var(--text3)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>
                      Member since{' '}
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Briefcase style={{ width: 14, height: 14, color: 'var(--text3)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {selectedUser.applicationCount ?? 0}
                      </span>{' '}
                      applications tracked
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <Crown style={{ width: 14, height: 14, color: 'var(--text3)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>
                      Role:{' '}
                      <span style={{ fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {selectedUser.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Plan section */}
              <div className="drawer-section">
                <div className="drawer-section-label">Set Plan</div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedUser.plan}
                    onChange={(e) => changePlan(selectedUser.id, e.target.value)}
                    disabled={actionLoading === `plan-${selectedUser.id}`}
                    className="input-field"
                    style={{ opacity: actionLoading === `plan-${selectedUser.id}` ? 0.55 : 1 }}
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                  <ChevronDown
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 14,
                      height: 14,
                      color: 'var(--text3)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Admin Actions section */}
              <div className="drawer-section">
                <div className="drawer-section-label">Admin Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {/* Toggle Admin */}
                  <button
                    onClick={() => toggleAdmin(selectedUser)}
                    disabled={actionLoading === `admin-${selectedUser.id}`}
                    className="btn w-full"
                    style={
                      selectedUser.role === 'admin'
                        ? {
                            justifyContent: 'flex-start',
                            background: 'var(--amber-lt)',
                            color: 'var(--amber)',
                            borderColor: 'var(--amber-md)',
                            opacity: actionLoading === `admin-${selectedUser.id}` ? 0.55 : 1,
                          }
                        : {
                            justifyContent: 'flex-start',
                            background: 'var(--bg2)',
                            color: 'var(--text2)',
                            borderColor: 'var(--border)',
                            opacity: actionLoading === `admin-${selectedUser.id}` ? 0.55 : 1,
                          }
                    }
                  >
                    <Shield style={{ width: 15, height: 15, flexShrink: 0 }} />
                    {selectedUser.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
                    {actionLoading === `admin-${selectedUser.id}` && (
                      <Spinner color="currentColor" />
                    )}
                  </button>

                  {/* Toggle Block */}
                  <button
                    onClick={() => toggleBlock(selectedUser)}
                    disabled={actionLoading === `block-${selectedUser.id}`}
                    className="btn w-full"
                    style={
                      selectedUser.isActive
                        ? {
                            justifyContent: 'flex-start',
                            background: 'var(--red-lt)',
                            color: 'var(--red)',
                            borderColor: 'rgba(220,38,38,.18)',
                            opacity: actionLoading === `block-${selectedUser.id}` ? 0.55 : 1,
                          }
                        : {
                            justifyContent: 'flex-start',
                            background: 'var(--green-lt)',
                            color: 'var(--green)',
                            borderColor: 'var(--green-md)',
                            opacity: actionLoading === `block-${selectedUser.id}` ? 0.55 : 1,
                          }
                    }
                  >
                    {selectedUser.isActive
                      ? <Lock style={{ width: 15, height: 15, flexShrink: 0 }} />
                      : <Unlock style={{ width: 15, height: 15, flexShrink: 0 }} />
                    }
                    {selectedUser.isActive ? 'Block User' : 'Unblock User'}
                    {actionLoading === `block-${selectedUser.id}` && (
                      <Spinner color="currentColor" />
                    )}
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={() => resetPassword(selectedUser.id)}
                    disabled={actionLoading === `pwd-${selectedUser.id}`}
                    className="btn w-full"
                    style={{
                      justifyContent: 'flex-start',
                      background: 'var(--bg2)',
                      color: 'var(--text2)',
                      borderColor: 'var(--border)',
                      opacity: actionLoading === `pwd-${selectedUser.id}` ? 0.55 : 1,
                    }}
                  >
                    <Key style={{ width: 15, height: 15, flexShrink: 0 }} />
                    Reset Password
                    {actionLoading === `pwd-${selectedUser.id}` && (
                      <Spinner color="var(--text3)" />
                    )}
                  </button>

                  {/* Delete User */}
                  <button
                    onClick={() => deleteUser(selectedUser)}
                    disabled={actionLoading === `delete-${selectedUser.id}`}
                    className="btn btn-danger w-full"
                    style={{
                      justifyContent: 'flex-start',
                      opacity: actionLoading === `delete-${selectedUser.id}` ? 0.55 : 1,
                    }}
                  >
                    <Trash2 style={{ width: 15, height: 15, flexShrink: 0 }} />
                    Delete User
                    {actionLoading === `delete-${selectedUser.id}` && (
                      <Spinner color="var(--red)" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}