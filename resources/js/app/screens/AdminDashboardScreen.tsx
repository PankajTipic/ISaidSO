// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import {
//     Users, MessageSquare, Layers, Shield, Ban, CheckCircle,
//     ChevronRight, TrendingUp, PieChart, Grid, Trophy, Plus,
//     Loader2, Lock, Globe, X,
//     LogOut,
//     UserCircle
// } from 'lucide-react';

// // UI Components
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { Button } from '@/app/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger
// } from '@/app/components/ui/dialog';
// import { Input } from '@/app/components/ui/input';
// import { Label } from '@/app/components/ui/label';
// import { Textarea } from '@/app/components/ui/textarea';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from '@/app/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

// // Your helpers & others
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import { getAuth, postAuth } from '@/util/api';
// import { toast } from 'sonner';
// import { useNavigate } from 'react-router';
// import { useAppDispatch } from '../store/hooks';
// import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';

// interface Stats {
//     users: number;
//     predictions: number;
//     polls: number;
//     groups: number;
// }

// interface User {
//     id: number;
//     name: string;
//     email: string;
//     username: string;
//     role: string;
//     is_blocked: boolean;
//     avatar_url?: string;
// }

// interface Group {
//     id: number;
//     name: string;
//     description?: string;
//     is_private: boolean;
//     user: { id: number; name: string; username: string } | null;
//     members_count: number;
//     is_blocked: boolean;
//     is_member?: boolean;
// }

// interface QuestionItem {
//     id: number;
//     questions: string;
//     module_type: 'prediction' | 'poll';
//     user?: { name: string; username: string };
// }

// interface LeaderboardEntry {
//     user: { id: number; name: string; username: string; avatar_url?: string };
//     score: number;
//     accuracy: number;
//     correct_predictions: number;
//     total_predictions: number;
// }

// interface PaginatedData<T> {
//     data: T[];
//     current_page: number;
//     last_page: number;
//     total: number;
// }

// export function AdminDashboardScreen() {
//     const [activeTab, setActiveTab] = useState('overview');
//     const [stats, setStats] = useState<Stats | null>(null);
//     const [users, setUsers] = useState<PaginatedData<User> | null>(null);
//     const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
//     const [predictions, setPredictions] = useState<PaginatedData<QuestionItem> | null>(null);
//     const [polls, setPolls] = useState<PaginatedData<QuestionItem> | null>(null);
//     const [leaderboard, setLeaderboard] = useState<PaginatedData<LeaderboardEntry> | null>(null);

//     // Create group modal states
//     const [createDialogOpen, setCreateDialogOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [newGroupDescription, setNewGroupDescription] = useState('');
//     const [isPrivate, setIsPrivate] = useState(false);
//     const [creating, setCreating] = useState(false);

//     // Group details modal states
//     const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//     const [groupDetails, setGroupDetails] = useState<any>(null);
//     const [detailsLoading, setDetailsLoading] = useState(false);

//     // Question details modal states
//     const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
//     const [questionDetails, setQuestionDetails] = useState<any>(null);
//     const [questionLoading, setQuestionLoading] = useState(false);

//     // Prediction / Poll creation modal
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [createType, setCreateType] = useState<'prediction' | 'poll' | null>(null);

//     // ── Prediction Form State ───────────────────────────────────────
//     const [predText, setPredText] = useState('');
//     const [predDesc, setPredDesc] = useState('');
//     const [predLocationScope, setPredLocationScope] = useState<'global' | 'country' | 'city'>('global');
//     const [predVisibility, setPredVisibility] = useState<'public' | 'private'>('public');
//     const [predCorrectAnswer, setPredCorrectAnswer] = useState('');
//     const [predVotingEndDate, setPredVotingEndDate] = useState('');
//     const [predSelectedFieldId, setPredSelectedFieldId] = useState<number | null>(null);
//     const [predSelectedGroupIds, setPredSelectedGroupIds] = useState<number[]>([]);

//     // ── Poll Form State ─────────────────────────────────────────────
//     const [pollText, setPollText] = useState('');
//     const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
//     const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
//     const [pollVotingEndDate, setPollVotingEndDate] = useState('');
//     const [pollVisibility, setPollVisibility] = useState<'public' | 'private'>('public');
//     const [pollSelectedFieldId, setPollSelectedFieldId] = useState<number | null>(null);
//     const [pollSelectedGroupIds, setPollSelectedGroupIds] = useState<number[]>([]);

//     const [adminProfile, setAdminProfile] = useState(null);
//     const [profileLoading, setProfileLoading] = useState(false);

//     // Reference data (shared)
//     const [fields, setFields] = useState([]);
//     const [myGroups, setMyGroups] = useState([]);
//     const [loadingRefs, setLoadingRefs] = useState(true);
//     const [submitting, setSubmitting] = useState(false);

//     const [loading, setLoading] = useState(false);
//     const [activeLoader, setActiveLoader] = useState<string | null>(null);

//     const formatToMySQLDateTime = (dateStr: string): string | null => {
//     if (!dateStr) return null;

//     try {
//         const date = new Date(dateStr);
//         if (isNaN(date.getTime())) return null;

//         const pad = (n: number) => String(n).padStart(2, '0');

//         return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
//                `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
//     } catch {
//         return null;
//     }
// };


// const dispatch = useAppDispatch();
// const navigate = useNavigate();




// // Logout handler
//   const handleLogout = async () => {
//   try {
//     // Optional: call backend logout if you want (but not required if thunk handles it)
//     // await postAuth('/api/logout').catch(() => {});

//     // This is the most important line — clears auth state in Redux
//     await dispatch(logoutUser()).unwrap();   // .unwrap() if it's a thunk that returns promise

//     toast.success('Logged out successfully');

//     // Navigate to login/auth page
//     navigate('/auth', { replace: true });

//   } catch (err) {
//     console.error('Logout failed:', err);
//     toast.error('Logout failed – redirecting anyway');

//     // Fallback redirect
//     navigate('/auth', { replace: true });
//   }
// };

//     // Load admin profile
//     const loadAdminProfile = async () => {
//         setProfileLoading(true);
//         try {
//             const res = await getAuth('/api/user');
//             setAdminProfile(res || res);
//         } catch (err) {
//             toast.error('Failed to load profile');
//             console.error(err);
//         } finally {
//             setProfileLoading(false);
//         }
//     };

//     // Load profile when tab changes to profile (lazy load)
//     useEffect(() => {
//         if (activeTab === 'profile' && !adminProfile) {
//             loadAdminProfile();
//         }
//     }, [activeTab]);






//     // ── Load shared reference data ────────────────────────────────
//     useEffect(() => {
//         const loadRefs = async () => {
//             try {
//                 setLoadingRefs(true);
//                 const [fieldsRes, groupsRes] = await Promise.all([
//                     getAuth('/api/fields'),
//                     getAuth('/api/groups?my_groups=1'),
//                 ]);
//                 setFields(fieldsRes?.data ?? fieldsRes ?? []);
//                 setMyGroups(groupsRes?.data ?? groupsRes ?? []);
//             } catch (err) {
//                 toast.error('Failed to load form data');
//             } finally {
//                 setLoadingRefs(false);
//             }
//         };
//         loadRefs();
//     }, []);



//     // Load stats on mount
//     useEffect(() => {
//         loadStats();
//     }, []);

//     const startLoading = (key: string) => {
//         setLoading(true);
//         setActiveLoader(key);
//     };

//     const stopLoading = () => {
//         setLoading(false);
//         setActiveLoader(null);
//     };

//     const loadStats = async () => {
//         startLoading('stats');
//         try {
//             const res = await getAuth('/api/admin/stats');
//             setStats(res);
//         } catch (err) {
//             toast.error('Failed to load statistics');
//         } finally {
//             stopLoading();
//         }
//     };

//     const loadUsers = async (page = 1) => {
//         startLoading('users');
//         try {
//             const res = await getAuth(`/api/admin/users?page=${page}`);
//             setUsers(res);
//         } catch (err) {
//             toast.error('Failed to load users');
//         } finally {
//             stopLoading();
//         }
//     };

//     const loadGroups = async (page = 1) => {
//         startLoading('groups');
//         try {
//             const res = await getAuth(`/api/admin/groups?page=${page}`);
//             setGroups(res);
//         } catch (err) {
//             toast.error('Failed to load groups');
//         } finally {
//             stopLoading();
//         }
//     };

//     const loadPredictions = async (page = 1) => {
//         startLoading('predictions');
//         try {
//             const res = await getAuth(`/api/admin/predictions?page=${page}`);
//             setPredictions(res);
//         } catch (err) {
//             toast.error('Failed to load predictions');
//         } finally {
//             stopLoading();
//         }
//     };

//     const loadPolls = async (page = 1) => {
//         startLoading('polls');
//         try {
//             const res = await getAuth(`/api/admin/polls?page=${page}`);
//             setPolls(res);
//         } catch (err) {
//             toast.error('Failed to load polls');
//         } finally {
//             stopLoading();
//         }
//     };

//     const loadLeaderboard = async () => {
//         startLoading('leaderboard');
//         try {
//             const res = await getAuth('/api/admin/leaderboard');
//             setLeaderboard(res);
//         } catch (err) {
//             toast.error('Failed to load leaderboard');
//         } finally {
//             stopLoading();
//         }
//     };

//     // ── Open modal for Prediction or Poll ──────────────────────────
//     const openCreateModal = (type: 'prediction' | 'poll') => {
//         setCreateType(type);
//         setCreateModalOpen(true);

//         // Reset form fields
//         if (type === 'prediction') {
//             setPredText(''); setPredDesc(''); setPredLocationScope('global');
//             setPredVisibility('public'); setPredCorrectAnswer('');
//             setPredVotingEndDate(''); setPredSelectedFieldId(fields[0]?.id ?? null);
//             setPredSelectedGroupIds([]);
//         } else {
//             setPollText(''); setPollOptions(['', '', '']); setPollCorrectAnswer('');
//             setPollVotingEndDate(''); setPollVisibility('public');
//             setPollSelectedFieldId(fields[0]?.id ?? null);
//             setPollSelectedGroupIds([]);
//         }
//     };

//     // ── Publish Prediction ─────────────────────────────────────────
//     const handlePublishPrediction = async () => {
//         if (!predText.trim()) return toast.error('Prediction text is required');
//         if (predSelectedFieldId === null) return toast.error('Please select a category');
//         if (!predVotingEndDate) return toast.error('Please set voting end date');
//         if (!predCorrectAnswer.trim()) return toast.error('Correct answer is required');

//         const payload = {
//             field_id: predSelectedFieldId,
//             questions: predText.trim(),
//             description: predDesc.trim() || null,
//             location_scope: predLocationScope,
//             correct_answer: predCorrectAnswer.trim(),
//             visibility: predVisibility,
//             // start_date: new Date().toISOString(),
//             start_date: formatToMySQLDateTime(new Date().toISOString()),
//             // end_date: predVotingEndDate,
//             end_date: formatToMySQLDateTime(predVotingEndDate),
//             options: ['Yes', 'No'],
//             group_ids: predSelectedGroupIds,
//         };

