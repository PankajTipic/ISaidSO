// import { useState, useEffect } from 'react';
// import { Layers, Search, X, Plus, Lock, Globe, Ban, CheckCircle, Loader2, Users, MessageSquare } from 'lucide-react';
// import { Button } from '@/app/components/ui/button';
// import { Input } from '@/app/components/ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { getAuth, postAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface Group {
//     id: number; 
//     name: string; 
//     description?: string; 
//     is_private: boolean;
//     user?: { id: number; name: string; username: string };
//     members_count: number; 
//     is_blocked: boolean; 
//     is_member?: boolean;
// }

// interface PaginatedData<T> { 
//     data: T[]; 
//     current_page: number; 
//     last_page: number; 
//     total: number; 
// }

// export default function GroupsTab() {
//     const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [groupSearch, setGroupSearch] = useState('');
//     const [groupPrivacyFilter, setGroupPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
//     const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
//     const [groupSortBy, setGroupSortBy] = useState<'latest' | 'members' | 'alphabetical'>('latest');

//     // Create modal
//     const [createDialogOpen, setCreateDialogOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [newGroupDescription, setNewGroupDescription] = useState('');
//     const [isPrivate, setIsPrivate] = useState(false);
//     const [creating, setCreating] = useState(false);

//     // Details modal
//     const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//     const [groupDetails, setGroupDetails] = useState<any>(null);
//     const [detailsLoading, setDetailsLoading] = useState(false);

//     const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
//     const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

//     // Block Confirmation Modal
//     const [confirmAction, setConfirmAction] = useState<{
//         id: number;
//         name: string;
//         currentBlocked: boolean;
//     } | null>(null);
//     const [confirmLoading, setConfirmLoading] = useState(false);

//     const loadGroups = async (page = 1) => {
//         setLoading(true);
//         try {
//             const res = await getAuth(`/api/admin/groups?page=${page}`);
//             setGroups(res);
//         } catch {
//             toast.error('Failed to load communities');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadGroups();
//     }, []);

//     const filteredGroups = (groups?.data ?? []).filter(g => {
//         const q = groupSearch.trim().toLowerCase();
//         const matchSearch = !q || 
//             (g.name ?? '').toLowerCase().includes(q) || 
//             (g.description ?? '').toLowerCase().includes(q) ||
//             (g.user?.username ?? '').toLowerCase().includes(q);

//         const matchPrivacy = groupPrivacyFilter === 'all' ||
//             (groupPrivacyFilter === 'private' && g.is_private) ||
//             (groupPrivacyFilter === 'public' && !g.is_private);

//         const matchStatus = groupStatusFilter === 'all' ||
//             (groupStatusFilter === 'blocked' && g.is_blocked) ||
//             (groupStatusFilter === 'active' && !g.is_blocked);

//         return matchSearch && matchPrivacy && matchStatus;
//     }).sort((a, b) => {
//         if (groupSortBy === 'members') return (b.members_count || 0) - (a.members_count || 0);
//         if (groupSortBy === 'alphabetical') return (a.name || '').localeCompare(b.name || '');
//         return b.id - a.id;
//     });

//     const loadGroupDetails = async (group: Group) => {
//         setSelectedGroup(group);
//         setDetailsLoading(true);
//         setGroupDetails(null);
//         try {
//             const res = await getAuth(`/api/admin/groups/${group.id}`);
//             setGroupDetails(res);
//         } catch {
//             toast.error('Failed to load community details');
//         } finally {
//             setDetailsLoading(false);
//         }
//     };

//     const handleJoinGroup = async (group: Group) => {
//         if (joiningGroupId === group.id || group.is_private) return;
//         setJoiningGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/join`);
//             toast.success(`Joined ${group.name}`);
//             loadGroups(groups?.current_page);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to join');
//         } finally {
//             setJoiningGroupId(null);
//         }
//     };

//     const handleLeaveGroup = async (group: Group) => {
//         if (leavingGroupId === group.id) return;
//         setLeavingGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/leave`);
//             toast.success(`Left ${group.name}`);
//             loadGroups(groups?.current_page);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to leave');
//         } finally {
//             setLeavingGroupId(null);
//         }
//     };

//     const handleBlockClick = (group: Group) => {
//         setConfirmAction({
//             id: group.id,
//             name: group.name,
//             currentBlocked: group.is_blocked
//         });
//     };

//     const handleConfirmBlock = async () => {
//         if (!confirmAction) return;
//         setConfirmLoading(true);
//         try {
//             const res = await postAuth(`/api/admin/groups/${confirmAction.id}/block`);
//             toast.success(res.message || 'Status updated');
//             loadGroups(groups?.current_page);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         } finally {
//             setConfirmLoading(false);
//             setConfirmAction(null);
//         }
//     };

//     const handleCreateGroup = async () => {
//         if (!newGroupName.trim()) return toast.error('Community name is required');
//         setCreating(true);
//         try {
//             await postAuth('/api/groups', {
//                 name: newGroupName.trim(),
//                 description: newGroupDescription.trim(),
//                 is_private: isPrivate
//             });
//             toast.success('Community created');
//             setCreateDialogOpen(false);
//             setNewGroupName('');
//             setNewGroupDescription('');
//             setIsPrivate(false);
//             loadGroups();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to create');
//         } finally {
//             setCreating(false);
//         }
//     };



//     // Pagination Controls
//     const PaginationControls = () => {
//         if (!groups || groups.last_page <= 1) return null;

//         return (
//             <div className="mt-6 flex justify-center items-center gap-3">
//                 <Button
//                     variant="outline"
//                     disabled={groups.current_page === 1 || loading}
//                     onClick={() => loadGroups(groups.current_page - 1)}
//                 >
//                     ← Previous
//                 </Button>
                
