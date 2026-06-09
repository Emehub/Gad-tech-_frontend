'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

const ROLES = ['', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: () => api.get('/admin/users', { params: { page, limit: 15, search: search || undefined, role: role || undefined } }).then((r) => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/admin/users/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User updated'); },
    onError: () => toast.error('Failed to update user'),
  });

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-xl text-gray-900">Customers ({meta?.total ?? 0})</h2>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-green-500" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none bg-white">
          {ROLES.map((r) => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Orders</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400 truncate max-w-50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", {
                      'bg-green-100 text-green-700': user.role === 'SUPER_ADMIN',
                      'bg-purple-100 text-purple-700': user.role === 'ADMIN',
                      'bg-gray-100 text-gray-600': user.role === 'CUSTOMER',
                    })}>
                      {user.role === 'SUPER_ADMIN' && <ShieldCheck size={10} className="inline mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700">{user._count?.orders ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => toggleActive.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={toggleActive.isPending}
                        className={cn("flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40", user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100')}
                      >
                        {user.isActive ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !isLoading && <div className="text-center py-12 text-gray-400">No users found</div>}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
          <div className="flex gap-2">
            <button disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