//         try {
//             setSubmitting(true);
//             await postAuth('/api/predictions', payload);
//             toast.success('Prediction created!');
//             setCreateModalOpen(false);
//             loadPredictions(); // refresh list
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to create prediction');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // ── Publish Poll ───────────────────────────────────────────────
//     const handlePublishPoll = async () => {
//         if (!pollText.trim()) return toast.error('Poll question is required');
//         if (pollSelectedFieldId === null) return toast.error('Please select a category');
//         if (!pollVotingEndDate) return toast.error('Please set voting end date');

//         const validOptions = pollOptions.filter(o => o.trim());
//         if (validOptions.length < 2) return toast.error('At least 2 options required');

//         const payload = {
//             field_id: pollSelectedFieldId,
//             questions: pollText.trim(),
//             options: validOptions,
//             correct_answer: pollCorrectAnswer || null,
//             visibility: pollVisibility,
//             // end_date: pollVotingEndDate,
//             end_date: formatToMySQLDateTime(pollVotingEndDate),  // ← fixed
//             group_ids: pollSelectedGroupIds,
//             start_date: formatToMySQLDateTime(new Date().toISOString()),
//         };

//         try {
//             setSubmitting(true);
//             await postAuth('/api/polls', payload);
//             toast.success('Poll created!');
//             setCreateModalOpen(false);
//             loadPolls(); // refresh list
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to create poll');
//         } finally {
//             setSubmitting(false);
//         }
//     };


//     // Load single question details
//     const loadQuestionDetails = async (question: QuestionItem) => {
//         setSelectedQuestion(question);
//         setQuestionLoading(true);
//         setQuestionDetails(null);

//         try {
//             const res = await getAuth(`/api/admin/questions/${question.id}`);
//             setQuestionDetails(res);
//         } catch (err) {
//             toast.error('Failed to load question details');
//             console.error(err);
//         } finally {
//             setQuestionLoading(false);
//         }
//     };


//     // Load group details when "View" is clicked
//     const loadGroupDetails = async (group: Group) => {
//         setSelectedGroup(group);
//         setDetailsLoading(true);
//         setGroupDetails(null);

//         try {
//             const res = await getAuth(`/api/admin/groups/${group.id}`);
//             setGroupDetails(res);
//         } catch (err) {
//             toast.error('Failed to load group details');
//             console.error(err);
//         } finally {
//             setDetailsLoading(false);
//         }
//     };

//     const handleToggleUserBlock = async (userId: number) => {
//         try {
//             const res = await postAuth(`/api/admin/users/${userId}/block`);
//             toast.success(res.message);
//             if (users) {
//                 const updated = users.data.map(u =>
//                     u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u
//                 );
//                 setUsers({ ...users, data: updated });
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         }
//     };

//     const handleToggleGroupBlock = async (groupId: number) => {
//         try {
//             const res = await postAuth(`/api/admin/groups/${groupId}/block`);
//             toast.success(res.message);
//             if (groups) {
//                 const updated = groups.data.map(g =>
//                     g.id === groupId ? { ...g, is_blocked: !g.is_blocked } : g
//                 );
//                 setGroups({ ...groups, data: updated });
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         }
//     };

//     // Create Group
//     const handleCreateGroup = async () => {
//         if (!newGroupName.trim()) {
//             toast.error('Group name is required');
//             return;
//         }

//         setCreating(true);
//         try {
//             await postAuth('/api/groups', {
//                 name: newGroupName.trim(),
//                 description: newGroupDescription.trim(),
//                 is_private: isPrivate,
//             });

//             toast.success('Group created successfully');
//             setCreateDialogOpen(false);
//             setNewGroupName('');
//             setNewGroupDescription('');
//             setIsPrivate(false);
//             loadGroups();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed to create group');
//         } finally {
//             setCreating(false);
//         }
//     };

//     const StatCard = ({ title, value, icon: Icon, color }: any) => (
//         <Card className="glass-card border-white/10 overflow-hidden relative">
//             <div className={`absolute top-0 right-0 p-3 opacity-10`}>
//                 <Icon size={80} />
//             </div>
//             <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="flex items-center justify-between">
//                     <div className="text-2xl font-bold">
//                         {loading && activeLoader === 'stats' ? <Loader2 className="h-6 w-6 animate-spin" /> : (value ?? 0)}
//                     </div>
//                     <div className={`p-2 rounded-xl border border-white/10 ${color}`}>
//                         <Icon size={20} />
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     );

//     const PaginationControls = ({ data }: { data: PaginatedData<any> | null }) => {
//         if (!data || data.last_page <= 1) return null;
//         return (
//             <div className="mt-6 flex justify-center items-center gap-4">
//                 <Button
//                     variant="outline"
//                     size="sm"
//                     disabled={data.current_page === 1 || loading}
//                     onClick={() => {
//                         if (activeTab === 'users') loadUsers(data.current_page - 1);
//                         if (activeTab === 'groups') loadGroups(data.current_page - 1);
//                         if (activeTab === 'predictions') loadPredictions(data.current_page - 1);
//                         if (activeTab === 'polls') loadPolls(data.current_page - 1);
//                     }}
//                 >
//                     Previous
//                 </Button>
//                 <span className="text-sm text-muted-foreground">
//                     Page {data.current_page} of {data.last_page}
//                 </span>
//                 <Button
//                     variant="outline"
//                     size="sm"
//                     disabled={data.current_page === data.last_page || loading}
//                     onClick={() => {
//                         if (activeTab === 'users') loadUsers(data.current_page + 1);
//                         if (activeTab === 'groups') loadGroups(data.current_page + 1);
//                         if (activeTab === 'predictions') loadPredictions(data.current_page + 1);
//                         if (activeTab === 'polls') loadPolls(data.current_page + 1);
//                     }}
//                 >
//                     Next
//                 </Button>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-background pb-24 md:pb-6">
//             <TopNav />

//             <div className="max-w-7xl mx-auto px-4 py-8">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
//                         <p className="text-muted-foreground mt-1">Manage users, groups, content & system health.</p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-red-500/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
//                             onClick={handleLogout}
//                         >
//                             <LogOut size={16} className="mr-2" />
//                             Logout
//                         </Button>

//                         <div className="flex items-center gap-2">
//                             <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//                             <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
//                                 System Live
//                             </span>
//                         </div>
//                         </div>
//                 </div>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                     <StatCard title="Total Users" value={stats?.users} icon={Users} color="bg-blue-500/10 text-blue-500" />
//                     <StatCard title="Predictions" value={stats?.predictions} icon={TrendingUp} color="bg-purple-500/10 text-purple-500" />
//                     <StatCard title="Active Polls" value={stats?.polls} icon={PieChart} color="bg-pink-500/10 text-pink-500" />
//                     <StatCard title="Groups" value={stats?.groups} icon={Grid} color="bg-orange-500/10 text-orange-500" />
//                 </div>

//                 <Tabs
//                     value={activeTab}
//                     onValueChange={(val) => {
//                         setActiveTab(val);
//                         if (val === 'users' && !users) loadUsers();
//                         if (val === 'groups') loadGroups(); // always reload when switching to groups
//                         if (val === 'predictions' && !predictions) loadPredictions();
//                         if (val === 'polls' && !polls) loadPolls();
//                         if (val === 'leaderboard' && !leaderboard) loadLeaderboard();
//                     }}
//                     className="w-full space-y-6"
//                 >
//                     <TabsList className="glass-card border border-white/10 p-1 h-14 rounded-2xl md:w-fit flex flex-wrap gap-2">
//                         <TabsTrigger value="overview" className="h-full rounded-xl px-6">Overview</TabsTrigger>
//                         <TabsTrigger value="users" className="h-full rounded-xl px-6">Users</TabsTrigger>
//                         <TabsTrigger value="groups" className="h-full rounded-xl px-6">Groups</TabsTrigger>
//                         <TabsTrigger value="predictions" className="h-full rounded-xl px-6">Predictions</TabsTrigger>
//                         <TabsTrigger value="polls" className="h-full rounded-xl px-6">Polls</TabsTrigger>
//                         <TabsTrigger value="leaderboard" className="h-full rounded-xl px-6">Leaderboard</TabsTrigger>
//                         <TabsTrigger value="profile" className="h-full rounded-xl px-6 flex items-center gap-1.5">
//                             <UserCircle size={16} />
//                             Profile
//                         </TabsTrigger>
//                     </TabsList>

//                     {/* OVERVIEW */}
//                     <TabsContent value="overview" className="space-y-6">
//                         <Card className="glass-card border-white/10 overflow-hidden">
//                             <CardHeader>
//                                 <CardTitle>Quick Insights</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-4">
//                                     <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
//                                         <div className="flex items-center gap-4">
//                                             <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
//                                                 <CheckCircle size={20} />
//                                             </div>
//                                             <div>
//                                                 <p className="font-medium">System Performance</p>
//                                                 <p className="text-sm text-muted-foreground">All core services are operational.</p>
//                                             </div>
//                                         </div>
//                                         <Button variant="ghost" size="sm">Details</Button>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </TabsContent>

//                     {/* USERS */}
//                     <TabsContent value="users">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader>
//                                 <CardTitle>User Management</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'users' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">User</th>
//                                                         <th className="px-4 py-3">Role</th>
//                                                         <th className="px-4 py-3">Status</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {users?.data.map((user) => (
//                                                         <tr key={user.id} className="hover:bg-white/5 transition-colors">
//                                                             <td className="px-4 py-4">
//                                                                 <div className="flex items-center gap-3">
//                                                                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
//                                                                         {user.avatar_url ? (
//                                                                             <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
//                                                                         ) : (
//                                                                             <Users size={18} className="text-muted-foreground" />
//                                                                         )}
//                                                                     </div>
//                                                                     <div>
//                                                                         <p className="font-medium">{user.name}</p>
//                                                                         <p className="text-xs text-muted-foreground">@{user.username}</p>
//                                                                     </div>
//                                                                 </div>
//                                                             </td>
//                                                             <td className="px-4 py-4">
//                                                                 <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
//                                                                     {user.role}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-4 py-4">
//                                                                 {user.is_blocked ? (
//                                                                     <span className="flex items-center gap-1.5 text-rose-500 text-sm">
//                                                                         <Ban size={14} /> Blocked
//                                                                     </span>
//                                                                 ) : (
//                                                                     <span className="flex items-center gap-1.5 text-emerald-500 text-sm">
//                                                                         <CheckCircle size={14} /> Active
//                                                                     </span>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-4 py-4 text-right">
//                                                                 <Button
//                                                                     variant="ghost"
//                                                                     size="sm"
//                                                                     className={user.is_blocked ? "text-emerald-500 hover:text-emerald-400" : "text-rose-500 hover:text-rose-400"}
//                                                                     onClick={() => handleToggleUserBlock(user.id)}
//                                                                     disabled={loading}
//                                                                 >
//                                                                     {user.is_blocked ? 'Unblock' : 'Block'}
//                                                                 </Button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         <PaginationControls data={users} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>

