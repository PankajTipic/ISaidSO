import { useState, useEffect } from 'react';
import { Users, Search, X, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { getAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';

interface User {
    id: number; 
    name: string; 
    email: string; 
    username: string;
    role: string; 
    is_blocked: boolean; 
    avatar_url?: string;
}

interface PaginatedData<T> { 
    data: T[]; 
    current_page: number; 
    last_page: number; 
    total: number; 
}

export default function UsersTab() {
    const [users, setUsers] = useState<PaginatedData<User> | null>(null);
    const [loading, setLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

    // Confirm Dialog
    const [confirmAction, setConfirmAction] = useState<{
        id: number; 
        name: string; 
        currentBlocked: boolean;
    } | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const loadUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAuth(`/api/admin/users?page=${page}`);
            setUsers(res);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = (users?.data ?? []).filter(u => {
        const q = userSearch.trim().toLowerCase();
        const matchSearch = !q ||
            (u.name ?? '').toLowerCase().includes(q) ||
            (u.username ?? '').toLowerCase().includes(q) ||
            (u.email ?? '').toLowerCase().includes(q);

        const matchStatus =
            userStatusFilter === 'all' ||
            (userStatusFilter === 'blocked' && u.is_blocked) ||
            (userStatusFilter === 'active' && !u.is_blocked);

        return matchSearch && matchStatus;
    });

    const handleToggleBlock = async (userId: number) => {
        if (!confirmAction) return;
        setConfirmLoading(true);
        try {
            const res = await postAuth(`/api/admin/users/${userId}/block`);
            toast.success(res.message || 'Action completed');
            loadUsers(users?.current_page || 1); // Refresh current page
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setConfirmLoading(false);
            setConfirmAction(null);
        }
    };


    const PaginationControls = () => {
    if (!users || users.last_page <= 1) return null;

    return (
        <div className="mt-6 flex justify-center items-center gap-3">
            <Button
                variant="outline"
                disabled={users.current_page === 1 || loading}
                onClick={() => loadUsers(users.current_page - 1)}
            >
                ← Previous
            </Button>

            <span className="text-sm text-slate-600 px-4">
                Page <strong>{users.current_page}</strong> of{' '}
                <strong>{users.last_page}</strong>
            </span>

            <Button
                variant="outline"
                disabled={users.current_page === users.last_page || loading}
                onClick={() => loadUsers(users.current_page + 1)}
            >
                Next →
            </Button>
        </div>
    );
};

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">User Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">{users?.total ?? '—'} total registered users</p>
            </div>

            <div className="p-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Search name, username or email…"
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
                        />
                        {userSearch && (
                            <button 
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" 
                                onClick={() => setUserSearch('')}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                        {(['all', 'active', 'blocked'] as const).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setUserStatusFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                    userStatusFilter === f
                                        ? f === 'blocked' ? 'bg-red-600 text-white border-red-600'
                                        : f === 'active' ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {f === 'all' ? 'All' : f === 'active' ? '✓ Active' : '✕ Blocked'}
                            </button>
                        ))}
                    </div>
                </div>

                {(userSearch || userStatusFilter !== 'all') && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                        <span>Showing <strong className="text-slate-700">{filteredUsers.length}</strong> of <strong className="text-slate-700">{users?.total ?? 0}</strong> users</span>
                        <button 
                            onClick={() => { setUserSearch(''); setUserStatusFilter('all'); }} 
                            className="text-violet-600 hover:underline font-medium"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-y border-slate-100">
                                    <th className="px-4 py-3 text-left">User</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-violet-600">
                                                            {(user.name?.[0] ?? '?').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.name || '—'}</p>
                                                    <p className="text-xs text-slate-400">@{user.username || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                user.role === 'super_admin' ? 'bg-amber-100 text-amber-700' :
                                                user.role === 'admin' ? 'bg-violet-100 text-violet-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {user.role === 'super_admin' ? 'Super Admin' : user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {user.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                                                    <Ban size={10} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                                    <CheckCircle size={10} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setConfirmAction({ 
                                                    id: user.id, 
                                                    name: user.name, 
                                                    currentBlocked: user.is_blocked 
                                                })}
                                                disabled={loading}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                    user.is_blocked 
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                            >
                                                {user.is_blocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-slate-400">
                                            <Search size={28} className="mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">
                                                {userSearch || userStatusFilter !== 'all' 
                                                    ? 'No users match the current filters' 
                                                    : 'No users found'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <PaginationControls />
                    </div>
                )}
            </div>

            {/* Confirm Block/Unblock Dialog */}
            <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
                <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {confirmAction?.currentBlocked ? (
                                <><CheckCircle size={18} className="text-green-600" /> Unblock User</>
                            ) : (
                                <><Ban size={18} className="text-red-600" /> Block User</>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-2 space-y-3">
                        <p className="text-sm text-slate-600">
                            {confirmAction?.currentBlocked ? (
                                <>Unblock <strong className="text-slate-900">{confirmAction.name}</strong>? They will regain full access.</>
                            ) : (
                                <>Block <strong className="text-slate-900">{confirmAction?.name}</strong>?</>
                            )}
                        </p>

                        {!confirmAction?.currentBlocked && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                This will prevent the user from submitting predictions, voting, and other platform activities.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={confirmLoading} 
                            onClick={() => setConfirmAction(null)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            size="sm" 
                            disabled={confirmLoading}
                            className={confirmAction?.currentBlocked 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'}
                            onClick={() => handleToggleBlock(confirmAction!.id)}
                        >
                            {confirmLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}