//                 <span className="text-sm text-slate-600 px-4">
//                     Page <strong>{groups.current_page}</strong> of <strong>{groups.last_page}</strong>
//                 </span>

//                 <Button
//                     variant="outline"
//                     disabled={groups.current_page === groups.last_page || loading}
//                     onClick={() => loadGroups(groups.current_page + 1)}
//                 >
//                     Next →
//                 </Button>
//             </div>
//         );
//     };


//     return (
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//             {/* Header + Create Button */}
//             <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
//                 <div>
//                     <h2 className="font-semibold text-slate-900">Community Management</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">{groups?.total ?? '—'} total communities</p>
//                 </div>
//                 <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//                     <DialogTrigger asChild>
//                         <Button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
//                             <Plus size={14} /> New Community
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-md">
//                         <DialogHeader>
//                             <DialogTitle>Create New Community</DialogTitle>
//                         </DialogHeader>
//                         <div className="space-y-4 mt-4">
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium">Community Name *</label>
//                                 <Input 
//                                     placeholder="e.g. Sports Predictions" 
//                                     value={newGroupName} 
//                                     onChange={e => setNewGroupName(e.target.value)} 
//                                 />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium">Description</label>
//                                 <Input 
//                                     placeholder="Describe this community…" 
//                                     value={newGroupDescription} 
//                                     onChange={e => setNewGroupDescription(e.target.value)} 
//                                 />
//                             </div>
//                             <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
//                                 <input 
//                                     type="checkbox" 
//                                     checked={isPrivate} 
//                                     onChange={e => setIsPrivate(e.target.checked)} 
//                                     className="mt-0.5" 
//                                 />
//                                 <div>
//                                     <p className="text-sm font-medium text-slate-700">Make Private</p>
//                                     <p className="text-xs text-slate-400 mt-0.5">Members can only join via invitation</p>
//                                 </div>
//                             </label>
//                             <Button 
//                                 className="w-full bg-violet-600 hover:bg-violet-700" 
//                                 onClick={handleCreateGroup} 
//                                 disabled={creating || !newGroupName.trim()}
//                             >
//                                 {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Community'}
//                             </Button>
//                         </div>
//                     </DialogContent>
//                 </Dialog>
//             </div>

//             <div className="p-5">
//                 {/* Filters - same as before */}
//                 <div className="flex flex-col sm:flex-row gap-3 mb-4">
//                     <div className="relative flex-1">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                         <Input
//                             placeholder="Search community name, description or creator…"
//                             value={groupSearch}
//                             onChange={e => setGroupSearch(e.target.value)}
//                             className="pl-8"
//                         />
//                         {groupSearch && <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} /></button>}
//                     </div>

//                     <Select value={groupPrivacyFilter} onValueChange={(v: any) => setGroupPrivacyFilter(v)}>
//                         <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="all">All Privacy</SelectItem>
//                             <SelectItem value="public">Public</SelectItem>
//                             <SelectItem value="private">Private</SelectItem>
//                         </SelectContent>
//                     </Select>

//                     <Select value={groupStatusFilter} onValueChange={(v: any) => setGroupStatusFilter(v)}>
//                         <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="active">Active</SelectItem>
//                             <SelectItem value="blocked">Blocked</SelectItem>
//                         </SelectContent>
//                     </Select>

//                     <Select value={groupSortBy} onValueChange={(v: any) => setGroupSortBy(v)}>
//                         <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                             <SelectItem value="latest">Newest</SelectItem>
//                             <SelectItem value="members">Most Members</SelectItem>
//                             <SelectItem value="alphabetical">Alphabetical</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 {loading ? (
//                     <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-slate-50 border-y border-slate-100">
//                                     <th className="px-4 py-3 text-left">Community</th>
//                                     <th className="px-4 py-3 text-left">Type</th>
//                                     <th className="px-4 py-3 text-left">Creator</th>
//                                     <th className="px-4 py-3 text-left">Members</th>
//                                     <th className="px-4 py-3 text-left">Status</th>
//                                     <th className="px-4 py-3 text-right">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-50">
//                                 {filteredGroups.map(group => (
//                                     <tr key={group.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-4 py-3.5 font-medium text-slate-900">{group.name || '(no name)'}</td>
//                                         <td className="px-4 py-3.5">
//                                             {group.is_private ? (
//                                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
//                                                     <Lock size={10} /> Private
//                                                 </span>
//                                             ) : (
//                                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-xs font-medium">
//                                                     <Globe size={10} /> Public
//                                                 </span>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-3.5 text-slate-500 text-xs">@{group.user?.username || '— deleted'}</td>
//                                         <td className="px-4 py-3.5 font-semibold text-slate-700">{group.members_count}</td>
//                                         <td className="px-4 py-3.5">
//                                             {group.is_blocked ? (
//                                                 <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
//                                                     <Ban size={10} /> Blocked
//                                                 </span>
//                                             ) : (
//                                                 <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
//                                                     <CheckCircle size={10} /> Active
//                                                 </span>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-3.5 text-right">
//                                             <div className="flex items-center justify-end gap-1.5">
//                                                 <Button variant="outline" size="sm" onClick={() => loadGroupDetails(group)}>
//                                                     View
//                                                 </Button>
//                                                 {group.is_member ? (
//                                                     <Button variant="destructive" size="sm" disabled={leavingGroupId === group.id} onClick={() => handleLeaveGroup(group)}>
//                                                         {leavingGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Leave'}
//                                                     </Button>
//                                                 ) : (
//                                                     <Button size="sm" disabled={joiningGroupId === group.id || group.is_private} onClick={() => handleJoinGroup(group)}>
//                                                         {joiningGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : group.is_private ? 'Private' : 'Join'}
//                                                     </Button>
//                                                 )}
//                                                 <Button 
//                                                     variant={group.is_blocked ? "default" : "destructive"} 
//                                                     size="sm"
//                                                     onClick={() => handleBlockClick(group)}
//                                                 >
//                                                     {group.is_blocked ? 'Unblock' : 'Block'}
//                                                 </Button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         <PaginationControls />
//                     </div>
//                 )}
//             </div>