//                     {/* GROUPS */}
//                     <TabsContent value="groups">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader className="flex flex-row items-center justify-between">
//                                 <CardTitle>Group Management</CardTitle>

//                                 <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//                                     <DialogTrigger asChild>
//                                         <Button size="sm">
//                                             <Plus size={16} className="mr-2" /> Create Group
//                                         </Button>
//                                     </DialogTrigger>
//                                     <DialogContent className="glass-card sm:max-w-md">
//                                         <DialogHeader>
//                                             <DialogTitle>Create New Group</DialogTitle>
//                                         </DialogHeader>
//                                         <div className="space-y-5 mt-5">
//                                             <div className="space-y-2">
//                                                 <Label>Group Name *</Label>
//                                                 <Input
//                                                     placeholder="Enter group name"
//                                                     value={newGroupName}
//                                                     onChange={(e) => setNewGroupName(e.target.value)}
//                                                     className="glass-card"
//                                                 />
//                                             </div>

//                                             <div className="space-y-2">
//                                                 <Label>Description</Label>
//                                                 <Textarea
//                                                     placeholder="Describe your group..."
//                                                     value={newGroupDescription}
//                                                     onChange={(e) => setNewGroupDescription(e.target.value)}
//                                                     className="glass-card min-h-[100px]"
//                                                 />
//                                             </div>

//                                             <div className="flex items-center gap-3">
//                                                 <input
//                                                     type="checkbox"
//                                                     id="private-group"
//                                                     checked={isPrivate}
//                                                     onChange={(e) => setIsPrivate(e.target.checked)}
//                                                     className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
//                                                 />
//                                                 <Label htmlFor="private-group" className="cursor-pointer font-normal">
//                                                     Make this group private
//                                                 </Label>
//                                             </div>

//                                             <Button
//                                                 className="w-full"
//                                                 onClick={handleCreateGroup}
//                                                 disabled={creating || !newGroupName.trim()}
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//                                                 }}
//                                             >
//                                                 {creating ? (
//                                                     <>
//                                                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                                         Creating...
//                                                     </>
//                                                 ) : (
//                                                     'Create Group'
//                                                 )}
//                                             </Button>
//                                         </div>
//                                     </DialogContent>
//                                 </Dialog>
//                             </CardHeader>

//                             <CardContent>
//                                 {loading && activeLoader === 'groups' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : !groups ? (
//                                     <div className="text-center py-12 text-muted-foreground">
//                                         Groups data not loaded yet.
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">Group Name</th>
//                                                         <th className="px-4 py-3">Creator</th>
//                                                         <th className="px-4 py-3">Members</th>
//                                                         <th className="px-4 py-3">Status</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {groups.data?.length > 0 ? (
//                                                         groups.data.map((group) => (
//                                                             <tr key={group.id} className="hover:bg-white/5 transition-colors">
//                                                                 <td className="px-4 py-4 font-medium">
//                                                                     {group.name || '(no name)'}
//                                                                 </td>
//                                                                 <td className="px-4 py-4">
//                                                                     {group.user ? `@${group.user.username}` : '— (deleted/unknown)'}
//                                                                 </td>
//                                                                 <td className="px-4 py-4">{group.members_count}</td>
//                                                                 <td className="px-4 py-4">
//                                                                     {group.is_blocked ? (
//                                                                         <span className="flex items-center gap-1.5 text-rose-500 text-sm">
//                                                                             <Ban size={14} /> Blocked
//                                                                         </span>
//                                                                     ) : (
//                                                                         <span className="flex items-center gap-1.5 text-emerald-500 text-sm">
//                                                                             <CheckCircle size={14} /> Active
//                                                                         </span>
//                                                                     )}
//                                                                 </td>
//                                                                 <td className="px-4 py-4 text-right space-x-3">
//                                                                     <Button
//                                                                         variant="ghost"
//                                                                         size="sm"
//                                                                         onClick={() => loadGroupDetails(group)}
//                                                                     >
//                                                                         View
//                                                                     </Button>

//                                                                     {group.is_member ? (
//                                                                         <Button
//                                                                             variant="destructive"
//                                                                             size="sm"
//                                                                             onClick={() => {/* leave logic if needed */}}
//                                                                         >
//                                                                             Leave
//                                                                         </Button>
//                                                                     ) : (
//                                                                         <Button
//                                                                             variant="outline"
//                                                                             size="sm"
//                                                                             className="border-primary/50 hover:bg-primary/10"
//                                                                             onClick={() => {/* join logic if needed */}}
//                                                                         >
//                                                                             Join
//                                                                         </Button>
//                                                                     )}

//                                                                     <Button
//                                                                         variant="ghost"
//                                                                         size="sm"
//                                                                         className={group.is_blocked ? "text-emerald-500 hover:text-emerald-400" : "text-rose-500 hover:text-rose-400"}
//                                                                         onClick={() => handleToggleGroupBlock(group.id)}
//                                                                         disabled={loading}
//                                                                     >
//                                                                         {group.is_blocked ? 'Unblock' : 'Block'}
//                                                                     </Button>
//                                                                 </td>
//                                                             </tr>
//                                                         ))
//                                                     ) : (
//                                                         <tr>
//                                                             <td colSpan={5} className="text-center py-8 text-muted-foreground">
//                                                                 No groups found
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>

//                                         <PaginationControls data={groups} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>

//                         {/* ─── GROUP DETAILS MODAL ──────────────────────────────────────── */}
//                         <Dialog
//                             open={!!selectedGroup}
//                             onOpenChange={(open) => {
//                                 if (!open) {
//                                     setSelectedGroup(null);
//                                     setGroupDetails(null);
//                                 }
//                             }}
//                         >
//                             <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
//                                 <DialogHeader>
//                                     <DialogTitle className="text-xl">
//                                         {selectedGroup?.name || 'Group Details'}
//                                     </DialogTitle>
//                                     <p className="text-sm text-muted-foreground mt-1">
//                                         {selectedGroup?.description || 'No description'}
//                                     </p>
//                                 </DialogHeader>

//                                 {detailsLoading ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                                     </div>
//                                 ) : groupDetails ? (
//                                     <div className="space-y-8 mt-6">
//                                         {/* Members Section */}
//                                         <div>
//                                             <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                                                 <Users size={20} />
//                                                 Joined Members ({groupDetails.members_count || 0})
//                                             </h3>

//                                             {groupDetails.members?.length > 0 ? (
//                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                                     {groupDetails.members.map((member: any) => (
//                                                         <div
//                                                             key={member.id}
//                                                             className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
//                                                         >
//                                                             <Avatar className="h-10 w-10">
//                                                                 <AvatarImage src={member.avatar_url} alt={member.name} />
//                                                                 <AvatarFallback>
//                                                                     {member.name?.charAt(0) || '?'}
//                                                                 </AvatarFallback>
//                                                             </Avatar>
//                                                             <div>
//                                                                 <p className="font-medium">{member.name}</p>
//                                                                 <p className="text-xs text-muted-foreground">
//                                                                     @{member.username}
//                                                                 </p>
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center py-8 text-muted-foreground">
//                                                     No members yet
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Questions Section */}
//                                         <div>
//                                             <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                                                 <MessageSquare size={20} />
//                                                 Shared Questions ({groupDetails.questions?.length || 0})
//                                             </h3>

//                                             {groupDetails.questions?.length > 0 ? (
//                                                 <div className="space-y-4">
//                                                     {groupDetails.questions.map((q: any) => (
//                                                         <div
//                                                             key={q.id}
//                                                             className="p-4 rounded-lg bg-white/5 border border-white/10"
//                                                         >
//                                                             <p className="font-medium mb-1">
//                                                                 {q.questions.substring(0, 120)}
//                                                                 {q.questions.length > 120 ? '...' : ''}
//                                                             </p>
//                                                             <div className="flex items-center gap-3 text-sm text-muted-foreground">
//                                                                 <span className="capitalize">{q.module_type}</span>
//                                                                 <span>•</span>
//                                                                 <span>by @{q.user?.username || 'unknown'}</span>
//                                                                 <span>•</span>
//                                                                 <span>
//                                                                     {new Date(q.created_at).toLocaleDateString()}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center py-8 text-muted-foreground">
//                                                     No questions shared in this group yet
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12 text-muted-foreground">
//                                         Failed to load details
//                                     </div>
//                                 )}

//                                 <div className="flex justify-end mt-6">
//                                     <Button variant="outline" onClick={() => setSelectedGroup(null)}>
//                                         Close
//                                     </Button>
//                                 </div>
//                             </DialogContent>
//                         </Dialog>
//                     </TabsContent>

//                     {/* ──────────────────────────────────────────────── */}
//                     {/* PREDICTIONS */}
//                     {/* ──────────────────────────────────────────────── */}
//                     {/* <TabsContent value="predictions">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader>
//                                 <CardTitle>Predictions Management</CardTitle>
//                                 <Button
//                                     onClick={() => openCreateModal('prediction')}
//                                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                                 >
//                                     <Plus size={16} className="mr-2" /> Add Prediction
//                                 </Button>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'predictions' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">Question</th>
//                                                         <th className="px-4 py-3">Created By</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {predictions?.data.map((q) => (
//                                                         <tr key={q.id} className="hover:bg-white/5">
//                                                             <td className="px-4 py-4">{q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}</td>
//                                                             <td className="px-4 py-4">{q.user ? `@${q.user.username}` : '—'}</td>
//                                                             <td className="px-4 py-4 text-right">
//                                                                 <Button variant="ghost" size="sm">View</Button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         <PaginationControls data={predictions} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent> */}

//                     <TabsContent value="predictions">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader className="flex flex-row items-center justify-between">
//                                 <CardTitle>Predictions Management</CardTitle>
//                                 <Button
//                                     onClick={() => openCreateModal('prediction')}
//                                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                                 >
//                                     <Plus size={16} className="mr-2" /> Add Prediction
//                                 </Button>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'predictions' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">Question</th>
//                                                         <th className="px-4 py-3">Created By</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {predictions?.data.map((q) => (
//                                                         <tr key={q.id} className="hover:bg-white/5 transition-colors">
//                                                             <td className="px-4 py-4">
//                                                                 {q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}
//                                                             </td>
//                                                             <td className="px-4 py-4">
//                                                                 {q.user ? `@${q.user.username}` : '—'}
//                                                             </td>
//                                                             <td className="px-4 py-4 text-right">
//                                                                 <Button
//                                                                     variant="ghost"
//                                                                     size="sm"
//                                                                     onClick={() => loadQuestionDetails(q)}
//                                                                 >
//                                                                     View
//                                                                 </Button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         <PaginationControls data={predictions} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>




