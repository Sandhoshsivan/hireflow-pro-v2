import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  Shield,
  Ban,
  CheckCircle,
  Crown,
  Mail,
  Calendar,
  Briefcase,
} from 'lucide-react';
import clsx from 'clsx';
import TopBar from '../../components/TopBar';
import api from '../../lib/api';
import { useToastStore } from '../../components/Toast';
import type { User } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users ?? data ?? []);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [search, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleActive = async (user: User) => {
    try {
      await api.put(`/admin/users/${user.id}`, { isActive: !user.isActive });
      addToast('success', `User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...user, isActive: !user.isActive });
      }
    } catch {
      addToast('error', 'Failed to update user');
    }
  };

  const changePlan = async (userId: number, plan: string) => {
    try {
      await api.put(`/admin/users/${userId}`, { plan });
      addToast('success', `Plan changed to ${plan}`);
      fetchUsers();
    } catch {
      addToast('error', 'Failed to change plan');
    }
  };

  const changeRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      addToast('success', `Role changed to ${role}`);
      fetchUsers();
    } catch {
      addToast('error', 'Failed to change role');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('success', 'User deleted');
      if (selectedUser?.id === userId) setSelectedUser(null);
      fetchUsers();
    } catch {
      addToast('error', 'Failed to delete user');
    }
  };

  const planBadgeColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    pro: 'bg-blue-100 text-blue-700',
    premium: 'bg-violet-100 text-violet-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Manage Users" subtitle={`${users.length} total users`} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Plan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Joined
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Apps
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                        planBadgeColors[user.plan] ?? 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        user.isActive ? 'text-emerald-600' : 'text-red-500'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          user.isActive ? 'bg-emerald-500' : 'bg-red-500'
                        )}
                      />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 text-right font-medium">
                    {user.applicationCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-medium capitalize">{selectedUser.plan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Role:</span>
                  <span className="font-medium capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Joined:</span>
                  <span className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Apps:</span>
                  <span className="font-medium">{selectedUser.applicationCount ?? 0}</span>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Change Plan
                  </label>
                  <select
                    value={selectedUser.plan}
                    onChange={(e) => changePlan(selectedUser.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Change Role
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => changeRole(selectedUser.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleActive(selectedUser)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      selectedUser.isActive
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    )}
                  >
                    {selectedUser.isActive ? (
                      <>
                        <Ban className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteUser(selectedUser.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