//             {/* Group Details Modal - unchanged */}
//             <Dialog open={!!selectedGroup} onOpenChange={() => { setSelectedGroup(null); setGroupDetails(null); }}>
//                 <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//                     {/* ... same as before ... */}
//                     <DialogHeader>
//                         <DialogTitle>{selectedGroup?.name}</DialogTitle>
//                         <p className="text-sm text-slate-500">{selectedGroup?.description || 'No description'}</p>
//                     </DialogHeader>
//                     {/* Content remains same */}
//                     {detailsLoading ? (
//                         <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>
//                     ) : groupDetails ? (
//                         <div className="space-y-6 mt-4">
//                             {/* Members and Questions sections - same as previous */}
//                             {/* ... */}
//                         </div>
//                     ) : <p className="text-center py-8 text-slate-400">Failed to load details</p>}
//                     <div className="flex justify-end mt-4">
//                         <Button variant="outline" onClick={() => setSelectedGroup(null)}>Close</Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>

//             {/* Block / Unblock Confirmation Modal */}
//             <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle className="flex items-center gap-2">
//                             {confirmAction?.currentBlocked ? (
//                                 <><CheckCircle size={18} className="text-green-600" /> Unblock Community</>
//                             ) : (
//                                 <><Ban size={18} className="text-red-600" /> Block Community</>
//                             )}
//                         </DialogTitle>
//                     </DialogHeader>

//                     <div className="mt-2 space-y-3">
//                         <p className="text-sm text-slate-600">
//                             {confirmAction?.currentBlocked 
//                                 ? <>Unblock <strong>{confirmAction.name}</strong>? It will become visible again.</>
//                                 : <>Block <strong>{confirmAction?.name}</strong>? This will hide it from users.</>}
//                         </p>
//                     </div>

//                     <div className="flex justify-end gap-3 mt-6">
//                         <Button 
//                             variant="outline" 
//                             size="sm" 
//                             disabled={confirmLoading} 
//                             onClick={() => setConfirmAction(null)}
//                         >
//                             Cancel
//                         </Button>
//                         <Button 
//                             size="sm" 
//                             disabled={confirmLoading}
//                             className={confirmAction?.currentBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
//                             onClick={handleConfirmBlock}
//                         >
//                             {confirmLoading ? (
//                                 <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
//                             ) : (
//                                 confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'
//                             )}
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }











// import { useState, useEffect } from 'react';
// import {
//     Search, X, Plus, Lock, Globe, Ban, CheckCircle, Loader2,
//     Users, MessageSquare, ChevronLeft, TrendingUp, Target, Star
// } from 'lucide-react';
// import { Button } from '@/app/components/ui/button';
// import { Input } from '@/app/components/ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { getAuth, postAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface Member {
//     id: number;
//     name: string;
//     username: string;
//     avatar_url?: string;
//     total_forecasts: number;
//     total_points: number;
//     accuracy: number;
// }

// interface Question {
//     id: number;
//     questions: string;
//     module_type: 'prediction' | 'poll';
//     created_at: string;
//     user?: { id: number; name: string; username: string; avatar_url?: string };
// }

// interface GroupDetail {
//     id: number;
//     name: string;
//     description?: string;
//     is_private: number | boolean;
//     is_blocked: number | boolean;
//     created_at: string;
//     members_count: number;
//     members: Member[];
//     questions: Question[];
// }

// interface Group {
//     id: number;
//     name: string;
//     description?: string;
//     is_private: boolean;
//     user?: { id: number; name: string; username: string };
//     members_count: number;
//     is_blocked: boolean;
//     is_member?: boolean;
// }

// interface PaginatedData<T> {
//     data: T[];
//     current_page: number;
//     last_page: number;
//     total: number;
// }

// export default function GroupsTab() {
//     const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [groupSearch, setGroupSearch] = useState('');
//     const [groupPrivacyFilter, setGroupPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
//     const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
//     const [groupSortBy, setGroupSortBy] = useState<'latest' | 'members' | 'alphabetical'>('latest');

//     // Create modal
//     const [createDialogOpen, setCreateDialogOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [newGroupDescription, setNewGroupDescription] = useState('');
//     const [isPrivate, setIsPrivate] = useState(false);
//     const [creating, setCreating] = useState(false);

//     // Detail "page" (in-panel, not a modal)
//     const [detailGroup, setDetailGroup] = useState<GroupDetail | null>(null);
//     const [detailLoading, setDetailLoading] = useState(false);
//     const [detailMemberTab, setDetailMemberTab] = useState<'members' | 'questions'>('members');

//     const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
//     const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

//     // Block Confirmation
//     const [confirmAction, setConfirmAction] = useState<{ id: number; name: string; currentBlocked: boolean } | null>(null);
//     const [confirmLoading, setConfirmLoading] = useState(false);

//     const loadGroups = async (page = 1) => {
//         setLoading(true);
//         try {
//             const res = await getAuth(`/api/admin/groups?page=${page}`);
//             setGroups(res);
//         } catch {
//             toast.error('Failed to load communities');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { loadGroups(); }, []);