//                     {/* ──────────────────────────────────────────────── */}
//                     {/* POLLS */}
//                     {/* ──────────────────────────────────────────────── */}
//                     {/* <TabsContent value="polls">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader>
//                                 <CardTitle>Polls Management</CardTitle>
//                                 <Button
//                                     onClick={() => openCreateModal('poll')}
//                                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                                 >
//                                     <Plus size={16} className="mr-2" /> Add Poll
//                                 </Button>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'polls' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">Poll Question</th>
//                                                         <th className="px-4 py-3">Created By</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {polls?.data.map((q) => (
//                                                         <tr key={q.id} className="hover:bg-white/5">
//                                                             <td className="px-4 py-4">{q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}</td>
//                                                             <td className="px-4 py-4">{q.user ? `@${q.user.username}` : '—'}</td>
//                                                             <td className="px-4 py-4 text-right">
//                                                                 <Button variant="ghost" size="sm">View</Button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         <PaginationControls data={polls} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent> */}

//                     <TabsContent value="polls">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader className="flex flex-row items-center justify-between">
//                                 <CardTitle>Polls Management</CardTitle>
//                                 <Button
//                                     onClick={() => openCreateModal('poll')}
//                                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                                 >
//                                     <Plus size={16} className="mr-2" /> Add Poll
//                                 </Button>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'polls' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left">
//                                                 <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                     <tr>
//                                                         <th className="px-4 py-3">Poll Question</th>
//                                                         <th className="px-4 py-3">Created By</th>
//                                                         <th className="px-4 py-3 text-right">Actions</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-white/5">
//                                                     {polls?.data.map((q) => (
//                                                         <tr key={q.id} className="hover:bg-white/5 transition-colors">
//                                                             <td className="px-4 py-4">
//                                                                 {q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}
//                                                             </td>
//                                                             <td className="px-4 py-4">
//                                                                 {q.user ? `@${q.user.username}` : '—'}
//                                                             </td>
//                                                             <td className="px-4 py-4 text-right">
//                                                                 <Button
//                                                                     variant="ghost"
//                                                                     size="sm"
//                                                                     onClick={() => loadQuestionDetails(q)}
//                                                                 >
//                                                                     View
//                                                                 </Button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         <PaginationControls data={polls} />
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>

//                     {/* ──────────────────────────────────────────────── */}
//                     {/* LEADERBOARD */}
//                     {/* ──────────────────────────────────────────────── */}
//                     <TabsContent value="leaderboard">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader>
//                                 <CardTitle>Leaderboard</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 {loading && activeLoader === 'leaderboard' ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : (
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full text-left">
//                                             <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
//                                                 <tr>
//                                                     <th className="px-4 py-3 w-12">#</th>
//                                                     <th className="px-4 py-3">User</th>
//                                                     <th className="px-4 py-3 text-right">Score</th>
//                                                     <th className="px-4 py-3 text-right">Accuracy</th>
//                                                     <th className="px-4 py-3 text-right">Correct / Total</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="divide-y divide-white/5">
//                                              {leaderboard?.data.map((entry, index) => {
//     const acc = Number(entry.accuracy) || 0;
//     const score = Number(entry.score) || 0;
//     const correct = Number(entry.correct_predictions) || 0;
//     const total = Number(entry.total_predictions) || 0;

//     return (
//         <tr key={entry.user?.id || index} className="hover:bg-white/5">
//             <td className="px-4 py-4 font-bold">
//                 {(leaderboard.current_page - 1) * 20 + index + 1}
//             </td>
//             <td className="px-4 py-4">
//                 <div className="flex items-center gap-3">
//                     {entry.user?.avatar_url && (
//                         <img
//                             src={entry.user.avatar_url}
//                             alt=""
//                             className="w-8 h-8 rounded-full object-cover"
//                         />
//                     )}
//                     <div>
//                         <p className="font-medium">
//                             {entry.user?.name || '—'}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                             @{entry.user?.username || 'unknown'}
//                         </p>
//                     </div>
//                 </div>
//             </td>
//             <td className="px-4 py-4 text-right font-bold">{score}</td>
//             <td className="px-4 py-4 text-right">{acc.toFixed(1)}%</td>
//             <td className="px-4 py-4 text-right">
//                 {correct} / {total}
//             </td>
//         </tr>
//     );
// })}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>



//                      {/* New Profile Tab */}
//                     <TabsContent value="profile" className="space-y-6">
//                         <Card className="glass-card border-white/10">
//                             <CardHeader>
//                                 <CardTitle>Admin Profile</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 {profileLoading ? (
//                                     <div className="flex justify-center py-12">
//                                         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                                     </div>
//                                 ) : adminProfile ? (
//                                     <div className="space-y-8">
//                                         <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//                                             <Avatar className="h-24 w-24 border-4 border-primary/30">
//                                                 <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.name} />
//                                                 <AvatarFallback className="text-3xl bg-primary/20">
//                                                     {adminProfile.name?.[0]?.toUpperCase() || 'A'}
//                                                 </AvatarFallback>
//                                             </Avatar>

//                                             <div className="space-y-2">
//                                                 <h2 className="text-2xl font-bold">{adminProfile.name}</h2>
//                                                 <p className="text-muted-foreground">@{adminProfile.username}</p>
//                                                 <div className="flex items-center gap-3">
//                                                     <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
//                                                         {adminProfile.role.toUpperCase()}
//                                                     </span>
//                                                     <span className="text-sm text-emerald-400 flex items-center gap-1">
//                                                         <CheckCircle size={14} /> Active
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                             <div className="space-y-4">
//                                                 <div>
//                                                     <Label className="text-muted-foreground">Email</Label>
//                                                     <p className="font-medium">{adminProfile.email}</p>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-muted-foreground">User ID</Label>
//                                                     <p className="font-medium">#{adminProfile.id}</p>
//                                                 </div>
//                                             </div>

//                                             <div className="space-y-4">
//                                                 <div>
//                                                     <Label className="text-muted-foreground">Joined</Label>
//                                                     <p className="font-medium">
//                                                         {adminProfile.created_at
//                                                             ? new Date(adminProfile.created_at).toLocaleDateString('en-US', {
//                                                                 year: 'numeric', month: 'long', day: 'numeric'
//                                                             })
//                                                             : '—'}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* You can add more sections: change password, update avatar, etc. */}
//                                         <div className="pt-6 border-t border-white/10">
//                                             {/* <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
//                                                 Edit Profile (coming soon)
//                                             </Button> */}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12 text-muted-foreground">
//                                         Failed to load profile information
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </TabsContent>           


//                 </Tabs>







// {/* ─── CREATE PREDICTION / POLL MODAL ──────────────────────────────────────── */}
//                {/* ─── CREATE PREDICTION / POLL MODAL ──────────────────────────────────────── */}
// <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
//                     <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
//                         <DialogHeader>
//                             <DialogTitle className="text-2xl">
//                                 {createType === 'prediction' ? 'Create New Prediction' : 'Create New Poll'}
//                             </DialogTitle>
//                         </DialogHeader>

//                         {createType === 'prediction' ? (
//                             <div className="space-y-6 mt-6">
//                                 {/* Category */}
//                                 <div className="space-y-2">
//                                     <Label>Category</Label>
//                                     <Select
//                                         value={predSelectedFieldId?.toString() ?? ''}
//                                         onValueChange={v => setPredSelectedFieldId(Number(v))}
//                                     >
//                                         <SelectTrigger className="glass-card">
//                                             <SelectValue placeholder="Select category" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {fields.map(f => (
//                                                 <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {/* Prediction Text */}
//                                 <div className="space-y-2">
//                                     <Label>Your Prediction</Label>
//                                     <Textarea
//                                         placeholder="What do you predict will happen?"
//                                         value={predText}
//                                         onChange={e => setPredText(e.target.value)}
//                                         className="glass-card min-h-32"
//                                         maxLength={500}
//                                     />
//                                 </div>

//                                 {/* Description */}
//                                 <div className="space-y-2">
//                                     <Label>Description (optional)</Label>
//                                     <Textarea
//                                         placeholder="Add context or evidence..."
//                                         value={predDesc}
//                                         onChange={e => setPredDesc(e.target.value)}
//                                         className="glass-card min-h-24"
//                                     />
//                                 </div>

//                                 {/* Location & Visibility */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div className="space-y-2">
//                                         <Label>Location Scope</Label>
//                                         <Select value={predLocationScope} onValueChange={v => setPredLocationScope(v as any)}>
//                                             <SelectTrigger className="glass-card">
//                                                 <SelectValue />
//                                             </SelectTrigger>
//                                             <SelectContent>
//                                                 <SelectItem value="global">Global</SelectItem>
//                                                 <SelectItem value="country">Country</SelectItem>
//                                                 <SelectItem value="city">City</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                     <div className="space-y-2">
//                                         <Label>Visibility</Label>
//                                         <RadioGroup value={predVisibility} onValueChange={v => setPredVisibility(v as any)} className="flex gap-6">
//                                             <div className="flex items-center space-x-2">
//                                                 <RadioGroupItem value="public" id="pred-public" />
//                                                 <Label htmlFor="pred-public">Public</Label>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <RadioGroupItem value="private" id="pred-private" />
//                                                 <Label htmlFor="pred-private">Private</Label>
//                                             </div>
//                                         </RadioGroup>
//                                     </div>
//                                 </div>

//                                 {/* Group Sharing */}
//                                 {predVisibility === 'private' && myGroups.length > 0 && (
//                                     <div className="space-y-3">
//                                         <Label>Share with Groups (Optional)</Label>
//                                         <div className="flex flex-wrap gap-2">
//                                             {myGroups.map(g => (
//                                                 <button
//                                                     key={g.id}
//                                                     onClick={() => setPredSelectedGroupIds(prev =>
//                                                         prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
//                                                     )}
//                                                     className={`px-4 py-2 rounded-full border text-sm ${predSelectedGroupIds.includes(g.id)
//                                                         ? 'bg-primary/20 border-primary text-primary'
//                                                         : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
//                                                         }`}
//                                                 >
//                                                     {g.name}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Due Date */}
//                                 <div className="space-y-2">
//                                     <Label>Due Date (Voting Ends)</Label>
//                                     <Input
//                                         type="datetime-local"
//                                         value={predVotingEndDate}
//                                         onChange={e => setPredVotingEndDate(e.target.value)}
//                                         className="glass-card"
//                                         min={new Date().toISOString().slice(0, 16)}
//                                     />
//                                 </div>

