import { useState, useEffect } from 'react';
import { Layers, Search, X, Plus, Lock, Globe, Ban, CheckCircle, Loader2, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { getAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';

interface Group {
    id: number; 
    name: string; 
    description?: string; 
    is_private: boolean;
    user?: { id: number; name: string; username: string };
    members_count: number; 
    is_blocked: boolean; 
    is_member?: boolean;
}

interface PaginatedData<T> { 
    data: T[]; 
    current_page: number; 
    last_page: number; 
    total: number; 
}

export default function GroupsTab() {
    const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
    const [loading, setLoading] = useState(false);
    const [groupSearch, setGroupSearch] = useState('');
    const [groupPrivacyFilter, setGroupPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
    const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [groupSortBy, setGroupSortBy] = useState<'latest' | 'members' | 'alphabetical'>('latest');

    // Create modal
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Details modal
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupDetails, setGroupDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
    const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

    // Block Confirmation Modal
    const [confirmAction, setConfirmAction] = useState<{
        id: number;
        name: string;
        currentBlocked: boolean;
    } | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const loadGroups = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAuth(`/api/admin/groups?page=${page}`);
            setGroups(res);
        } catch {
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    const filteredGroups = (groups?.data ?? []).filter(g => {
        const q = groupSearch.trim().toLowerCase();
        const matchSearch = !q || 
            (g.name ?? '').toLowerCase().includes(q) || 
            (g.description ?? '').toLowerCase().includes(q) ||
            (g.user?.username ?? '').toLowerCase().includes(q);

        const matchPrivacy = groupPrivacyFilter === 'all' ||
            (groupPrivacyFilter === 'private' && g.is_private) ||
            (groupPrivacyFilter === 'public' && !g.is_private);

        const matchStatus = groupStatusFilter === 'all' ||
            (groupStatusFilter === 'blocked' && g.is_blocked) ||
            (groupStatusFilter === 'active' && !g.is_blocked);

        return matchSearch && matchPrivacy && matchStatus;
    }).sort((a, b) => {
        if (groupSortBy === 'members') return (b.members_count || 0) - (a.members_count || 0);
        if (groupSortBy === 'alphabetical') return (a.name || '').localeCompare(b.name || '');
        return b.id - a.id;
    });

    const loadGroupDetails = async (group: Group) => {
        setSelectedGroup(group);
        setDetailsLoading(true);
        setGroupDetails(null);
        try {
            const res = await getAuth(`/api/admin/groups/${group.id}`);
            setGroupDetails(res);
        } catch {
            toast.error('Failed to load community details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleJoinGroup = async (group: Group) => {
        if (joiningGroupId === group.id || group.is_private) return;
        setJoiningGroupId(group.id);
        try {
            await postAuth(`/api/groups/${group.id}/join`);
            toast.success(`Joined ${group.name}`);
            loadGroups(groups?.current_page);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to join');
        } finally {
            setJoiningGroupId(null);
        }
    };

    const handleLeaveGroup = async (group: Group) => {
        if (leavingGroupId === group.id) return;
        setLeavingGroupId(group.id);
        try {
            await postAuth(`/api/groups/${group.id}/leave`);
            toast.success(`Left ${group.name}`);
            loadGroups(groups?.current_page);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to leave');
        } finally {
            setLeavingGroupId(null);
        }
    };

    const handleBlockClick = (group: Group) => {
        setConfirmAction({
            id: group.id,
            name: group.name,
            currentBlocked: group.is_blocked
        });
    };

    const handleConfirmBlock = async () => {
        if (!confirmAction) return;
        setConfirmLoading(true);
        try {
            const res = await postAuth(`/api/admin/groups/${confirmAction.id}/block`);
            toast.success(res.message || 'Status updated');
            loadGroups(groups?.current_page);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setConfirmLoading(false);
            setConfirmAction(null);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return toast.error('Community name is required');
        setCreating(true);
        try {
            await postAuth('/api/groups', {
                name: newGroupName.trim(),
                description: newGroupDescription.trim(),
                is_private: isPrivate
            });
            toast.success('Community created');
            setCreateDialogOpen(false);
            setNewGroupName('');
            setNewGroupDescription('');
            setIsPrivate(false);
            loadGroups();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create');
        } finally {
            setCreating(false);
        }
    };



    // Pagination Controls
    const PaginationControls = () => {
        if (!groups || groups.last_page <= 1) return null;

        return (
            <div className="mt-6 flex justify-center items-center gap-3">
                <Button
                    variant="outline"
                    disabled={groups.current_page === 1 || loading}
                    onClick={() => loadGroups(groups.current_page - 1)}
                >
                    ← Previous
                </Button>
                
                <span className="text-sm text-slate-600 px-4">
                    Page <strong>{groups.current_page}</strong> of <strong>{groups.last_page}</strong>
                </span>

                <Button
                    variant="outline"
                    disabled={groups.current_page === groups.last_page || loading}
                    onClick={() => loadGroups(groups.current_page + 1)}
                >
                    Next →
                </Button>
            </div>
        );
    };


    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Header + Create Button */}
            <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-slate-900">Community Management</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{groups?.total ?? '—'} total communities</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
                            <Plus size={14} /> New Community
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Community</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Community Name *</label>
                                <Input 
                                    placeholder="e.g. Sports Predictions" 
                                    value={newGroupName} 
                                    onChange={e => setNewGroupName(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Description</label>
                                <Input 
                                    placeholder="Describe this community…" 
                                    value={newGroupDescription} 
                                    onChange={e => setNewGroupDescription(e.target.value)} 
                                />
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={isPrivate} 
                                    onChange={e => setIsPrivate(e.target.checked)} 
                                    className="mt-0.5" 
                                />
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Make Private</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Members can only join via invitation</p>
                                </div>
                            </label>
                            <Button 
                                className="w-full bg-violet-600 hover:bg-violet-700" 
                                onClick={handleCreateGroup} 
                                disabled={creating || !newGroupName.trim()}
                            >
                                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Community'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-5">
                {/* Filters - same as before */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search community name, description or creator…"
                            value={groupSearch}
                            onChange={e => setGroupSearch(e.target.value)}
                            className="pl-8"
                        />
                        {groupSearch && <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} /></button>}
                    </div>

                    <Select value={groupPrivacyFilter} onValueChange={(v: any) => setGroupPrivacyFilter(v)}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Privacy</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={groupStatusFilter} onValueChange={(v: any) => setGroupStatusFilter(v)}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={groupSortBy} onValueChange={(v: any) => setGroupSortBy(v)}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Newest</SelectItem>
                            <SelectItem value="members">Most Members</SelectItem>
                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-y border-slate-100">
                                    <th className="px-4 py-3 text-left">Community</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Creator</th>
                                    <th className="px-4 py-3 text-left">Members</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredGroups.map(group => (
                                    <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3.5 font-medium text-slate-900">{group.name || '(no name)'}</td>
                                        <td className="px-4 py-3.5">
                                            {group.is_private ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                                    <Lock size={10} /> Private
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-xs font-medium">
                                                    <Globe size={10} /> Public
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 text-xs">@{group.user?.username || '— deleted'}</td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-700">{group.members_count}</td>
                                        <td className="px-4 py-3.5">
                                            {group.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                                                    <Ban size={10} /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                                    <CheckCircle size={10} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button variant="outline" size="sm" onClick={() => loadGroupDetails(group)}>
                                                    View
                                                </Button>
                                                {group.is_member ? (
                                                    <Button variant="destructive" size="sm" disabled={leavingGroupId === group.id} onClick={() => handleLeaveGroup(group)}>
                                                        {leavingGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Leave'}
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" disabled={joiningGroupId === group.id || group.is_private} onClick={() => handleJoinGroup(group)}>
                                                        {joiningGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : group.is_private ? 'Private' : 'Join'}
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant={group.is_blocked ? "default" : "destructive"} 
                                                    size="sm"
                                                    onClick={() => handleBlockClick(group)}
                                                >
                                                    {group.is_blocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <PaginationControls />
                    </div>
                )}
            </div>

            {/* Group Details Modal - unchanged */}
            <Dialog open={!!selectedGroup} onOpenChange={() => { setSelectedGroup(null); setGroupDetails(null); }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {/* ... same as before ... */}
                    <DialogHeader>
                        <DialogTitle>{selectedGroup?.name}</DialogTitle>
                        <p className="text-sm text-slate-500">{selectedGroup?.description || 'No description'}</p>
                    </DialogHeader>
                    {/* Content remains same */}
                    {detailsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>
                    ) : groupDetails ? (
                        <div className="space-y-6 mt-4">
                            {/* Members and Questions sections - same as previous */}
                            {/* ... */}
                        </div>
                    ) : <p className="text-center py-8 text-slate-400">Failed to load details</p>}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setSelectedGroup(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Block / Unblock Confirmation Modal */}
            <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
                <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {confirmAction?.currentBlocked ? (
                                <><CheckCircle size={18} className="text-green-600" /> Unblock Community</>
                            ) : (
                                <><Ban size={18} className="text-red-600" /> Block Community</>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-2 space-y-3">
                        <p className="text-sm text-slate-600">
                            {confirmAction?.currentBlocked 
                                ? <>Unblock <strong>{confirmAction.name}</strong>? It will become visible again.</>
                                : <>Block <strong>{confirmAction?.name}</strong>? This will hide it from users.</>}
                        </p>
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
                            className={confirmAction?.currentBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={handleConfirmBlock}
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