//     const filteredGroups = (groups?.data ?? []).filter(g => {
//         const q = groupSearch.trim().toLowerCase();
//         const matchSearch = !q ||
//             (g.name ?? '').toLowerCase().includes(q) ||
//             (g.description ?? '').toLowerCase().includes(q) ||
//             (g.user?.username ?? '').toLowerCase().includes(q);
//         const matchPrivacy = groupPrivacyFilter === 'all' ||
//             (groupPrivacyFilter === 'private' && g.is_private) ||
//             (groupPrivacyFilter === 'public' && !g.is_private);
//         const matchStatus = groupStatusFilter === 'all' ||
//             (groupStatusFilter === 'blocked' && g.is_blocked) ||
//             (groupStatusFilter === 'active' && !g.is_blocked);
//         return matchSearch && matchPrivacy && matchStatus;
//     }).sort((a, b) => {
//         if (groupSortBy === 'members') return (b.members_count || 0) - (a.members_count || 0);
//         if (groupSortBy === 'alphabetical') return (a.name || '').localeCompare(b.name || '');
//         return b.id - a.id;
//     });

//     const openDetail = async (group: Group) => {
//         setDetailLoading(true);
//         setDetailGroup(null);
//         setDetailMemberTab('members');
//         // Trigger detail view immediately with loading
//         setDetailGroup({ id: group.id, name: group.name, description: group.description, is_private: group.is_private, is_blocked: group.is_blocked, created_at: '', members_count: group.members_count, members: [], questions: [] });
//         try {
//             const res = await getAuth(`/api/admin/groups/${group.id}`);
//             setDetailGroup(res);
//         } catch {
//             toast.error('Failed to load community details');
//             setDetailGroup(null);
//         } finally {
//             setDetailLoading(false);
//         }
//     };

//     const handleJoinGroup = async (group: Group) => {
//         if (joiningGroupId === group.id || group.is_private) return;
//         setJoiningGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/join`);
//             toast.success(`Joined ${group.name}`);
//             loadGroups(groups?.current_page);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to join');
//         } finally {
//             setJoiningGroupId(null);
//         }
//     };

//     const handleLeaveGroup = async (group: Group) => {
//         if (leavingGroupId === group.id) return;
//         setLeavingGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/leave`);
//             toast.success(`Left ${group.name}`);
//             loadGroups(groups?.current_page);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to leave');
//         } finally {
//             setLeavingGroupId(null);
//         }
//     };

//     const handleConfirmBlock = async () => {
//         if (!confirmAction) return;
//         setConfirmLoading(true);
//         try {
//             const res = await postAuth(`/api/admin/groups/${confirmAction.id}/block`);
//             toast.success(res.message || 'Status updated');
//             loadGroups(groups?.current_page);
//             setConfirmAction(null);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         } finally {
//             setConfirmLoading(false);
//         }
//     };

//     const handleCreateGroup = async () => {
//         if (!newGroupName.trim()) return toast.error('Community name is required');
//         setCreating(true);
//         try {
//             await postAuth('/api/groups', { name: newGroupName.trim(), description: newGroupDescription.trim(), is_private: isPrivate });
//             toast.success('Community created');
//             setCreateDialogOpen(false);
//             setNewGroupName(''); setNewGroupDescription(''); setIsPrivate(false);
//             loadGroups();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to create');
//         } finally {
//             setCreating(false);
//         }
//     };

//     const PaginationControls = () => {
//         if (!groups || groups.last_page <= 1) return null;
//         return (
//             <div className="mt-5 flex justify-center items-center gap-3">
//                 <button disabled={groups.current_page === 1 || loading} onClick={() => loadGroups(groups.current_page - 1)}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
//                     ← Previous
//                 </button>
//                 <span className="text-xs text-slate-500">Page <strong>{groups.current_page}</strong> of <strong>{groups.last_page}</strong></span>
//                 <button disabled={groups.current_page === groups.last_page || loading} onClick={() => loadGroups(groups.current_page + 1)}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
//                     Next →
//                 </button>
//             </div>
//         );
//     };

//     // ── DETAIL VIEW ────────────────────────────────────────────────────────────
//     if (detailGroup !== null) {
//         const g = detailGroup;
//         const isBlocked = !!g.is_blocked;
//         const isPrivateGroup = !!g.is_private;

//         return (
//             <div className="space-y-5">
//                 {/* Back + header */}
//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={() => setDetailGroup(null)}
//                         className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
//                     >
//                         <ChevronLeft size={16} /> Back to Communities
//                     </button>
//                 </div>

//                 {detailLoading ? (
//                     <div className="flex justify-center py-32">
//                         <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
//                     </div>
//                 ) : (
//                     <>
//                         {/* Hero card */}
//                         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                             <div className="h-28 bg-gradient-to-r from-violet-600 via-violet-500 to-pink-500 relative">
//                                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
//                                 <div className="absolute top-4 right-4 flex gap-2">
//                                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPrivateGroup ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
//                                         {isPrivateGroup ? '🔒 Private' : '🌐 Public'}
//                                     </span>
//                                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isBlocked ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
//                                         {isBlocked ? 'Blocked' : 'Active'}
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="px-6 pb-6">
//                                 <div className="flex items-end justify-between -mt-8 mb-4">
//                                     <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-violet-600 bg-gradient-to-br from-violet-50 to-pink-50">
//                                         {g.name?.[0]?.toUpperCase() ?? '?'}
//                                     </div>
//                                     <button
//                                         onClick={() => setConfirmAction({ id: g.id, name: g.name, currentBlocked: isBlocked })}
//                                         className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${isBlocked ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'}`}
//                                     >
//                                         {isBlocked ? '✓ Unblock Community' : '✕ Block Community'}
//                                     </button>
//                                 </div>

//                                 <h1 className="text-xl font-bold text-slate-900">{g.name}</h1>
//                                 {g.description && <p className="text-sm text-slate-500 mt-1">{g.description}</p>}