//                                 {/* Correct Answer */}
//                                 <div className="space-y-2">
//                                     <Label>Correct Answer (Expected Outcome)</Label>
//                                     <Select value={predCorrectAnswer} onValueChange={setPredCorrectAnswer}>
//                                         <SelectTrigger className="glass-card">
//                                             <SelectValue placeholder="Choose expected result" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             <SelectItem value="Yes">Yes</SelectItem>
//                                             <SelectItem value="No">No</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 <div className="flex justify-end gap-4 mt-8">
//                                     <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         onClick={handlePublishPrediction}
//                                         disabled={submitting}
//                                         className="bg-gradient-to-r from-purple-600 to-pink-600"
//                                     >
//                                         {submitting ? 'Publishing...' : 'Publish Prediction'}
//                                     </Button>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="space-y-6 mt-6">
//                                 {/* Category */}
//                                 <div className="space-y-2">
//                                     <Label>Category</Label>
//                                     <Select
//                                         value={pollSelectedFieldId?.toString() ?? ''}
//                                         onValueChange={v => setPollSelectedFieldId(Number(v))}
//                                     >
//                                         <SelectTrigger className="glass-card">
//                                             <SelectValue placeholder="Select category" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {fields.map(f => (
//                                                 <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
//                                             ))}
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {/* Poll Question */}
//                                 <div className="space-y-2">
//                                     <Label>Poll Question</Label>
//                                     <Textarea
//                                         placeholder="What would you like to ask?"
//                                         value={pollText}
//                                         onChange={e => setPollText(e.target.value)}
//                                         className="glass-card min-h-32"
//                                         maxLength={500}
//                                     />
//                                 </div>

//                                 {/* Poll Options */}
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center">
//                                         <Label>Options (2–6)</Label>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => {
//                                                 if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
//                                             }}
//                                             disabled={pollOptions.length >= 6}
//                                         >
//                                             <Plus size={14} className="mr-1.5" /> Add Option
//                                         </Button>
//                                     </div>
//                                     <div className="space-y-3">
//                                         {pollOptions.map((opt, i) => (
//                                             <div key={i} className="flex gap-2 items-center">
//                                                 <Input
//                                                     value={opt}
//                                                     onChange={e => {
//                                                         const updated = [...pollOptions];
//                                                         updated[i] = e.target.value;
//                                                         setPollOptions(updated);
//                                                     }}
//                                                     placeholder={`Option ${i + 1}`}
//                                                     className="glass-card"
//                                                 />
//                                                 {pollOptions.length > 2 && (
//                                                     <Button
//                                                         variant="ghost"
//                                                         size="icon"
//                                                         onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
//                                                     >
//                                                         <X size={18} className="text-red-400" />
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Correct Answer */}
//                                 <div className="space-y-2">
//                                     <Label>Correct Answer (Optional for Rewards)</Label>
//                                     <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
//                                         <SelectTrigger className="glass-card">
//                                             <SelectValue placeholder="Select correct option" />
//                                         </SelectTrigger>
//                                         <SelectContent>
//                                             {pollOptions.filter(o => o.trim()).map((opt, i) => (
//                                                 <SelectItem key={i} value={opt.trim()}>
//                                                     {opt.trim()}
//                                                 </SelectItem>
//                                             ))}
//                                             <SelectItem value="none">None / No correct answer</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div>

//                                 {/* Due Date & Visibility */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div className="space-y-2">
//                                         <Label>Due Date (Voting Ends)</Label>
//                                         <Input
//                                             type="datetime-local"
//                                             value={pollVotingEndDate}
//                                             onChange={e => setPollVotingEndDate(e.target.value)}
//                                             className="glass-card"
//                                             min={new Date().toISOString().slice(0, 16)}
//                                         />
//                                     </div>
//                                     <div className="space-y-2">
//                                         <Label>Visibility</Label>
//                                         <RadioGroup value={pollVisibility} onValueChange={v => setPollVisibility(v as any)} className="flex gap-6">
//                                             <div className="flex items-center space-x-2">
//                                                 <RadioGroupItem value="public" id="poll-public" />
//                                                 <Label htmlFor="poll-public">Public</Label>
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <RadioGroupItem value="private" id="poll-private" />
//                                                 <Label htmlFor="poll-private">Private</Label>
//                                             </div>
//                                         </RadioGroup>
//                                     </div>
//                                 </div>

//                                 {/* Group Sharing */}
//                                 {pollVisibility === 'private' && myGroups.length > 0 && (
//                                     <div className="space-y-3">
//                                         <Label>Share with Groups (Optional)</Label>
//                                         <div className="flex flex-wrap gap-2">
//                                             {myGroups.map(g => (
//                                                 <button
//                                                     key={g.id}
//                                                     onClick={() => setPollSelectedGroupIds(prev =>
//                                                         prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
//                                                     )}
//                                                     className={`px-4 py-2 rounded-full border text-sm ${pollSelectedGroupIds.includes(g.id)
//                                                         ? 'bg-primary/20 border-primary text-primary'
//                                                         : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
//                                                         }`}
//                                                 >
//                                                     {g.name}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 <div className="flex justify-end gap-4 mt-8">
//                                     <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         onClick={handlePublishPoll}
//                                         disabled={submitting}
//                                         className="bg-gradient-to-r from-purple-600 to-pink-600"
//                                     >
//                                         {submitting ? 'Publishing...' : 'Publish Poll'}
//                                     </Button>
//                                 </div>
//                             </div>
//                         )}
//                     </DialogContent>
//                 </Dialog>







// {/* ─── QUESTION DETAILS MODAL ───────────────────────────────────── */}
//                 <Dialog
//                     open={!!selectedQuestion}
//                     onOpenChange={(open) => {
//                         if (!open) {
//                             setSelectedQuestion(null);
//                             setQuestionDetails(null);
//                         }
//                     }}
//                 >
//                     <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
//                         <DialogHeader>
//                             <DialogTitle className="text-xl">
//                                 {selectedQuestion?.module_type === 'prediction' ? 'Prediction' : 'Poll'} Details
//                             </DialogTitle>
//                             <p className="text-sm text-muted-foreground mt-1">
//                                 {selectedQuestion?.questions.substring(0, 120)}{selectedQuestion?.questions.length > 120 ? '...' : ''}
//                             </p>
//                         </DialogHeader>

//                         {questionLoading ? (
//                             <div className="flex justify-center py-12">
//                                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                             </div>
//                         ) : questionDetails ? (
//                             <div className="space-y-8 mt-6">
//                                 {/* Basic Info */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <h3 className="text-lg font-semibold mb-2">Details</h3>
//                                         <div className="space-y-2 text-sm">
//                                             <p><strong>Category:</strong> {questionDetails.field?.fields || '—'}</p>
//                                             <p><strong>Posted by:</strong> @{questionDetails.user?.username || 'unknown'}</p>
//                                             <p><strong>Visibility:</strong> <span className="capitalize">{questionDetails.visibility || '—'}</span></p>
//                                             <p><strong>Location Scope:</strong> <span className="capitalize">{questionDetails.location_scope || '—'}</span></p>
//                                             <p><strong>Created:</strong> {questionDetails.created_at ? new Date(questionDetails.created_at).toLocaleString() : '—'}</p>
//                                             <p><strong>Voting Ends:</strong> {questionDetails.end_date ? new Date(questionDetails.end_date).toLocaleString() : '—'}</p>
//                                             {questionDetails.answers_count !== undefined && (
//                                                 <p><strong>Total Answers/Votes:</strong> {questionDetails.answers_count}</p>
//                                             )}
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <h3 className="text-lg font-semibold mb-2">Correct / Expected Answer</h3>
//                                         <p className="text-lg font-medium">
//                                             {questionDetails.correct_answer || 'Not set / Open opinion'}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Poll Options */}
//                                 {questionDetails.module_type === 'poll' && questionDetails.options?.length > 0 && (
//                                     <div>
//                                         <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                                             <MessageSquare size={20} />
//                                             Poll Options
//                                         </h3>
//                                         <div className="space-y-2">
//                                             {questionDetails.options.map((opt: string, i: number) => (
//                                                 <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
//                                                     {opt}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Description */}
//                                 {questionDetails.description && (
//                                     <div>
//                                         <h3 className="text-lg font-semibold mb-3">Description</h3>
//                                         <p className="text-muted-foreground whitespace-pre-wrap">{questionDetails.description}</p>
//                                     </div>
//                                 )}

//                                 {/* Recent Answers Preview */}
//                                 {questionDetails.answers?.length > 0 && (
//                                     <div>
//                                         <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                                             <CheckCircle size={20} />
//                                             Recent Answers ({questionDetails.answers_count || questionDetails.answers.length})
//                                         </h3>
//                                         <div className="space-y-3 max-h-60 overflow-y-auto">
//                                             {questionDetails.answers.map((ans: any) => (
//                                                 <div key={ans.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
//                                                     <div className="flex items-center gap-2 mb-1">
//                                                         <Avatar className="h-6 w-6">
//                                                             <AvatarImage src={ans.user?.avatar_url} />
//                                                             <AvatarFallback>{ans.user?.name?.[0] || '?'}</AvatarFallback>
//                                                         </Avatar>
//                                         <span className="font-medium">@{ans.user?.username || 'anonymous'}</span>
//                                         <span className="text-xs text-muted-foreground">
//                                             {new Date(ans.created_at).toLocaleString()}
//                                         </span>
//                                     </div>
//                                     <p className="text-sm">Answered: <strong>{ans.answer}</strong></p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         ) : (
//             <div className="text-center py-12 text-muted-foreground">
//                 Failed to load question details
//             </div>
//         )}

//         <div className="flex justify-end mt-8">
//             <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
//                 Close
//             </Button>
//         </div>
//     </DialogContent>
// </Dialog>





//             </div>

//             <MobileNav />
//         </div>
//     );
// }



















import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MessageSquare, Layers, Shield, Ban, CheckCircle,
    ChevronRight, TrendingUp, PieChart, Grid, Trophy, Plus,
    Loader2, Lock, Globe, X,
    LogOut,
    UserCircle
} from 'lucide-react';
// UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// Your helpers & others
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import { getAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store/hooks';
import { logoutUser, checkAuthStatus } from '@/app/modules/auth/authSlice';

interface Stats {
    users: number;
    predictions: number;
    polls: number;
    groups: number;
}
interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    is_blocked: boolean;
    avatar_url?: string;
}
interface Group {
    id: number;
    name: string;
    description?: string;
    is_private: boolean;
    user: { id: number; name: string; username: string } | null;
    members_count: number;
    is_blocked: boolean;
    is_member?: boolean;
}
interface QuestionItem {
    id: number;
    questions: string;
    module_type: 'prediction' | 'poll';
    user?: { name: string; username: string };
}
interface LeaderboardEntry {
    user: { id: number; name: string; username: string; avatar_url?: string };
    score: number;
    accuracy: number;
    correct_predictions: number;
    total_predictions: number;
}
interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

export function AdminDashboardScreen() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<PaginatedData<User> | null>(null);
    const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
    const [predictions, setPredictions] = useState<PaginatedData<QuestionItem> | null>(null);
    const [polls, setPolls] = useState<PaginatedData<QuestionItem> | null>(null);
    const [leaderboard, setLeaderboard] = useState<PaginatedData<LeaderboardEntry> | null>(null);

    // Create group modal states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Group details modal states
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupDetails, setGroupDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Question details modal states
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
    const [questionDetails, setQuestionDetails] = useState<any>(null);
    const [questionLoading, setQuestionLoading] = useState(false);

    // Prediction / Poll creation modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createType, setCreateType] = useState<'prediction' | 'poll' | null>(null);

    // ── Prediction Form State ───────────────────────────────────────
    const [predText, setPredText] = useState('');
    const [predDesc, setPredDesc] = useState('');
    const [predLocationScope, setPredLocationScope] = useState<'global' | 'country' | 'city'>('global');
    const [predVisibility, setPredVisibility] = useState<'public' | 'private'>('public');
    const [predCorrectAnswer, setPredCorrectAnswer] = useState('');
    const [predVotingEndDate, setPredVotingEndDate] = useState('');
    const [predSelectedFieldId, setPredSelectedFieldId] = useState<number | null>(null);
    const [predSelectedGroupIds, setPredSelectedGroupIds] = useState<number[]>([]);

    // ── Poll Form State ─────────────────────────────────────────────
    const [pollText, setPollText] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
    const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
    const [pollVotingEndDate, setPollVotingEndDate] = useState('');
    const [pollVisibility, setPollVisibility] = useState<'public' | 'private'>('public');
    const [pollSelectedFieldId, setPollSelectedFieldId] = useState<number | null>(null);
    const [pollSelectedGroupIds, setPollSelectedGroupIds] = useState<number[]>([]);

    const [adminProfile, setAdminProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Reference data (shared)
    const [fields, setFields] = useState([]);
    const [myGroups, setMyGroups] = useState([]);

    const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

    // Joined groups tracking for admin
    const [joinedGroupIds, setJoinedGroupIds] = useState<number[]>([]);
    // const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null); // loading per group

    const [loadingRefs, setLoadingRefs] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeLoader, setActiveLoader] = useState<string | null>(null);

    const formatToMySQLDateTime = (dateStr: string): string | null => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
                   `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
        } catch {
            return null;
        }
    };

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            toast.success('Logged out successfully');
            navigate('/auth', { replace: true });
        } catch (err) {
            console.error('Logout failed:', err);
            toast.error('Logout failed – redirecting anyway');
            navigate('/auth', { replace: true });
        }
    };

    // Load admin profile
    const loadAdminProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await getAuth('/api/user');
            setAdminProfile(res || res);
        } catch (err) {
            toast.error('Failed to load profile');
            console.error(err);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'profile' && !adminProfile) {
            loadAdminProfile();
        }
    }, [activeTab, adminProfile]);

    // ── Load shared reference data ────────────────────────────────
    useEffect(() => {
        const loadRefs = async () => {
            try {
                setLoadingRefs(true);
                const [fieldsRes, groupsRes] = await Promise.all([
                    getAuth('/api/fields'),
                    getAuth('/api/groups?my_groups=1'),
                ]);
                setFields(fieldsRes?.data ?? fieldsRes ?? []);
                setMyGroups(groupsRes?.data ?? groupsRes ?? []);

                // Set joined groups from my_groups endpoint
                const joined = groupsRes?.data?.map((g: any) => g.id) || [];
                setJoinedGroupIds(joined);
            } catch (err) {
                toast.error('Failed to load form data');
            } finally {
                setLoadingRefs(false);
            }
        };
        loadRefs();
    }, []);

    // Load stats on mount
    useEffect(() => {
        loadStats();
    }, []);

    const startLoading = (key: string) => {
        setLoading(true);
        setActiveLoader(key);
    };

    const stopLoading = () => {
        setLoading(false);
        setActiveLoader(null);
    };

    const loadStats = async () => {
        startLoading('stats');
        try {
            const res = await getAuth('/api/admin/stats');
            setStats(res);
        } catch (err) {
            toast.error('Failed to load statistics');
        } finally {
            stopLoading();
        }
    };

    const loadUsers = async (page = 1) => {
        startLoading('users');
        try {
            const res = await getAuth(`/api/admin/users?page=${page}`);
            setUsers(res);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            stopLoading();
        }
    };

    const loadGroups = async (page = 1) => {
        startLoading('groups');
        try {
            const res = await getAuth(`/api/admin/groups?page=${page}`);
            setGroups(res);
        } catch (err) {
            toast.error('Failed to load groups');
        } finally {
            stopLoading();
        }
    };

    const loadPredictions = async (page = 1) => {
        startLoading('predictions');
        try {
            const res = await getAuth(`/api/admin/predictions?page=${page}`);
            setPredictions(res);
        } catch (err) {
            toast.error('Failed to load predictions');
        } finally {
            stopLoading();
        }
    };

    const loadPolls = async (page = 1) => {
        startLoading('polls');
        try {
            const res = await getAuth(`/api/admin/polls?page=${page}`);
            setPolls(res);
        } catch (err) {
            toast.error('Failed to load polls');
        } finally {
            stopLoading();
        }
    };

    const loadLeaderboard = async () => {
        startLoading('leaderboard');
        try {
            const res = await getAuth('/api/admin/leaderboard');
            setLeaderboard(res);
        } catch (err) {
            toast.error('Failed to load leaderboard');
        } finally {
            stopLoading();
        }
    };

    // ── Join / Leave Group Logic ─────────────────────────────────────────
  const handleJoinGroup = async (group: Group) => {
    if (joiningGroupId === group.id || group.is_private) return;

    setJoiningGroupId(group.id);

    try {
        await postAuth(`/api/groups/${group.id}/join`);
        toast.success(`Successfully joined ${group.name}`);

        // Optimistic UI update
        if (groups) {
            setGroups({
                ...groups,
                data: groups.data.map(g =>
                    g.id === group.id
                        ? { ...g, is_member: true, members_count: g.members_count + 1 }
                        : g
                )
            });
        }
    } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to join group';
        toast.error(message);
        console.error('Join group failed:', err);
    } finally {
        setJoiningGroupId(null);
    }
};

const handleLeaveGroup = async (group: Group) => {
    if (leavingGroupId === group.id) return;

    setLeavingGroupId(group.id);

    try {
        await postAuth(`/api/groups/${group.id}/leave`);
        toast.success(`Successfully left ${group.name}`);

        // Optimistic UI update
        if (groups) {
            setGroups({
                ...groups,
                data: groups.data.map(g =>
                    g.id === group.id
                        ? { ...g, is_member: false, members_count: Math.max(0, g.members_count - 1) }
                        : g
                )
            });
        }
    } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to leave group';
        toast.error(message);
        console.error('Leave group failed:', err);
    } finally {
        setLeavingGroupId(null);
    }
};

    // ── Open modal for Prediction or Poll ──────────────────────────
    const openCreateModal = (type: 'prediction' | 'poll') => {
        setCreateType(type);
        setCreateModalOpen(true);
        if (type === 'prediction') {
            setPredText(''); setPredDesc(''); setPredLocationScope('global');
            setPredVisibility('public'); setPredCorrectAnswer('');
            setPredVotingEndDate(''); setPredSelectedFieldId(fields[0]?.id ?? null);
            setPredSelectedGroupIds([]);
        } else {
            setPollText(''); setPollOptions(['', '', '']); setPollCorrectAnswer('');
            setPollVotingEndDate(''); setPollVisibility('public');
            setPollSelectedFieldId(fields[0]?.id ?? null);
            setPollSelectedGroupIds([]);
        }
    };

    // ── Publish Prediction ─────────────────────────────────────────
    const handlePublishPrediction = async () => {
        if (!predText.trim()) return toast.error('Prediction text is required');
        if (predSelectedFieldId === null) return toast.error('Please select a category');
        if (!predVotingEndDate) return toast.error('Please set voting end date');
        if (!predCorrectAnswer.trim()) return toast.error('Correct answer is required');
        const payload = {
            field_id: predSelectedFieldId,
            questions: predText.trim(),
            description: predDesc.trim() || null,
            location_scope: predLocationScope,
            correct_answer: predCorrectAnswer.trim(),
            visibility: predVisibility,
            start_date: formatToMySQLDateTime(new Date().toISOString()),
            end_date: formatToMySQLDateTime(predVotingEndDate),
            options: ['Yes', 'No'],
            group_ids: predSelectedGroupIds,
        };
        try {
            setSubmitting(true);
            await postAuth('/api/predictions', payload);
            toast.success('Prediction created!');
            setCreateModalOpen(false);
            loadPredictions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create prediction');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Publish Poll ───────────────────────────────────────────────
    const handlePublishPoll = async () => {
        if (!pollText.trim()) return toast.error('Poll question is required');
        if (pollSelectedFieldId === null) return toast.error('Please select a category');
        if (!pollVotingEndDate) return toast.error('Please set voting end date');
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length < 2) return toast.error('At least 2 options required');
        const payload = {
            field_id: pollSelectedFieldId,
            questions: pollText.trim(),
            options: validOptions,
            correct_answer: pollCorrectAnswer || null,
            visibility: pollVisibility,
            end_date: formatToMySQLDateTime(pollVotingEndDate),
            group_ids: pollSelectedGroupIds,
            start_date: formatToMySQLDateTime(new Date().toISOString()),
        };
        try {
            setSubmitting(true);
            await postAuth('/api/polls', payload);
            toast.success('Poll created!');
            setCreateModalOpen(false);
            loadPolls();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create poll');
        } finally {
            setSubmitting(false);
        }
    };

    // Load single question details
    const loadQuestionDetails = async (question: QuestionItem) => {
        setSelectedQuestion(question);
        setQuestionLoading(true);
        setQuestionDetails(null);
        try {
            const res = await getAuth(`/api/admin/questions/${question.id}`);
            setQuestionDetails(res);
        } catch (err) {
            toast.error('Failed to load question details');
            console.error(err);
        } finally {
            setQuestionLoading(false);
        }
    };

    // Load group details when "View" is clicked
    const loadGroupDetails = async (group: Group) => {
        setSelectedGroup(group);
        setDetailsLoading(true);
        setGroupDetails(null);
        try {
            const res = await getAuth(`/api/admin/groups/${group.id}`);
            setGroupDetails(res);
        } catch (err) {
            toast.error('Failed to load group details');
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleToggleUserBlock = async (userId: number) => {
        try {
            const res = await postAuth(`/api/admin/users/${userId}/block`);
            toast.success(res.message);
            if (users) {
                const updated = users.data.map(u =>
                    u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u
                );
                setUsers({ ...users, data: updated });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleToggleGroupBlock = async (groupId: number) => {
        try {
            const res = await postAuth(`/api/admin/groups/${groupId}/block`);
            toast.success(res.message);
            if (groups) {
                const updated = groups.data.map(g =>
                    g.id === groupId ? { ...g, is_blocked: !g.is_blocked } : g
                );
                setGroups({ ...groups, data: updated });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    // Create Group
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Group name is required');
            return;
        }
        setCreating(true);
        try {
            await postAuth('/api/groups', {
                name: newGroupName.trim(),
                description: newGroupDescription.trim(),
                is_private: isPrivate,
            });
            toast.success('Group created successfully');
            setCreateDialogOpen(false);
            setNewGroupName('');
            setNewGroupDescription('');
            setIsPrivate(false);
            loadGroups();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <Card className="glass-card border-white/10 overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 opacity-10`}>
                <Icon size={80} />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                        {loading && activeLoader === 'stats' ? <Loader2 className="h-6 w-6 animate-spin" /> : (value ?? 0)}
                    </div>
                    <div className={`p-2 rounded-xl border border-white/10 ${color}`}>
                        <Icon size={20} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const PaginationControls = ({ data }: { data: PaginatedData<any> | null }) => {
        if (!data || data.last_page <= 1) return null;
        return (
            <div className="mt-6 flex justify-center items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={data.current_page === 1 || loading}
                    onClick={() => {
                        if (activeTab === 'users') loadUsers(data.current_page - 1);
                        if (activeTab === 'groups') loadGroups(data.current_page - 1);
                        if (activeTab === 'predictions') loadPredictions(data.current_page - 1);
                        if (activeTab === 'polls') loadPolls(data.current_page - 1);
                    }}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {data.current_page} of {data.last_page}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={data.current_page === data.last_page || loading}
                    onClick={() => {
                        if (activeTab === 'users') loadUsers(data.current_page + 1);
                        if (activeTab === 'groups') loadGroups(data.current_page + 1);
                        if (activeTab === 'predictions') loadPredictions(data.current_page + 1);
                        if (activeTab === 'polls') loadPolls(data.current_page + 1);
                    }}
                >
                    Next
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-6">
            <TopNav />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage users, groups, content & system health.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} className="mr-2" />
                            Logout
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                System Live
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Users" value={stats?.users} icon={Users} color="bg-blue-500/10 text-blue-500" />
                    <StatCard title="Predictions" value={stats?.predictions} icon={TrendingUp} color="bg-purple-500/10 text-purple-500" />
                    <StatCard title="Active Polls" value={stats?.polls} icon={PieChart} color="bg-pink-500/10 text-pink-500" />
                    <StatCard title="Groups" value={stats?.groups} icon={Grid} color="bg-orange-500/10 text-orange-500" />
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(val) => {
                        setActiveTab(val);
                        if (val === 'users' && !users) loadUsers();
                        if (val === 'groups') loadGroups();
                        if (val === 'predictions' && !predictions) loadPredictions();
                        if (val === 'polls' && !polls) loadPolls();
                        if (val === 'leaderboard' && !leaderboard) loadLeaderboard();
                    }}
                    className="w-full space-y-6"
                >
                    <TabsList className="glass-card border border-white/10 p-1 h-14 rounded-2xl md:w-fit flex flex-wrap gap-2">
                        <TabsTrigger value="overview" className="h-full rounded-xl px-6">Overview</TabsTrigger>
                        <TabsTrigger value="users" className="h-full rounded-xl px-6">Users</TabsTrigger>
                        <TabsTrigger value="groups" className="h-full rounded-xl px-6">Groups</TabsTrigger>
                        <TabsTrigger value="predictions" className="h-full rounded-xl px-6">Predictions</TabsTrigger>
                        <TabsTrigger value="polls" className="h-full rounded-xl px-6">Polls</TabsTrigger>
                        <TabsTrigger value="leaderboard" className="h-full rounded-xl px-6">Leaderboard</TabsTrigger>
                        <TabsTrigger value="profile" className="h-full rounded-xl px-6 flex items-center gap-1.5">
                            <UserCircle size={16} />
                            Profile
                        </TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card className="glass-card border-white/10 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Quick Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium">System Performance</p>
                                                <p className="text-sm text-muted-foreground">All core services are operational.</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">Details</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* USERS */}
                    <TabsContent value="users">
                        <Card className="glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading && activeLoader === 'users' ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
                                                    <tr>
                                                        <th className="px-4 py-3">User</th>
                                                        <th className="px-4 py-3">Role</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {users?.data.map((user) => (
                                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                                                                        {user.avatar_url ? (
                                                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <Users size={18} className="text-muted-foreground" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{user.name}</p>
                                                                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {user.is_blocked ? (
                                                                    <span className="flex items-center gap-1.5 text-rose-500 text-sm">
                                                                        <Ban size={14} /> Blocked
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 text-emerald-500 text-sm">
                                                                        <CheckCircle size={14} /> Active
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className={user.is_blocked ? "text-emerald-500 hover:text-emerald-400" : "text-rose-500 hover:text-rose-400"}
                                                                    onClick={() => handleToggleUserBlock(user.id)}
                                                                    disabled={loading}
                                                                >
                                                                    {user.is_blocked ? 'Unblock' : 'Block'}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls data={users} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* GROUPS */}
                    <TabsContent value="groups">
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Group Management</CardTitle>
                                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <Plus size={16} className="mr-2" /> Create Group
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="glass-card sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Create New Group</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-5 mt-5">
                                            <div className="space-y-2">
                                                <Label>Group Name *</Label>
                                                <Input
                                                    placeholder="Enter group name"
                                                    value={newGroupName}
                                                    onChange={(e) => setNewGroupName(e.target.value)}
                                                    className="glass-card"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Describe your group..."
                                                    value={newGroupDescription}
                                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                                    className="glass-card min-h-[100px]"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="private-group"
                                                    checked={isPrivate}
                                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                                />
                                                <Label htmlFor="private-group" className="cursor-pointer font-normal">
                                                    Make this group private
                                                </Label>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={handleCreateGroup}
                                                disabled={creating || !newGroupName.trim()}
                                                style={{
                                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                                }}
                                            >
                                                {creating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create Group'
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {loading && activeLoader === 'groups' ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : !groups ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Groups data not loaded yet.
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
                                                    <tr>
                                                        <th className="px-4 py-3">Group Name</th>
                                                        <th className="px-4 py-3">Creator</th>
                                                        <th className="px-4 py-3">Members</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {groups.data?.length > 0 ? (
                                                        groups.data.map((group) => (
                                                            <tr key={group.id} className="hover:bg-white/5 transition-colors">
                                                                <td className="px-4 py-4 font-medium">
                                                                    {group.name || '(no name)'}
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    {group.user ? `@${group.user.username}` : '— (deleted/unknown)'}
                                                                </td>
                                                                <td className="px-4 py-4">{group.members_count}</td>
                                                                <td className="px-4 py-4">
                                                                    {group.is_blocked ? (
                                                                        <span className="flex items-center gap-1.5 text-rose-500 text-sm">
                                                                            <Ban size={14} /> Blocked
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1.5 text-emerald-500 text-sm">
                                                                            <CheckCircle size={14} /> Active
                                                                        </span>
                                                                    )}
                                                                </td>
                                                               <td className="px-4 py-4 text-right space-x-3">
    <Button
        variant="ghost"
        size="sm"
        onClick={() => loadGroupDetails(group)}
    >
        View
    </Button>

    {group.is_member ? (
        <Button
            variant="destructive"
            size="sm"
            disabled={leavingGroupId === group.id || loading}
            onClick={() => handleLeaveGroup(group)}
        >
            {leavingGroupId === group.id ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Leaving...
                </>
            ) : (
                'Leave'
            )}
        </Button>
    ) : (
        <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={joiningGroupId === group.id || loading || group.is_private}
            onClick={() => handleJoinGroup(group)}
        >
            {joiningGroupId === group.id ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                </>
            ) : group.is_private ? (
                'Private'
            ) : (
                'Join'
            )}
        </Button>
    )}

    <Button
        variant="ghost"
        size="sm"
        className={group.is_blocked ? "text-emerald-500 hover:text-emerald-400" : "text-rose-500 hover:text-rose-400"}
        onClick={() => handleToggleGroupBlock(group.id)}
        disabled={loading}
    >
        {group.is_blocked ? 'Unblock' : 'Block'}
    </Button>
</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                                                No groups found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls data={groups} />
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* ─── GROUP DETAILS MODAL ──────────────────────────────────────── */}
                        <Dialog
                            open={!!selectedGroup}
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedGroup(null);
                                    setGroupDetails(null);
                                }
                            }}
                        >
                            <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">
                                        {selectedGroup?.name || 'Group Details'}
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedGroup?.description || 'No description'}
                                    </p>

                                    {/* Join / Leave in modal */}
                                    <div className="mt-4">
                                        {joinedGroupIds.includes(selectedGroup?.id ?? 0) ? (
                                            <Button
                                                variant="destructive"
                                                className="w-full md:w-auto"
                                                disabled={joiningGroupId === selectedGroup?.id}
                                                onClick={() => handleLeaveGroup(selectedGroup!.id)}
                                            >
                                                {joiningGroupId === selectedGroup?.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Leaving...
                                                    </>
                                                ) : (
                                                    'Leave Group'
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                disabled={joiningGroupId === selectedGroup?.id}
                                                onClick={() => handleJoinGroup(selectedGroup!.id)}
                                            >
                                                {joiningGroupId === selectedGroup?.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Joining...
                                                    </>
                                                ) : (
                                                    'Join Group'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </DialogHeader>

                                {detailsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    </div>
                                ) : groupDetails ? (
                                    <div className="space-y-8 mt-6">
                                        {/* Members Section */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <Users size={20} />
                                                Joined Members ({groupDetails.members_count || 0})
                                            </h3>
                                            {groupDetails.members?.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {groupDetails.members.map((member: any) => (
                                                        <div
                                                            key={member.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                                                        >
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={member.avatar_url} alt={member.name} />
                                                                <AvatarFallback>
                                                                    {member.name?.charAt(0) || '?'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{member.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    @{member.username}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No members yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Questions Section */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <MessageSquare size={20} />
                                                Shared Questions ({groupDetails.questions?.length || 0})
                                            </h3>
                                            {groupDetails.questions?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {groupDetails.questions.map((q: any) => (
                                                        <div
                                                            key={q.id}
                                                            className="p-4 rounded-lg bg-white/5 border border-white/10"
                                                        >
                                                            <p className="font-medium mb-1">
                                                                {q.questions.substring(0, 120)}
                                                                {q.questions.length > 120 ? '...' : ''}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                <span className="capitalize">{q.module_type}</span>
                                                                <span>•</span>
                                                                <span>by @{q.user?.username || 'unknown'}</span>
                                                                <span>•</span>
                                                                <span>
                                                                    {new Date(q.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No questions shared in this group yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Failed to load details
                                    </div>
                                )}

                                <div className="flex justify-end mt-6">
                                    <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                                        Close
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* PREDICTIONS */}
                    <TabsContent value="predictions">
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Predictions Management</CardTitle>
                                <Button
                                    onClick={() => openCreateModal('prediction')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Plus size={16} className="mr-2" /> Add Prediction
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {loading && activeLoader === 'predictions' ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
                                                    <tr>
                                                        <th className="px-4 py-3">Question</th>
                                                        <th className="px-4 py-3">Created By</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {predictions?.data.map((q) => (
                                                        <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-4">
                                                                {q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {q.user ? `@${q.user.username}` : '—'}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => loadQuestionDetails(q)}
                                                                >
                                                                    View
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls data={predictions} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* POLLS */}
                    <TabsContent value="polls">
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Polls Management</CardTitle>
                                <Button
                                    onClick={() => openCreateModal('poll')}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    <Plus size={16} className="mr-2" /> Add Poll
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {loading && activeLoader === 'polls' ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
                                                    <tr>
                                                        <th className="px-4 py-3">Poll Question</th>
                                                        <th className="px-4 py-3">Created By</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {polls?.data.map((q) => (
                                                        <tr key={q.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-4 py-4">
                                                                {q.questions.substring(0, 80)}{q.questions.length > 80 ? '...' : ''}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                {q.user ? `@${q.user.username}` : '—'}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => loadQuestionDetails(q)}
                                                                >
                                                                    View
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls data={polls} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* LEADERBOARD */}
                    <TabsContent value="leaderboard">
                        <Card className="glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading && activeLoader === 'leaderboard' ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
                                                <tr>
                                                    <th className="px-4 py-3 w-12">#</th>
                                                    <th className="px-4 py-3">User</th>
                                                    <th className="px-4 py-3 text-right">Score</th>
                                                    <th className="px-4 py-3 text-right">Accuracy</th>
                                                    <th className="px-4 py-3 text-right">Correct / Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {leaderboard?.data.map((entry, index) => {
                                                    const acc = Number(entry.accuracy) || 0;
                                                    const score = Number(entry.score) || 0;
                                                    const correct = Number(entry.correct_predictions) || 0;
                                                    const total = Number(entry.total_predictions) || 0;
                                                    return (
                                                        <tr key={entry.user?.id || index} className="hover:bg-white/5">
                                                            <td className="px-4 py-4 font-bold">
                                                                {(leaderboard.current_page - 1) * 20 + index + 1}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {entry.user?.avatar_url && (
                                                                        <img
                                                                            src={entry.user.avatar_url}
                                                                            alt=""
                                                                            className="w-8 h-8 rounded-full object-cover"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {entry.user?.name || '—'}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            @{entry.user?.username || 'unknown'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 text-right font-bold">{score}</td>
                                                            <td className="px-4 py-4 text-right">{acc.toFixed(1)}%</td>
                                                            <td className="px-4 py-4 text-right">
                                                                {correct} / {total}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PROFILE */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>Admin Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {profileLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : adminProfile ? (
                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <Avatar className="h-24 w-24 border-4 border-primary/30">
                                                <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.name} />
                                                <AvatarFallback className="text-3xl bg-primary/20">
                                                    {adminProfile.name?.[0]?.toUpperCase() || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2">
                                                <h2 className="text-2xl font-bold">{adminProfile.name}</h2>
                                                <p className="text-muted-foreground">@{adminProfile.username}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                                                        {adminProfile.role.toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle size={14} /> Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-muted-foreground">Email</Label>
                                                    <p className="font-medium">{adminProfile.email}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-muted-foreground">User ID</Label>
                                                    <p className="font-medium">#{adminProfile.id}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-muted-foreground">Joined</Label>
                                                    <p className="font-medium">
                                                        {adminProfile.created_at
                                                            ? new Date(adminProfile.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric', month: 'long', day: 'numeric'
                                                            })
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-white/10">
                                            {/* <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                                                Edit Profile (coming soon)
                                            </Button> */}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Failed to load profile information
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* CREATE PREDICTION / POLL MODAL */}
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                {createType === 'prediction' ? 'Create New Prediction' : 'Create New Poll'}
                            </DialogTitle>
                        </DialogHeader>
                        {createType === 'prediction' ? (
                            <div className="space-y-6 mt-6">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={predSelectedFieldId?.toString() ?? ''}
                                        onValueChange={v => setPredSelectedFieldId(Number(v))}
                                    >
                                        <SelectTrigger className="glass-card">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fields.map(f => (
                                                <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Your Prediction</Label>
                                    <Textarea
                                        placeholder="What do you predict will happen?"
                                        value={predText}
                                        onChange={e => setPredText(e.target.value)}
                                        className="glass-card min-h-32"
                                        maxLength={500}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description (optional)</Label>
                                    <Textarea
                                        placeholder="Add context or evidence..."
                                        value={predDesc}
                                        onChange={e => setPredDesc(e.target.value)}
                                        className="glass-card min-h-24"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Location Scope</Label>
                                        <Select value={predLocationScope} onValueChange={v => setPredLocationScope(v as any)}>
                                            <SelectTrigger className="glass-card">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="global">Global</SelectItem>
                                                <SelectItem value="country">Country</SelectItem>
                                                <SelectItem value="city">City</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Visibility</Label>
                                        <RadioGroup value={predVisibility} onValueChange={v => setPredVisibility(v as any)} className="flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="public" id="pred-public" />
                                                <Label htmlFor="pred-public">Public</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="pred-private" />
                                                <Label htmlFor="pred-private">Private</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                {predVisibility === 'private' && myGroups.length > 0 && (
                                    <div className="space-y-3">
                                        <Label>Share with Groups (Optional)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {myGroups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => setPredSelectedGroupIds(prev =>
                                                        prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                                                    )}
                                                    className={`px-4 py-2 rounded-full border text-sm ${predSelectedGroupIds.includes(g.id)
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                        }`}
                                                >
                                                    {g.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Due Date (Voting Ends)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={predVotingEndDate}
                                        onChange={e => setPredVotingEndDate(e.target.value)}
                                        className="glass-card"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Correct Answer (Expected Outcome)</Label>
                                    <Select value={predCorrectAnswer} onValueChange={setPredCorrectAnswer}>
                                        <SelectTrigger className="glass-card">
                                            <SelectValue placeholder="Choose expected result" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-4 mt-8">
                                    <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePublishPrediction}
                                        disabled={submitting}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                                    >
                                        {submitting ? 'Publishing...' : 'Publish Prediction'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 mt-6">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={pollSelectedFieldId?.toString() ?? ''}
                                        onValueChange={v => setPollSelectedFieldId(Number(v))}
                                    >
                                        <SelectTrigger className="glass-card">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fields.map(f => (
                                                <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Poll Question</Label>
                                    <Textarea
                                        placeholder="What would you like to ask?"
                                        value={pollText}
                                        onChange={e => setPollText(e.target.value)}
                                        className="glass-card min-h-32"
                                        maxLength={500}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Options (2–6)</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
                                            }}
                                            disabled={pollOptions.length >= 6}
                                        >
                                            <Plus size={14} className="mr-1.5" /> Add Option
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {pollOptions.map((opt, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <Input
                                                    value={opt}
                                                    onChange={e => {
                                                        const updated = [...pollOptions];
                                                        updated[i] = e.target.value;
                                                        setPollOptions(updated);
                                                    }}
                                                    placeholder={`Option ${i + 1}`}
                                                    className="glass-card"
                                                />
                                                {pollOptions.length > 2 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                                                    >
                                                        <X size={18} className="text-red-400" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Correct Answer (Optional for Rewards)</Label>
                                    <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
                                        <SelectTrigger className="glass-card">
                                            <SelectValue placeholder="Select correct option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pollOptions.filter(o => o.trim()).map((opt, i) => (
                                                <SelectItem key={i} value={opt.trim()}>
                                                    {opt.trim()}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="none">None / No correct answer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Due Date (Voting Ends)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={pollVotingEndDate}
                                            onChange={e => setPollVotingEndDate(e.target.value)}
                                            className="glass-card"
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Visibility</Label>
                                        <RadioGroup value={pollVisibility} onValueChange={v => setPollVisibility(v as any)} className="flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="public" id="poll-public" />
                                                <Label htmlFor="poll-public">Public</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="poll-private" />
                                                <Label htmlFor="poll-private">Private</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                {pollVisibility === 'private' && myGroups.length > 0 && (
                                    <div className="space-y-3">
                                        <Label>Share with Groups (Optional)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {myGroups.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => setPollSelectedGroupIds(prev =>
                                                        prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                                                    )}
                                                    className={`px-4 py-2 rounded-full border text-sm ${pollSelectedGroupIds.includes(g.id)
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                                        }`}
                                                >
                                                    {g.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-4 mt-8">
                                    <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePublishPoll}
                                        disabled={submitting}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                                    >
                                        {submitting ? 'Publishing...' : 'Publish Poll'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* QUESTION DETAILS MODAL */}
                <Dialog
                    open={!!selectedQuestion}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedQuestion(null);
                            setQuestionDetails(null);
                        }
                    }}
                >
                    <DialogContent className="glass-card max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                                {selectedQuestion?.module_type === 'prediction' ? 'Prediction' : 'Poll'} Details
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {selectedQuestion?.questions.substring(0, 120)}{selectedQuestion?.questions.length > 120 ? '...' : ''}
                            </p>
                        </DialogHeader>
                        {questionLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : questionDetails ? (
                            <div className="space-y-8 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Category:</strong> {questionDetails.field?.fields || '—'}</p>
                                            <p><strong>Posted by:</strong> @{questionDetails.user?.username || 'unknown'}</p>
                                            <p><strong>Visibility:</strong> <span className="capitalize">{questionDetails.visibility || '—'}</span></p>
                                            <p><strong>Location Scope:</strong> <span className="capitalize">{questionDetails.location_scope || '—'}</span></p>
                                            <p><strong>Created:</strong> {questionDetails.created_at ? new Date(questionDetails.created_at).toLocaleString() : '—'}</p>
                                            <p><strong>Voting Ends:</strong> {questionDetails.end_date ? new Date(questionDetails.end_date).toLocaleString() : '—'}</p>
                                            {questionDetails.answers_count !== undefined && (
                                                <p><strong>Total Answers/Votes:</strong> {questionDetails.answers_count}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Correct / Expected Answer</h3>
                                        <p className="text-lg font-medium">
                                            {questionDetails.correct_answer || 'Not set / Open opinion'}
                                        </p>
                                    </div>
                                </div>
                                {questionDetails.module_type === 'poll' && questionDetails.options?.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <MessageSquare size={20} />
                                            Poll Options
                                        </h3>
                                        <div className="space-y-2">
                                            {questionDetails.options.map((opt: string, i: number) => (
                                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {questionDetails.description && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{questionDetails.description}</p>
                                    </div>
                                )}
                                {questionDetails.answers?.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle size={20} />
                                            Recent Answers ({questionDetails.answers_count || questionDetails.answers.length})
                                        </h3>
                                        <div className="space-y-3 max-h-60 overflow-y-auto">
                                            {questionDetails.answers.map((ans: any) => (
                                                <div key={ans.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={ans.user?.avatar_url} />
                                                            <AvatarFallback>{ans.user?.name?.[0] || '?'}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">@{ans.user?.username || 'anonymous'}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(ans.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">Answered: <strong>{ans.answer}</strong></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                Failed to load question details
                            </div>
                        )}
                        <div className="flex justify-end mt-8">
                            <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <MobileNav />
        </div>
    );
}