//                                 {/* Stats row */}
//                                 <div className="grid grid-cols-3 gap-3 mt-5">
//                                     {[
//                                         { label: 'Members', val: g.members_count, icon: Users, color: 'text-violet-600 bg-violet-50' },
//                                         { label: 'Questions', val: g.questions?.length ?? 0, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
//                                         { label: 'Created', val: g.created_at ? new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', icon: Target, color: 'text-emerald-600 bg-emerald-50' },
//                                     ].map(s => (
//                                         <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
//                                             <div className={`p-2 rounded-lg ${s.color}`}>
//                                                 <s.icon size={15} />
//                                             </div>
//                                             <div>
//                                                 <p className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</p>
//                                                 <p className="text-sm font-bold text-slate-800">{s.val}</p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Tab switcher */}
//                         <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
//                             {(['members', 'questions'] as const).map(tab => (
//                                 <button
//                                     key={tab}
//                                     onClick={() => setDetailMemberTab(tab)}
//                                     className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${detailMemberTab === tab ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                                 >
//                                     {tab === 'members' ? `👥 Members (${g.members?.length ?? 0})` : `💬 Questions (${g.questions?.length ?? 0})`}
//                                 </button>
//                             ))}
//                         </div>

//                         {/* Members grid */}
//                         {detailMemberTab === 'members' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//                                 <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
//                                     <Users size={15} className="text-violet-500" /> Community Members
//                                 </h3>
//                                 {g.members?.length > 0 ? (
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                                         {g.members.map(member => (
//                                             <div key={member.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group">
//                                                 <Avatar className="h-11 w-11 border-2 border-white shadow-sm flex-shrink-0">
//                                                     <AvatarImage src={member.avatar_url} />
//                                                     <AvatarFallback className="bg-gradient-to-br from-violet-100 to-pink-100 text-violet-700 font-bold text-sm">
//                                                         {member.name?.[0]?.toUpperCase() ?? '?'}
//                                                     </AvatarFallback>
//                                                 </Avatar>
//                                                 <div className="min-w-0 flex-1">
//                                                     <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
//                                                     <p className="text-xs text-slate-400 truncate">@{member.username}</p>
//                                                     <div className="flex items-center gap-2 mt-1.5">
//                                                         <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
//                                                             {member.total_forecasts} forecasts
//                                                         </span>
//                                                         <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${member.accuracy >= 70 ? 'text-emerald-600 bg-emerald-50' : member.accuracy >= 40 ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100'}`}>
//                                                             {member.accuracy}% acc
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12 text-slate-400">
//                                         <Users size={32} className="mx-auto mb-2 opacity-20" />
//                                         <p className="text-sm">No members yet</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Questions list */}
//                         {detailMemberTab === 'questions' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//                                 <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
//                                     <MessageSquare size={15} className="text-amber-500" /> Shared Questions
//                                 </h3>
//                                 {g.questions?.length > 0 ? (
//                                     <div className="space-y-3">
//                                         {g.questions.map(q => (
//                                             <div key={q.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/20 transition-all">
//                                                 <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mt-0.5 ${q.module_type === 'prediction' ? 'bg-violet-100 text-violet-700' : 'bg-pink-100 text-pink-700'}`}>
//                                                     {q.module_type}
//                                                 </div>
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className="text-sm font-medium text-slate-800 leading-snug">{q.questions}</p>
//                                                     <div className="flex items-center gap-2 mt-2">
//                                                         <Avatar className="h-5 w-5">
//                                                             <AvatarImage src={q.user?.avatar_url} />
//                                                             <AvatarFallback className="text-[9px] font-bold bg-slate-100 text-slate-600">
//                                                                 {q.user?.name?.[0]?.toUpperCase() ?? '?'}
//                                                             </AvatarFallback>
//                                                         </Avatar>
//                                                         <span className="text-xs text-slate-500">@{q.user?.username ?? 'unknown'}</span>
//                                                         <span className="text-[10px] text-slate-400">·</span>
//                                                         <span className="text-[10px] text-slate-400">{new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12 text-slate-400">
//                                         <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
//                                         <p className="text-sm">No questions shared yet</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </>
//                 )}

//                 {/* Block Confirm Dialog (shown even on detail view) */}
//                 <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
//                     <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
//                         <DialogHeader>
//                             <DialogTitle className="flex items-center gap-2">
//                                 {confirmAction?.currentBlocked
//                                     ? <><CheckCircle size={18} className="text-green-600" /> Unblock Community</>
//                                     : <><Ban size={18} className="text-red-600" /> Block Community</>}
//                             </DialogTitle>
//                         </DialogHeader>
//                         <p className="text-sm text-slate-600 mt-2">
//                             {confirmAction?.currentBlocked
//                                 ? <>Unblock <strong>{confirmAction.name}</strong>? It will become visible to all users.</>
//                                 : <>Block <strong>{confirmAction?.name}</strong>? This will hide it from all users.</>}
//                         </p>
//                         <div className="flex justify-end gap-3 mt-6">
//                             <Button variant="outline" size="sm" disabled={confirmLoading} onClick={() => setConfirmAction(null)}>Cancel</Button>
//                             <Button size="sm" disabled={confirmLoading}
//                                 className={confirmAction?.currentBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
//                                 onClick={handleConfirmBlock}>
//                                 {confirmLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'}
//                             </Button>
//                         </div>
//                     </DialogContent>
//                 </Dialog>
//             </div>
//         );
//     }

//     // ── LIST VIEW ──────────────────────────────────────────────────────────────
//     return (
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//             {/* Header */}
//             <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
//                 <div>
//                     <h2 className="font-semibold text-slate-900">Community Management</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">{groups?.total ?? '—'} total communities</p>
//                 </div>
//                 <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//                     <DialogTrigger asChild>
//                         <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors">
//                             <Plus size={14} /> New Community
//                         </button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-md bg-white">
//                         <DialogHeader><DialogTitle>Create New Community</DialogTitle></DialogHeader>
//                         <div className="space-y-4 mt-4">
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium">Community Name *</label>
//                                 <Input placeholder="e.g. Sports Predictions" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium">Description</label>
//                                 <Input placeholder="Describe this community…" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} />
//                             </div>
//                             <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50">
//                                 <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="mt-0.5 h-4 w-4" />
//                                 <div>
//                                     <p className="text-sm font-medium text-slate-700">Make Private</p>
//                                     <p className="text-xs text-slate-400 mt-0.5">Members can only join via invitation</p>
//                                 </div>
//                             </label>
//                             <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
//                                 {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Community'}
//                             </Button>
//                         </div>
//                     </DialogContent>
//                 </Dialog>
//             </div>

//             <div className="p-5">
//                 {/* Filters */}
//                 <div className="flex flex-col sm:flex-row gap-3 mb-4">
//                     <div className="relative flex-1">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                         <Input placeholder="Search community name, description or creator…" value={groupSearch} onChange={e => setGroupSearch(e.target.value)} className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white" />
//                         {groupSearch && <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>}
//                     </div>
//                     <Select value={groupPrivacyFilter} onValueChange={(v: any) => setGroupPrivacyFilter(v)}>
//                         <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="all">All Privacy</SelectItem>
//                             <SelectItem value="public">Public</SelectItem>
//                             <SelectItem value="private">Private</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={groupStatusFilter} onValueChange={(v: any) => setGroupStatusFilter(v)}>
//                         <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="active">Active</SelectItem>
//                             <SelectItem value="blocked">Blocked</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={groupSortBy} onValueChange={(v: any) => setGroupSortBy(v)}>
//                         <SelectTrigger className="w-[140px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="latest">Newest</SelectItem>
//                             <SelectItem value="members">Most Members</SelectItem>
//                             <SelectItem value="alphabetical">Alphabetical</SelectItem>
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 {loading ? (
//                     <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-slate-50 border-y border-slate-100">
//                                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Community</th>
//                                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
//                                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Creator</th>
//                                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Members</th>
//                                     <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
//                                     <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-50">
//                                 {filteredGroups.length > 0 ? filteredGroups.map(group => (
//                                     <tr key={group.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-4 py-3.5 font-medium text-slate-900">{group.name || '(no name)'}</td>
//                                         <td className="px-4 py-3.5">
//                                             {group.is_private
//                                                 ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"><Lock size={10} /> Private</span>
//                                                 : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[11px] font-medium"><Globe size={10} /> Public</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5 text-slate-500 text-xs">@{group.user?.username || '— deleted'}</td>
//                                         <td className="px-4 py-3.5 font-semibold text-slate-700">{group.members_count}</td>
//                                         <td className="px-4 py-3.5">
//                                             {group.is_blocked
//                                                 ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><Ban size={10} /> Blocked</span>
//                                                 : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle size={10} /> Active</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5 text-right">
//                                             <div className="flex items-center justify-end gap-1.5">
//                                                 <button onClick={() => openDetail(group)}
//                                                     className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
//                                                     View
//                                                 </button>
//                                                 {group.is_member
//                                                     ? <button disabled={leavingGroupId === group.id} onClick={() => handleLeaveGroup(group)}
//                                                         className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50">
//                                                         {leavingGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Leave'}
//                                                     </button>
//                                                     : <button disabled={joiningGroupId === group.id || group.is_private} onClick={() => handleJoinGroup(group)}
//                                                         className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50">
//                                                         {joiningGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : group.is_private ? 'Private' : 'Join'}
//                                                     </button>}
//                                                 <button
//                                                     onClick={() => setConfirmAction({ id: group.id, name: group.name, currentBlocked: group.is_blocked })}
//                                                     className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${group.is_blocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
//                                                 >
//                                                     {group.is_blocked ? 'Unblock' : 'Block'}
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
//                                         <Search size={28} className="mx-auto mb-2 opacity-20" />
//                                         No communities found
//                                     </td></tr>
//                                 )}
//                             </tbody>
//                         </table>
//                         <PaginationControls />
//                     </div>
//                 )}
//             </div>

//             {/* Block Confirm Dialog */}
//             <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle className="flex items-center gap-2">
//                             {confirmAction?.currentBlocked
//                                 ? <><CheckCircle size={18} className="text-green-600" /> Unblock Community</>
//                                 : <><Ban size={18} className="text-red-600" /> Block Community</>}
//                         </DialogTitle>
//                     </DialogHeader>
//                     <p className="text-sm text-slate-600 mt-2">
//                         {confirmAction?.currentBlocked
//                             ? <>Unblock <strong>{confirmAction.name}</strong>? It will become visible to all users.</>
//                             : <>Block <strong>{confirmAction?.name}</strong>? This will hide it from all users.</>}
//                     </p>
//                     <div className="flex justify-end gap-3 mt-6">
//                         <Button variant="outline" size="sm" disabled={confirmLoading} onClick={() => setConfirmAction(null)}>Cancel</Button>
//                         <Button size="sm" disabled={confirmLoading}
//                             className={confirmAction?.currentBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
//                             onClick={handleConfirmBlock}>
//                             {confirmLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'}
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }

















import { useState, useEffect } from 'react';
import {
    Search, X, Plus, Lock, Globe, Ban, CheckCircle, Loader2,
    Users, MessageSquare, ChevronLeft
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { getAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';

interface Member {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    total_forecasts: number;
    total_points: number;
    accuracy: number;
}

interface Question {
    id: number;
    questions: string;
    module_type: 'prediction' | 'poll';
    created_at: string;
    user?: { id: number; name: string; username: string; avatar_url?: string };
}

interface GroupDetail {
    id: number;
    name: string;
    description?: string;
    is_private: number | boolean;
    is_blocked: number | boolean;
    created_at: string;
    members_count: number;
    members: Member[];
    questions: Question[];
}

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

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    const [detailGroup, setDetailGroup] = useState<GroupDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailMemberTab, setDetailMemberTab] = useState<'members' | 'questions'>('members');

    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
    const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

    const [confirmAction, setConfirmAction] = useState<{ id: number; name: string; currentBlocked: boolean } | null>(null);
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

    useEffect(() => { loadGroups(); }, []);

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

    const openDetail = async (group: Group) => {
        setDetailLoading(true);
        setDetailGroup(null);
        setDetailMemberTab('members');
        setDetailGroup({
            id: group.id, name: group.name, description: group.description,
            is_private: group.is_private, is_blocked: group.is_blocked,
            created_at: '', members_count: group.members_count, members: [], questions: []
        });
        try {
            const res = await getAuth(`/api/admin/groups/${group.id}`);
            setDetailGroup(res);
        } catch {
            toast.error('Failed to load community details');
            setDetailGroup(null);
        } finally {
            setDetailLoading(false);
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

    const handleConfirmBlock = async () => {
        if (!confirmAction) return;
        setConfirmLoading(true);
        try {
            const res = await postAuth(`/api/admin/groups/${confirmAction.id}/block`);
            toast.success(res.message || 'Status updated');
            loadGroups(groups?.current_page);
            setConfirmAction(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return toast.error('Community name is required');
        setCreating(true);
        try {
            await postAuth('/api/groups', { name: newGroupName.trim(), description: newGroupDescription.trim(), is_private: isPrivate });
            toast.success('Community created');
            setCreateDialogOpen(false);
            setNewGroupName(''); setNewGroupDescription(''); setIsPrivate(false);
            loadGroups();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create');
        } finally {
            setCreating(false);
        }
    };

    const PaginationControls = () => {
        if (!groups || groups.last_page <= 1) return null;
        return (
            <div className="mt-5 flex justify-center items-center gap-3">
                <button
                    disabled={groups.current_page === 1 || loading}
                    onClick={() => loadGroups(groups.current_page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    ← Previous
                </button>
                <span className="text-xs text-slate-500">
                    Page <strong>{groups.current_page}</strong> of <strong>{groups.last_page}</strong>
                </span>
                <button
                    disabled={groups.current_page === groups.last_page || loading}
                    onClick={() => loadGroups(groups.current_page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next →
                </button>
            </div>
        );
    };

    // ── BLOCK CONFIRM DIALOG ───────────────────────────────────────────────────
    const BlockConfirmDialog = () => (
        <Dialog open={!!confirmAction} onOpenChange={() => !confirmLoading && setConfirmAction(null)}>
            <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {confirmAction?.currentBlocked
                            ? <><CheckCircle size={18} className="text-emerald-600" /> Unblock Community</>
                            : <><Ban size={18} className="text-red-500" /> Block Community</>}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-600 mt-2">
                    {confirmAction?.currentBlocked
                        ? <>Unblock <strong>{confirmAction.name}</strong>? It will become visible to all users.</>
                        : <>Block <strong>{confirmAction?.name}</strong>? This will hide it from all users.</>}
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" disabled={confirmLoading} onClick={() => setConfirmAction(null)}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        disabled={confirmLoading}
                        className={confirmAction?.currentBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}
                        onClick={handleConfirmBlock}
                    >
                        {confirmLoading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                            : confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

    // ── DETAIL VIEW ────────────────────────────────────────────────────────────
    if (detailGroup !== null) {
        const g = detailGroup;
        const isBlocked = !!g.is_blocked;
        const isPrivateGroup = !!g.is_private;

        return (
            <div className="flex flex-col gap-3">
                {/* Back */}
                <div>
                    <button
                        onClick={() => setDetailGroup(null)}
                        className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    >
                        <ChevronLeft size={15} /> Back to Communities
                    </button>
                </div>

                {detailLoading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    </div>
                ) : (
                    <>
                        {/* Hero card */}
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-lg bg-violet-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                                        {g.name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="text-base font-semibold text-violet-900 leading-snug">{g.name}</h1>
                                        {g.description && (
                                            <p className="text-sm text-violet-700/70 mt-0.5 leading-relaxed">{g.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-500 border border-violet-200">
                                                {isPrivateGroup ? <Lock size={10} /> : <Globe size={10} />}
                                                {isPrivateGroup ? 'Private' : 'Public'}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                                isBlocked
                                                    ? 'bg-red-50 text-red-600 border-red-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                <CheckCircle size={10} />
                                                {isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfirmAction({ id: g.id, name: g.name, currentBlocked: isBlocked })}
                                    className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                                        isBlocked
                                            ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                                    }`}
                                >
                                    <Ban size={12} />
                                    {isBlocked ? 'Unblock' : 'Block'}
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {[
                                    { label: 'Members', value: g.members_count ?? 0, color: 'bg-white border-violet-200 text-violet-700' },
                                    { label: 'Questions', value: g.questions?.length ?? 0, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                                    {
                                        label: 'Created',
                                        value: g.created_at
                                            ? new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—',
                                        color: 'bg-sky-50 border-sky-200 text-sky-700'
                                    },
                                ].map(s => (
                                    <div key={s.label} className={`rounded-lg px-3 py-2.5 border ${s.color}`}>
                                        <p className="text-[11px] opacity-60 mb-0.5">{s.label}</p>
                                        <p className="text-sm font-semibold">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-violet-50 border border-violet-200 rounded-lg p-1 w-fit">
                            {(['members', 'questions'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailMemberTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                                        detailMemberTab === tab
                                            ? 'bg-violet-600 text-white shadow-sm'
                                            : 'text-violet-600 hover:bg-violet-100'
                                    }`}
                                >
                                    {tab === 'members'
                                        ? `Members (${g.members?.length ?? 0})`
                                        : `Questions (${g.questions?.length ?? 0})`}
                                </button>
                            ))}
                        </div>

                        {/* Members */}
                        {detailMemberTab === 'members' && (
                            <div className="bg-white border border-violet-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-3">Community members</p>
                                {g.members?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {g.members.map(member => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-violet-100 bg-violet-50/40 hover:bg-violet-50 hover:border-violet-200 transition-colors"
                                            >
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarImage src={member.avatar_url} />
                                                    <AvatarFallback className="bg-violet-200 text-violet-700 text-xs font-semibold">
                                                        {member.name?.[0]?.toUpperCase() ?? '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">@{member.username}</p>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className="text-[10px] font-medium text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">
                                                            {member.total_forecasts} forecasts
                                                        </span>
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                                            member.accuracy >= 70
                                                                ? 'text-emerald-700 bg-emerald-100'
                                                                : member.accuracy >= 40
                                                                ? 'text-amber-700 bg-amber-100'
                                                                : 'text-slate-500 bg-slate-100'
                                                        }`}>
                                                            {member.accuracy}% acc
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-violet-300">
                                        <Users size={28} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm text-slate-400">No members yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Questions */}
                        {detailMemberTab === 'questions' && (
                            <div className="bg-white border border-amber-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">Shared questions</p>
                                {g.questions?.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {g.questions.map(q => (
                                            <div
                                                key={q.id}
                                                className="flex items-start gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                                            >
                                                <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                                                    q.module_type === 'prediction'
                                                        ? 'bg-violet-100 text-violet-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {q.module_type}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-slate-800 leading-snug">{q.questions}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={q.user?.avatar_url} />
                                                            <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700">
                                                                {q.user?.name?.[0]?.toUpperCase() ?? '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs text-slate-400">@{q.user?.username ?? 'unknown'}</span>
                                                        <span className="text-[10px] text-slate-300">·</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(q.created_at).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-amber-200">
                                        <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm text-slate-400">No questions shared yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                <BlockConfirmDialog />
            </div>
        );
    }

    // ── LIST VIEW ──────────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Header — violet tint */}
            <div className="px-5 py-4 border-b border-violet-100 bg-violet-50 rounded-t-2xl flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-violet-900">Community Management</h2>
                    <p className="text-xs text-violet-400 mt-0.5">{groups?.total ?? '—'} total communities</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm">
                            <Plus size={14} /> New Community
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader><DialogTitle>Create New Community</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Community Name *</label>
                                <Input placeholder="e.g. Sports Predictions" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Description</label>
                                <Input placeholder="Describe this community…" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} />
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors">
                                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-600" />
                                <div>
                                    <p className="text-sm font-medium text-violet-800">Make Private</p>
                                    <p className="text-xs text-violet-400 mt-0.5">Members can only join via invitation</p>
                                </div>
                            </label>
                            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
                                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Community'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="p-5">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                        <Input
                            placeholder="Search community name, description or creator…"
                            value={groupSearch}
                            onChange={e => setGroupSearch(e.target.value)}
                            className="pl-8 h-9 text-sm border-violet-200 bg-violet-50/50 focus:bg-white placeholder:text-violet-300"
                        />
                        {groupSearch && (
                            <button onClick={() => setGroupSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-600">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <Select value={groupPrivacyFilter} onValueChange={(v: any) => setGroupPrivacyFilter(v)}>
                        <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="all">All Privacy</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={groupStatusFilter} onValueChange={(v: any) => setGroupStatusFilter(v)}>
                        <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={groupSortBy} onValueChange={(v: any) => setGroupSortBy(v)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="latest">Newest</SelectItem>
                            <SelectItem value="members">Most Members</SelectItem>
                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-violet-50 border-b border-violet-100">
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Community</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Creator</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Members</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredGroups.length > 0 ? filteredGroups.map((group, idx) => (
                                    <tr key={group.id} className={`transition-colors hover:bg-violet-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                        <td className="px-4 py-3.5 font-medium text-slate-900">{group.name || '(no name)'}</td>
                                        <td className="px-4 py-3.5">
                                            {group.is_private
                                                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"><Lock size={10} /> Private</span>
                                                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[11px] font-medium border border-sky-100"><Globe size={10} /> Public</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-500 text-xs">@{group.user?.username || '— deleted'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                                                <Users size={10} /> {group.members_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {group.is_blocked
                                                ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full"><Ban size={10} /> Blocked</span>
                                                : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle size={10} /> Active</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openDetail(group)}
                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
                                                >
                                                    View
                                                </button>
                                                {group.is_member
                                                    ? <button
                                                        disabled={leavingGroupId === group.id}
                                                        onClick={() => handleLeaveGroup(group)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {leavingGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Leave'}
                                                    </button>
                                                    : <button
                                                        disabled={joiningGroupId === group.id || group.is_private}
                                                        onClick={() => handleJoinGroup(group)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors disabled:opacity-50"
                                                    >
                                                        {joiningGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : group.is_private ? 'Private' : 'Join'}
                                                    </button>}
                                                <button
                                                    onClick={() => setConfirmAction({ id: group.id, name: group.name, currentBlocked: group.is_blocked })}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                        group.is_blocked
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {group.is_blocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                                            <Search size={28} className="mx-auto mb-2 opacity-20" />
                                            No communities found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <PaginationControls />
                    </div>
                )}
            </div>

            <BlockConfirmDialog />
        </div>
    );
}