// import { useState, useEffect } from 'react';
// import {
//     Users, MessageSquare, Layers, Shield, Ban, CheckCircle,
//     TrendingUp, PieChart, Trophy, Plus, Loader2, Lock, Globe, X,
//     LogOut, UserCircle, Bell, Search, Menu, Home, Activity,
//     ChevronRight, AlertCircle
// } from 'lucide-react';

// import { Button } from '@/app/components/ui/button';
// import {
//     Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
// } from '@/app/components/ui/dialog';
// import { Input } from '@/app/components/ui/input';
// import { Label } from '@/app/components/ui/label';
// import { Textarea } from '@/app/components/ui/textarea';
// import {
//     Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from '@/app/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';

// import { getAuth, postAuth, deleteAuth, postFormDataAuth } from '@/util/api';
// import { toast } from 'sonner';
// import { useNavigate } from 'react-router';
// import { useAppDispatch } from '../store/hooks';
// import { logoutUser } from '@/app/modules/auth/authSlice';

// // ── Interfaces ───────────────────────────────────────────────────────────────
// interface Stats { users: number; predictions: number; polls: number; groups: number; }
// interface User {
//     id: number; name: string; email: string; username: string;
//     role: string; is_blocked: boolean; avatar_url?: string; created_at?: string;
// }
// interface Group {
//     id: number; name: string; description?: string; is_private: boolean;
//     user: { id: number; name: string; username: string } | null;
//     members_count: number; is_blocked: boolean; is_member?: boolean;
// }
// interface QuestionItem {
//     id: number; questions: string; module_type: 'prediction' | 'poll';
//     user?: { name: string; username: string };
//     field?: { id: number; fields: string };
//     status?: string; location_scope?: string; end_date?: string; voting_end_date?: string; created_at?: string;
//     is_archived?: boolean;
// }
// interface LeaderboardEntry {
//     user: { id: number; name: string; username: string; avatar_url?: string };
//     score: number; accuracy: number; correct_predictions: number; total_predictions: number;
// }
// interface PaginatedData<T> { data: T[]; current_page: number; last_page: number; total: number; }

// // ── Component ────────────────────────────────────────────────────────────────
// export function AdminDashboardScreen() {
//     const [activeTab, setActiveTab] = useState('overview');
//     const [sidebarOpen, setSidebarOpen] = useState(false);

//     // Data
//     const [stats, setStats] = useState<Stats | null>(null);
//     const [users, setUsers] = useState<PaginatedData<User> | null>(null);
//     const [groups, setGroups] = useState<PaginatedData<Group> | null>(null);
//     const [predictions, setPredictions] = useState<PaginatedData<QuestionItem> | null>(null);
//     const [polls, setPolls] = useState<PaginatedData<QuestionItem> | null>(null);
//     const [leaderboard, setLeaderboard] = useState<PaginatedData<LeaderboardEntry> | null>(null);

//     // Create community modal
//     const [createDialogOpen, setCreateDialogOpen] = useState(false);
//     const [newGroupName, setNewGroupName] = useState('');
//     const [newGroupDescription, setNewGroupDescription] = useState('');
//     const [isPrivate, setIsPrivate] = useState(false);
//     const [creating, setCreating] = useState(false);

//     // Community details modal
//     const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//     const [groupDetails, setGroupDetails] = useState<any>(null);
//     const [detailsLoading, setDetailsLoading] = useState(false);

//     // Question details modal
//     const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
//     const [questionDetails, setQuestionDetails] = useState<any>(null);
//     const [questionLoading, setQuestionLoading] = useState(false);

//     // Privacy policy
//     const [privacyText, setPrivacyText] = useState('');
//     const [privacyLoading, setPrivacyLoading] = useState(false);

//     // Contact messages
//     const [contactMessages, setContactMessages] = useState<any>(null);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [selectedMessageDetails, setSelectedMessageDetails] = useState<any>(null);
//     const [messageDetailsLoading, setMessageDetailsLoading] = useState(false);

//     // Create prediction/poll modal
//     const [createModalOpen, setCreateModalOpen] = useState(false);
//     const [createType, setCreateType] = useState<'prediction' | 'poll' | null>(null);

//     // Prediction form
//     const [predText, setPredText] = useState('');
//     const [predDesc, setPredDesc] = useState('');
//     const [predLocationScope, setPredLocationScope] = useState<'global' | 'country' | 'city'>('global');
//     const [predVisibility, setPredVisibility] = useState<'public' | 'private'>('public');
//     const [predCorrectAnswer, setPredCorrectAnswer] = useState('');
//     const [predVotingEndDate, setPredVotingEndDate] = useState('');
//     const [predSelectedFieldId, setPredSelectedFieldId] = useState<number | null>(null);
//     const [predSelectedGroupIds, setPredSelectedGroupIds] = useState<number[]>([]);

//     // Poll form
//     const [pollText, setPollText] = useState('');
//     const [pollOptions, setPollOptions] = useState<string[]>(['', '', '']);
//     const [pollCorrectAnswer, setPollCorrectAnswer] = useState('');
//     const [pollVotingEndDate, setPollVotingEndDate] = useState('');
//     const [pollVisibility, setPollVisibility] = useState<'public' | 'private'>('public');
//     const [pollSelectedFieldId, setPollSelectedFieldId] = useState<number | null>(null);
//     const [pollSelectedGroupIds, setPollSelectedGroupIds] = useState<number[]>([]);

//     // Profile
//     const [adminProfile, setAdminProfile] = useState<User | null>(null);
//     const [profileLoading, setProfileLoading] = useState(false);

//     // Refs
//     const [fields, setFields] = useState<{ id: number; fields: string }[]>([]);
//     const [myGroups, setMyGroups] = useState<Group[]>([]);
//     const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
//     const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);
//     const [joinedGroupIds, setJoinedGroupIds] = useState<number[]>([]);

//     // Loading
//     const [loadingRefs, setLoadingRefs] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [activeLoader, setActiveLoader] = useState<string | null>(null);

//     // User tab filters
//     const [userSearch, setUserSearch] = useState('');
//     const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

//     // Community tab filters
//     const [groupSearch, setGroupSearch] = useState('');
//     const [groupPrivacyFilter, setGroupPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
//     const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
//     const [groupSortBy, setGroupSortBy] = useState<'latest' | 'members' | 'alphabetical'>('latest');

//     // Prediction tab filters
//     const [predictionSearch, setPredictionSearch] = useState('');
//     const [predictionUserSearch, setPredictionUserSearch] = useState('');
//     const [predictionCategoryFilter, setPredictionCategoryFilter] = useState<string>('all');
//     const [predictionEndDateFilter, setPredictionEndDateFilter] = useState<string>('');
//     const [predictionStatusFilter, setPredictionStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
//     const [predictionScopeFilter, setPredictionScopeFilter] = useState<'all' | 'global' | 'country' | 'city'>('all');
//     const [predictionSortBy, setPredictionSortBy] = useState<'latest' | 'alphabetical' | 'ending-soon'>('latest');

//     // Create prediction extended fields (mirroring user-side)
//     const [predDestinedDate, setPredDestinedDate] = useState('');
//     const [predVotingEndDateNew, setPredVotingEndDateNew] = useState('');

//     // Profile editing
//     const [editingProfile, setEditingProfile] = useState(false);
//     const [editName, setEditName] = useState('');
//     const [editUsername, setEditUsername] = useState('');
//     const [editCountry, setEditCountry] = useState('');
//     const [editCity, setEditCity] = useState('');
//     const [editAvatar, setEditAvatar] = useState<File | null>(null);
//     const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
//     const [profileSaving, setProfileSaving] = useState(false);

//     // Change password
//     const [showPasswordForm, setShowPasswordForm] = useState(false);
//     const [currentPassword, setCurrentPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [passwordSaving, setPasswordSaving] = useState(false);

//     // Change email
//     const [showEmailForm, setShowEmailForm] = useState(false);
//     const [newEmail, setNewEmail] = useState('');
//     const [emailPassword, setEmailPassword] = useState('');
//     const [emailSaving, setEmailSaving] = useState(false);

//     // Add these states near other notification states
// const [allNotifications, setAllNotifications] = useState<any[]>([]);
// const [notificationFilter, setNotificationFilter] = useState<'all' | 'contact' | 'join_request'>('all');

// // Most Active Users
// const [mostActiveData, setMostActiveData] = useState<any>(null);
// const [mostActiveLoading, setMostActiveLoading] = useState(false);

//     // Confirm dialog
//     const [confirmAction, setConfirmAction] = useState<{
//         type: 'user' | 'community'; id: number; name: string; currentBlocked: boolean;
//     } | null>(null);
//     const [confirmLoading, setConfirmLoading] = useState(false);

//     const dispatch = useAppDispatch();
//     const navigate = useNavigate();

//     // ── Helpers ──────────────────────────────────────────────────────────────
//     const formatToMySQLDateTime = (dateStr: string): string | null => {
//         if (!dateStr) return null;
//         try {
//             const date = new Date(dateStr);
//             if (isNaN(date.getTime())) return null;
//             const pad = (n: number) => String(n).padStart(2, '0');
//             return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
//                 `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
//         } catch { return null; }
//     };

//     const startLoading = (key: string) => { setLoading(true); setActiveLoader(key); };
//     const stopLoading = () => { setLoading(false); setActiveLoader(null); };

//     // ── Derived ──────────────────────────────────────────────────────────────
//     const filteredUsers = (users?.data ?? []).filter(u => {
//         const q = userSearch.trim().toLowerCase();
//         const matchSearch = !q ||
//             (u.name ?? '').toLowerCase().includes(q) ||
//             (u.username ?? '').toLowerCase().includes(q) ||
//             (u.email ?? '').toLowerCase().includes(q);
//         const matchStatus =
//             userStatusFilter === 'all' ||
//             (userStatusFilter === 'blocked' && u.is_blocked) ||
//             (userStatusFilter === 'active' && !u.is_blocked);
//         return matchSearch && matchStatus;
//     });

//     const filteredGroups = (groups?.data ?? []).filter(g => {
//         const q = groupSearch.trim().toLowerCase();
//         const matchSearch = !q ||
//             (g.name ?? '').toLowerCase().includes(q) ||
//             (g.description ?? '').toLowerCase().includes(q) ||
//             (g.user?.username ?? '').toLowerCase().includes(q);

//         const matchPrivacy =
//             groupPrivacyFilter === 'all' ||
//             (groupPrivacyFilter === 'private' && g.is_private) ||
//             (groupPrivacyFilter === 'public' && !g.is_private);

//         const matchStatus =
//             groupStatusFilter === 'all' ||
//             (groupStatusFilter === 'blocked' && g.is_blocked) ||
//             (groupStatusFilter === 'active' && !g.is_blocked);

//         return matchSearch && matchPrivacy && matchStatus;
//     }).sort((a, b) => {
//         if (groupSortBy === 'members') {
//             return (b.members_count || 0) - (a.members_count || 0);
//         }
//         if (groupSortBy === 'alphabetical') {
//             return (a.name || '').localeCompare(b.name || '');
//         }
//         return b.id - a.id;
//     });

//     const filteredPredictions = (predictions?.data ?? []).filter(p => {
//         const q = predictionSearch.trim().toLowerCase();
//         const uq = predictionUserSearch.trim().toLowerCase();
//         const matchSearch = !q || (p.questions ?? '').toLowerCase().includes(q);
//         const matchUser = !uq ||
//             (p.user?.username ?? '').toLowerCase().includes(uq) ||
//             (p.user?.name ?? '').toLowerCase().includes(uq);

//         const matchCategory =
//             predictionCategoryFilter === 'all' ||
//             String(p.field?.id ?? '') === predictionCategoryFilter;

//         const matchEndDate = !predictionEndDateFilter || (() => {
//             const filterDate = new Date(predictionEndDateFilter);
//             const endDate = p.voting_end_date ? new Date(p.voting_end_date) : (p.end_date ? new Date(p.end_date) : null);
//             if (!endDate) return false;
//             return endDate.toDateString() === filterDate.toDateString();
//         })();

//         const matchStatus =
//             predictionStatusFilter === 'all' ||
//             (predictionStatusFilter === 'active' && p.status === 'active') ||
//             (predictionStatusFilter === 'resolved' && p.status === 'closed');

//         const matchScope =
//             predictionScopeFilter === 'all' ||
//             (p.location_scope ?? '').toLowerCase() === predictionScopeFilter.toLowerCase();

//         return matchSearch && matchUser && matchCategory && matchEndDate && matchStatus && matchScope;
//     }).sort((a, b) => {
//         if (predictionSortBy === 'alphabetical') {
//             return (a.questions || '').localeCompare(b.questions || '');
//         }
//         if (predictionSortBy === 'ending-soon') {
//             const aTime = (a.voting_end_date || a.end_date) ? new Date(a.voting_end_date || a.end_date!).getTime() : Infinity;
//             const bTime = (b.voting_end_date || b.end_date) ? new Date(b.voting_end_date || b.end_date!).getTime() : Infinity;
//             return aTime - bTime;
//         }
//         return b.id - a.id;
//     });

//     // ── Effects ──────────────────────────────────────────────────────────────
//     useEffect(() => { loadStats(); loadContactMessages(); loadAdminProfile(); loadNotifications(); loadMostActiveUsers();}, []);

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
//                 setJoinedGroupIds(groupsRes?.data?.map((g: any) => g.id) || []);
//             } catch { toast.error('Failed to load form data'); }
//             finally { setLoadingRefs(false); }
//         };
//         loadRefs();
//     }, []);

//     // ── API Loaders ──────────────────────────────────────────────────────────
//     const loadAdminProfile = async () => {
//         setProfileLoading(true);
//         try {
//             const res = await getAuth('/api/user');
//             setAdminProfile(res);
//         } catch { /* silent */ }
//         finally { setProfileLoading(false); }
//     };

//     const loadStats = async () => {
//         startLoading('stats');
//         try { const res = await getAuth('/api/admin/stats'); setStats(res); }
//         catch { toast.error('Failed to load statistics'); }
//         finally { stopLoading(); }
//     };

//     const loadUsers = async (page = 1) => {
//         startLoading('users');
//         try { const res = await getAuth(`/api/admin/users?page=${page}`); setUsers(res); }
//         catch { toast.error('Failed to load users'); }
//         finally { stopLoading(); }
//     };

//     const loadGroups = async (page = 1) => {
//         startLoading('groups');
//         try { const res = await getAuth(`/api/admin/groups?page=${page}`); setGroups(res); }
//         catch { toast.error('Failed to load communities'); }
//         finally { stopLoading(); }
//     };

//     const loadPredictions = async (page = 1) => {
//         startLoading('predictions');
//         try { const res = await getAuth(`/api/admin/predictions?page=${page}`); setPredictions(res); }
//         catch { toast.error('Failed to load predictions'); }
//         finally { stopLoading(); }
//     };

//     const loadPolls = async (page = 1) => {
//         startLoading('polls');
//         try { const res = await getAuth(`/api/admin/polls?page=${page}`); setPolls(res); }
//         catch { toast.error('Failed to load polls'); }
//         finally { stopLoading(); }
//     };

//     const loadLeaderboard = async (page = 1) => {
//         startLoading('leaderboard');
//         try { const res = await getAuth(`/api/admin/leaderboard?page=${page}`); setLeaderboard(res); }
//         catch { toast.error('Failed to load leaderboard'); }
//         finally { stopLoading(); }
//     };

//     const loadPrivacyPolicy = async () => {
//         setPrivacyLoading(true);
//         try { const res = await getAuth('/api/settings/privacy_policy'); setPrivacyText(res.value || ''); }
//         catch { toast.error('Failed to load privacy policy'); }
//         finally { setPrivacyLoading(false); }
//     };

// const loadMostActiveUsers = async () => {
//     setMostActiveLoading(true);
//     try {
//         const res = await getAuth('/api/admin/mostActivated');
//         setMostActiveData(res);
//     } catch (err) {
//         toast.error('Failed to load most active users');
//         console.error(err);
//     } finally {
//         setMostActiveLoading(false);
//     }
// };

//     const loadContactMessages = async () => {
//         try {
//             const res = await getAuth('/api/admin/contact-messages');
//             setContactMessages(res);
//             setUnreadCount(res.data ? res.data.filter((m: any) => !m.is_read).length : 0);
//         } catch { /* silent */ }
//     };

//     const loadNotifications = async () => {
//     try {
//         const res = await getAuth('/api/notifications'); // or /api/admin/notifications if you prefer
//         setAllNotifications(res.notifications || []);
        
//         // Count unread join requests + contact messages
//         const unread = res.notifications?.filter((n: any) => !n.read_at).length || 0;
//         setUnreadCount(unread);
//     } catch (err) {
//         console.error(err);
//     }
// };



// // Add these helper functions
// // const filteredNotifications = () => {
// //     if (notificationFilter === 'all') return allNotifications;
// //     return allNotifications.filter((n: any) => {
// //         const isJoin = n.type === 'App\\Notifications\\JoinRequestNotification' || 
// //                       n.data?.type === 'join_request';
// //         return notificationFilter === 'join_request' ? isJoin : !isJoin;
// //     });
// // };

// const filteredNotifications = () => {
//     let items: any[] = [];

//     // Contact Messages
//     if (notificationFilter === 'all' || notificationFilter === 'contact') {
//         items = [...items, ...(contactMessages?.data || [])];
//     }

//     // Join Requests
//     if (notificationFilter === 'all' || notificationFilter === 'join_request') {
//         items = [...items, ...allNotifications];
//     }

//     return items;
// };

// const viewNotificationDetails = async (notif: any) => {
//     setMessageDetailsLoading(true);
//     try {
//         // Mark as read
//         if (!notif.read_at) {
//             await postAuth(`/api/notifications/${notif.id}/read`);
//         }
//         setSelectedMessageDetails(notif);
//         loadNotifications(); // Refresh unread count
//     } catch (err) {
//         toast.error('Failed to load notification details');
//     } finally {
//         setMessageDetailsLoading(false);
//     }
// };

// const handleJoinRequestAction = async (groupId: number, requesterId: number, action: 'accept' | 'reject') => {
//     try {
//         await postAuth(`/api/groups/${groupId}/requests/${requesterId}`, { action });
//         toast.success(`Request ${action}ed successfully!`);
//         setSelectedMessageDetails(null);
//         loadNotifications();
//         if (activeTab === 'groups') loadGroups();
//     } catch (err: any) {
//         toast.error(err.response?.data?.message || 'Action failed');
//     }
// };



//     // ── Tab Switch ────────────────────────────────────────────────────────────
//     const handleTabChange = (val: string) => {
//         setActiveTab(val);
//         if (val === 'users' && !users) loadUsers();
//         if (val === 'groups') loadGroups();
//         if (val === 'predictions' && !predictions) loadPredictions();
//         if (val === 'polls' && !polls) loadPolls();
//         if (val === 'leaderboard' && !leaderboard) loadLeaderboard();
//         if (val === 'privacy-policy') loadPrivacyPolicy();
//         if (val === 'notifications') loadContactMessages();
//     };

//     // ── Handlers ──────────────────────────────────────────────────────────────
//     const handleLogout = async () => {
//         try { await dispatch(logoutUser()).unwrap(); toast.success('Logged out successfully'); navigate('/auth', { replace: true }); }
//         catch { toast.error('Logout failed – redirecting'); navigate('/auth', { replace: true }); }
//     };

//     const handleJoinGroup = async (group: Group) => {
//         if (joiningGroupId === group.id || group.is_private) return;
//         setJoiningGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/join`);
//             toast.success(`Joined ${group.name}`);
//             if (groups) setGroups({ ...groups, data: groups.data.map(g => g.id === group.id ? { ...g, is_member: true, members_count: g.members_count + 1 } : g) });
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to join'); }
//         finally { setJoiningGroupId(null); }
//     };

//     const handleLeaveGroup = async (group: Group) => {
//         if (leavingGroupId === group.id) return;
//         setLeavingGroupId(group.id);
//         try {
//             await postAuth(`/api/groups/${group.id}/leave`);
//             toast.success(`Left ${group.name}`);
//             if (groups) setGroups({ ...groups, data: groups.data.map(g => g.id === group.id ? { ...g, is_member: false, members_count: Math.max(0, g.members_count - 1) } : g) });
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to leave'); }
//         finally { setLeavingGroupId(null); }
//     };

//     const handleToggleUserBlock = async (userId: number) => {
//         try {
//             const res = await postAuth(`/api/admin/users/${userId}/block`);
//             toast.success(res.message);
//             if (users) setUsers({ ...users, data: users.data.map(u => u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u) });
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Action failed'); }
//     };

//     const handleToggleGroupBlock = async (groupId: number) => {
//         try {
//             const res = await postAuth(`/api/admin/groups/${groupId}/block`);
//             toast.success(res.message);
//             if (groups) setGroups({ ...groups, data: groups.data.map(g => g.id === groupId ? { ...g, is_blocked: !g.is_blocked } : g) });
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Action failed'); }
//     };

//     const handleDeleteQuestion = async (questionId: number) => {
//         if (!window.confirm('Delete this question? Cannot be undone.')) return;
//         try {
//             await deleteAuth(`/api/admin/questions/${questionId}`);
//             toast.success('Deleted successfully.');
//             if (activeTab === 'predictions') loadPredictions();
//             if (activeTab === 'polls') loadPolls();
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Delete failed'); }
//     };

//     const loadGroupDetails = async (group: Group) => {
//         setSelectedGroup(group); setDetailsLoading(true); setGroupDetails(null);
//         try { const res = await getAuth(`/api/admin/groups/${group.id}`); setGroupDetails(res); }
//         catch { toast.error('Failed to load community details'); }
//         finally { setDetailsLoading(false); }
//     };

//     const loadQuestionDetails = async (question: QuestionItem) => {
//         setSelectedQuestion(question); setQuestionLoading(true); setQuestionDetails(null);
//         try { const res = await getAuth(`/api/admin/questions/${question.id}`); setQuestionDetails(res); }
//         catch { toast.error('Failed to load question details'); }
//         finally { setQuestionLoading(false); }
//     };

//     const handleCreateGroup = async () => {
//         if (!newGroupName.trim()) { toast.error('Community name is required'); return; }
//         setCreating(true);
//         try {
//             await postAuth('/api/groups', { name: newGroupName.trim(), description: newGroupDescription.trim(), is_private: isPrivate });
//             toast.success('Community created');
//             setCreateDialogOpen(false); setNewGroupName(''); setNewGroupDescription(''); setIsPrivate(false);
//             loadGroups();
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create'); }
//         finally { setCreating(false); }
//     };

//     const openCreateModal = (type: 'prediction' | 'poll') => {
//         setCreateType(type); setCreateModalOpen(true);
//         if (type === 'prediction') {
//             setPredText(''); setPredDesc(''); setPredLocationScope('global'); setPredVisibility('public');
//             setPredCorrectAnswer(''); setPredVotingEndDate(''); setPredSelectedFieldId(fields[0]?.id ?? null); setPredSelectedGroupIds([]);
//             // Set default voting end date to 7 days from now
//             const defaultVotingDate = new Date();
//             defaultVotingDate.setDate(defaultVotingDate.getDate() + 7);
//             defaultVotingDate.setHours(23, 59);
//             setPredVotingEndDateNew(defaultVotingDate.toISOString().slice(0, 16));
//             setPredDestinedDate('');
//         } else {
//             setPollText(''); setPollOptions(['', '', '']); setPollCorrectAnswer(''); setPollVotingEndDate('');
//             setPollVisibility('public'); setPollSelectedFieldId(fields[0]?.id ?? null); setPollSelectedGroupIds([]);
//         }
//     };

//     const handlePublishPrediction = async () => {
//         if (!predText.trim()) return toast.error('Prediction text required');
//         if (!predSelectedFieldId) return toast.error('Select a category');
//         if (!predDestinedDate) return toast.error('Set destined (prediction end) date');
//         const predDate = new Date(predDestinedDate);
//         if (predDate <= new Date()) return toast.error('Destined date must be in the future');
//         if (predVotingEndDateNew) {
//             const vDate = new Date(predVotingEndDateNew);
//             if (vDate <= new Date()) return toast.error('Validation end date must be in the future');
//         }
//         try {
//             setSubmitting(true);
//             await postAuth('/api/predictions', {
//                 field_id: predSelectedFieldId,
//                 questions: predText.trim(),
//                 description: predDesc.trim() || null,
//                 location_scope: predLocationScope,
//                 visibility: predVisibility,
//                 start_date: formatToMySQLDateTime(new Date().toISOString()),
//                 end_date: formatToMySQLDateTime(predDestinedDate),
//                 voting_end_date: predVotingEndDateNew ? formatToMySQLDateTime(predVotingEndDateNew) : null,
//                 options: ['Yes', 'No', 'Vague'],
//                 group_ids: predSelectedGroupIds,
//             });
//             toast.success('Prediction published!'); setCreateModalOpen(false); loadPredictions();
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
//         finally { setSubmitting(false); }
//     };

//     const handlePublishPoll = async () => {
//         if (!pollText.trim()) return toast.error('Poll question required');
//         if (!pollSelectedFieldId) return toast.error('Select a category');
//         if (!pollVotingEndDate) return toast.error('Set voting end date');
//         const validOptions = pollOptions.filter(o => o.trim());
//         if (validOptions.length < 2) return toast.error('At least 2 options required');
//         try {
//             setSubmitting(true);
//             await postAuth('/api/polls', {
//                 field_id: pollSelectedFieldId, questions: pollText.trim(), options: validOptions,
//                 correct_answer: pollCorrectAnswer || null, visibility: pollVisibility,
//                 end_date: formatToMySQLDateTime(pollVotingEndDate), group_ids: pollSelectedGroupIds,
//                 start_date: formatToMySQLDateTime(new Date().toISOString()),
//             });
//             toast.success('Poll published!'); setCreateModalOpen(false); loadPolls();
//         } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
//         finally { setSubmitting(false); }
//     };

//     const viewMessageDetails = async (msgId: number) => {
//         setMessageDetailsLoading(true);
//         try { const res = await getAuth(`/api/admin/contact-messages/${msgId}`); setSelectedMessageDetails(res); loadContactMessages(); }
//         catch { toast.error('Failed to load message'); }
//         finally { setMessageDetailsLoading(false); }
//     };

//     const toggleMessageRead = async (msgId: number) => {
//         try {
//             await postAuth(`/api/admin/contact-messages/${msgId}/read`);
//             toast.success('Updated.');
//             if (selectedMessageDetails?.id === msgId) setSelectedMessageDetails((p: any) => p ? { ...p, is_read: !p.is_read } : null);
//             loadContactMessages();
//         } catch { toast.error('Action failed'); }
//     };

//     const deleteMessage = async (msgId: number) => {
//         if (!window.confirm('Delete message permanently?')) return;
//         try {
//             await deleteAuth(`/api/admin/contact-messages/${msgId}`);
//             toast.success('Deleted.'); setSelectedMessageDetails(null); loadContactMessages();
//         } catch { toast.error('Delete failed'); }
//     };


//     const handleArchiveQuestion = async (questionId: number, currentlyArchived: boolean) => {
//         if (!window.confirm(
//             currentlyArchived
//                 ? 'Unarchive this question? It will become visible again.'
//                 : 'Archive this question? It will be hidden from all users but not deleted.'
//         )) return;

//         try {
//             const action = currentlyArchived ? 'unarchive' : 'archive';
//             await postAuth(`/api/admin/questions/${questionId}/${action}`);

//             toast.success(currentlyArchived ? 'Question unarchived' : 'Question archived successfully');

//             // Refresh current tab
//             if (activeTab === 'predictions') loadPredictions();
//             if (activeTab === 'polls') loadPolls();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         }
//     };


//     // ── Sub-components ────────────────────────────────────────────────────────
//     const PaginationControls = ({ data, onPage }: { data: PaginatedData<any> | null; onPage: (p: number) => void }) => {
//         if (!data || data.last_page <= 1) return null;
//         return (
//             <div className="mt-5 flex justify-center items-center gap-3">
//                 <button
//                     disabled={data.current_page === 1 || loading}
//                     onClick={() => onPage(data.current_page - 1)}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >← Previous</button>
//                 <span className="text-xs text-slate-500">Page <strong>{data.current_page}</strong> of <strong>{data.last_page}</strong></span>
//                 <button
//                     disabled={data.current_page === data.last_page || loading}
//                     onClick={() => onPage(data.current_page + 1)}
//                     className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >Next →</button>
//             </div>
//         );
//     };



//     const openEditProfile = () => {
//         if (!adminProfile) return;
//         setEditName(adminProfile.name ?? '');
//         setEditUsername(adminProfile.username ?? '');
//         setEditCountry((adminProfile as any).country ?? '');
//         setEditCity((adminProfile as any).city ?? '');
//         setEditAvatarPreview(adminProfile.avatar_url ?? null);
//         setEditAvatar(null);
//         setEditingProfile(true);
//     };

//     const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         setEditAvatar(file);
//         const reader = new FileReader();
//         reader.onload = () => setEditAvatarPreview(reader.result as string);
//         reader.readAsDataURL(file);
//     };

//     const handleSaveProfile = async () => {
//         setProfileSaving(true);
//         try {
//             const formData = new FormData();
//             formData.append('name', editName);
//             formData.append('username', editUsername);
//             if (editCountry) formData.append('country', editCountry);
//             if (editCity) formData.append('city', editCity);
//             if (editAvatar) formData.append('avatar', editAvatar);

//             const data = await postFormDataAuth('/api/profile/update', formData);
//             toast.success('Profile updated successfully');
//             setAdminProfile(prev => prev ? { ...prev, ...data.user } : data.user);
//             setEditingProfile(false);
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
//         } finally {
//             setProfileSaving(false);
//         }
//     };

//     const handleChangePassword = async () => {
//         if (newPassword !== confirmPassword) {
//             toast.error('New passwords do not match');
//             return;
//         }
//         if (newPassword.length < 8) {
//             toast.error('Password must be at least 8 characters');
//             return;
//         }
//         setPasswordSaving(true);
//         try {
//             await postAuth('/api/user/change-password', {
//                 current_password: currentPassword,
//                 password: newPassword,
//                 password_confirmation: confirmPassword,
//             });
//             toast.success('Password changed successfully');
//             setShowPasswordForm(false);
//             setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
//         } catch (err: any) {
//             toast.error(err.response?.data?.message ?? 'Failed to change password');
//         } finally {
//             setPasswordSaving(false);
//         }
//     };

//     const handleChangeEmail = async () => {
//         if (!newEmail.trim() || !emailPassword.trim()) {
//             toast.error('All fields are required');
//             return;
//         }
//         setEmailSaving(true);
//         try {
//             await postAuth('/api/user/change-email', {
//                 email: newEmail.trim(),
//                 password: emailPassword,
//             });
//             toast.success('Email updated. Please verify your new email address.');
//             setShowEmailForm(false);
//             setNewEmail(''); setEmailPassword('');
//             loadAdminProfile();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message ?? 'Failed to change email');
//         } finally {
//             setEmailSaving(false);
//         }
//     };


















//     // ── Sidebar nav ────────────────────────────────────────────────────────────
//     const navItems = [
//         { id: 'overview', label: 'Overview', icon: Home },
//         { id: 'users', label: 'Users', icon: Users },
//         { id: 'groups', label: 'Communities', icon: Layers },
//         { id: 'predictions', label: 'Predictions', icon: TrendingUp },
//         // { id: 'polls',          label: 'Polls',            icon: PieChart },
//         { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
//         // { id: 'privacy-policy', label: 'Privacy Policy',   icon: Shield },
//         // { id: 'profile',        label: 'My Profile',       icon: UserCircle },
//     ];

//     const pageTitle: Record<string, string> = {
//         overview: 'Dashboard Overview', users: 'User Management', groups: 'Community Management',
//         predictions: 'Predictions', polls: 'Polls', leaderboard: 'Leaderboard',
//         'privacy-policy': 'Privacy Policy', profile: 'My Profile',
//         notifications: 'Contact Notifications',
//     };

//     const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
//         <th className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${right ? 'text-right' : ''}`}>{children}</th>
//     );

//     // ─────────────────────────────────────────────────────────────────────────
//     return (
//         <div className="flex h-screen bg-slate-100 overflow-hidden">

//             {/* ── Sidebar ─────────────────────────────────────────────── */}
//             {sidebarOpen && (
//                 <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
//             )}
//             <aside className={`
//                 fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col
//                 bg-[#0f172a] border-r border-white/[0.05]
//                 transition-transform duration-300 ease-in-out
//                 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//                 md:relative md:translate-x-0 md:flex-shrink-0
//             `}>
//                 {/* Logo */}
//                 <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
//                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
//                         <Activity size={15} className="text-white" />
//                     </div>
//                     <div className="flex-1">
//                         <p className="font-bold text-white text-sm leading-tight">iSaidSo</p>
//                         <p className="text-[9px] text-slate-500 uppercase tracking-widest">Admin Portal</p>
//                     </div>
//                     <button className="md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
//                         <X size={15} />
//                     </button>
//                 </div>

//                 {/* Nav links */}
//                 <nav className="flex-1 px-2.5 py-3 space-y-0.5">
//                     <p className="px-2.5 pb-1 pt-0.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
//                     {navItems.map(item => {
//                         const active = activeTab === item.id;
//                         return (
//                             <button
//                                 key={item.id}
//                                 onClick={() => { handleTabChange(item.id); setSidebarOpen(false); }}
//                                 className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left group ${active
//                                         ? 'bg-white/[0.08] text-white'
//                                         : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
//                                     }`}
//                             >
//                                 <item.icon size={15} className={active ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'} />
//                                 <span className="flex-1 truncate">{item.label}</span>
//                                 {active && <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-violet-500 to-pink-500 flex-shrink-0" />}
//                             </button>
//                         );
//                     })}
//                 </nav>
//             </aside>

//             {/* ── Main ────────────────────────────────────────────────── */}
//             <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

//                 {/* Header */}
//                 <header className="bg-white border-b border-slate-200 h-14 px-5 flex items-center justify-between gap-3 flex-shrink-0 shadow-sm">
//                     <div className="flex items-center gap-3">
//                         <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)}>
//                             <Menu size={20} />
//                         </button>
//                         <div>
//                             <h1 className="text-sm font-bold text-slate-900 leading-tight">{pageTitle[activeTab] ?? 'Dashboard'}</h1>
//                             <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
//                                 <span>Admin</span><ChevronRight size={10} /><span>{pageTitle[activeTab]}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 mr-1">
//                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                             <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">System Live</span>
//                         </div>

//                         {/* Notifications Icon Button */}
//                         <button
//                             onClick={() => handleTabChange('notifications')}
//                             className={`relative p-2 rounded-lg transition-all ${activeTab === 'notifications'
//                                     ? 'bg-violet-50 text-violet-600'
//                                     : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
//                                 }`}
//                             title="Notifications"
//                         >
//                             <Bell size={18} />
//                             {unreadCount > 0 && (
//                                 <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white border border-white">
//                                     {unreadCount}
//                                 </span>
//                             )}
//                         </button>

//                         {/* Sign Out Button */}
//                         <button
//                             onClick={handleLogout}
//                             className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all mr-1"
//                             title="Sign Out"
//                         >
//                             <LogOut size={18} />
//                         </button>

//                         {adminProfile && (
//                             <div
//                                 onClick={() => handleTabChange('profile')}
//                                 className={`flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-slate-50' : ''
//                                     }`}
//                             >
//                                 <Avatar className="h-7 w-7 border-2 border-violet-100">
//                                     <AvatarImage src={adminProfile.avatar_url} />
//                                     <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
//                                         {(adminProfile.name?.[0] ?? 'A').toUpperCase()}
//                                     </AvatarFallback>
//                                 </Avatar>
//                                 <div className="hidden sm:block text-left">
//                                     <p className="text-xs font-semibold text-slate-800 leading-none">{adminProfile.name}</p>
//                                     <p className="text-[10px] text-slate-400 capitalize mt-0.5">{adminProfile.role?.replace('_', ' ')}</p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </header>

//                 {/* Scrollable content */}
//                 <main className="flex-1 overflow-y-auto bg-slate-50/70 pb-10">
//                     <div className="p-5 max-w-7xl mx-auto space-y-5">

//                         {/* ─── OVERVIEW ──────────────────────────────────── */}
//                         {activeTab === 'overview' && (<>
//                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                                 {[
//                                     { label: 'Total Users', val: stats?.users, icon: Users, bg: 'bg-violet-500', light: 'bg-violet-50 text-violet-700' },
//                                     { label: 'Predictions', val: stats?.predictions, icon: TrendingUp, bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
//                                     { label: 'Active Polls', val: stats?.polls, icon: PieChart, bg: 'bg-pink-500', light: 'bg-pink-50 text-pink-700' },
//                                     { label: 'Communities', val: stats?.groups, icon: Layers, bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
//                                 ].map(card => (
//                                     <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//                                         <div className={`inline-flex p-2.5 rounded-xl ${card.light} mb-3`}>
//                                             <card.icon size={18} />
//                                         </div>
//                                         <p className="text-2xl font-bold text-slate-900">
//                                             {loading && activeLoader === 'stats'
//                                                 ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
//                                                 : (card.val ?? 0)}
//                                         </p>
//                                         <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//                                 <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
//                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                                     {[
//                                         { label: 'Manage Users', tab: 'users', icon: Users, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100' },
//                                         { label: 'Communities', tab: 'groups', icon: Layers, color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100' },
//                                         { label: 'Predictions', tab: 'predictions', icon: TrendingUp, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100' },
//                                         { label: 'Leaderboard', tab: 'leaderboard', icon: Trophy, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' },
//                                     ].map(qa => (
//                                         <button key={qa.tab} onClick={() => handleTabChange(qa.tab)}
//                                             className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-colors ${qa.color}`}>
//                                             <qa.icon size={16} />{qa.label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//                                 <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
//                                     <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0"><CheckCircle size={20} /></div>
//                                     <div className="flex-1">
//                                         <p className="font-semibold text-emerald-900">All Systems Operational</p>
//                                         <p className="text-sm text-emerald-700">All core services are running normally.</p>
//                                     </div>
//                                     <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
//                                 </div>
//                             </div>

// {/* Most Active Users */}
// {activeTab === 'overview' && (
//     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//         <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
//             <Trophy size={16} /> Most Active Users
//         </h2>

//         {mostActiveLoading ? (
//             <div className="flex justify-center py-8">
//                 <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
//             </div>
//         ) : mostActiveData ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Most Question Creator */}
//                 <div className="border border-slate-100 rounded-xl p-4">
//                     <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Questions Created</p>
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">
//                             Q
//                         </div>
//                         <div>
//                             <p className="font-semibold text-slate-900">
//                                 {mostActiveData.most_question_creator?.name || '—'}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                                 {mostActiveData.most_question_creator?.questions_count || 0} questions
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Most Active Answerer */}
//                 <div className="border border-slate-100 rounded-xl p-4">
//                     <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Answers Submitted</p>
//                     <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
//                             A
//                         </div>
//                         <div>
//                             <p className="font-semibold text-slate-900">
//                                 {mostActiveData.most_active_answerer?.name || '—'}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                                 {mostActiveData.most_active_answerer?.answers_count || 0} answers
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         ) : (
//             <p className="text-slate-400 text-center py-8">No data available</p>
//         )}
//     </div>
// )}

//                         </>)}

//                         {/* ─── USERS ─────────────────────────────────────── */}
//                         {activeTab === 'users' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100">
//                                     <h2 className="font-semibold text-slate-900">User Management</h2>
//                                     <p className="text-xs text-slate-400 mt-0.5">{users?.total ?? '—'} total registered users</p>
//                                 </div>
//                                 <div className="p-5">
//                                     {/* Toolbar */}
//                                     <div className="flex flex-col sm:flex-row gap-3 mb-4">
//                                         <div className="relative flex-1">
//                                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                                             <Input
//                                                 placeholder="Search name, username or email…"
//                                                 value={userSearch}
//                                                 onChange={e => setUserSearch(e.target.value)}
//                                                 className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                                             />
//                                             {userSearch && (
//                                                 <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setUserSearch('')}>
//                                                     <X size={13} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <div className="flex gap-1.5 flex-shrink-0">
//                                             {(['all', 'active', 'blocked'] as const).map(f => (
//                                                 <button key={f} onClick={() => setUserStatusFilter(f)}
//                                                     className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${userStatusFilter === f
//                                                             ? f === 'blocked' ? 'bg-red-600 text-white border-red-600'
//                                                                 : f === 'active' ? 'bg-green-600 text-white border-green-600'
//                                                                     : 'bg-slate-900 text-white border-slate-900'
//                                                             : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
//                                                         }`}>
//                                                     {f === 'all' ? 'All' : f === 'active' ? '✓ Active' : '✕ Blocked'}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     {(userSearch || userStatusFilter !== 'all') && (
//                                         <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
//                                             <span>Showing <strong className="text-slate-700">{filteredUsers.length}</strong> of <strong className="text-slate-700">{users?.total ?? 0}</strong> users</span>
//                                             <button onClick={() => { setUserSearch(''); setUserStatusFilter('all'); }} className="text-violet-600 hover:underline font-medium">Clear</button>
//                                         </div>
//                                     )}

//                                     {loading && activeLoader === 'users' ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
//                                     ) : (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left text-sm">
//                                                 <thead><tr className="bg-slate-50 border-y border-slate-100">
//                                                     <Th>User</Th><Th>Role</Th><Th>Status</Th><Th right>Actions</Th>
//                                                 </tr></thead>
//                                                 <tbody className="divide-y divide-slate-50">
//                                                     {filteredUsers.length > 0 ? filteredUsers.map(user => (
//                                                         <tr key={user.id} className="hover:bg-slate-50 transition-colors">
//                                                             <td className="px-4 py-3.5">
//                                                                 <div className="flex items-center gap-3">
//                                                                     <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
//                                                                         {user.avatar_url
//                                                                             ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
//                                                                             : <span className="text-sm font-bold text-violet-600">{(user.name?.[0] ?? '?').toUpperCase()}</span>}
//                                                                     </div>
//                                                                     <div>
//                                                                         <p className="font-medium text-slate-900">{user.name || '—'}</p>
//                                                                         <p className="text-xs text-slate-400">@{user.username || '—'}</p>
//                                                                     </div>
//                                                                 </div>
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'super_admin' ? 'bg-amber-100 text-amber-700'
//                                                                         : user.role === 'admin' ? 'bg-violet-100 text-violet-700'
//                                                                             : 'bg-slate-100 text-slate-600'
//                                                                     }`}>
//                                                                     {user.role === 'super_admin' ? 'Super Admin' : user.role}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 {user.is_blocked
//                                                                     ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><Ban size={10} /> Blocked</span>
//                                                                     : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle size={10} /> Active</span>}
//                                                             </td>
//                                                             <td className="px-4 py-3.5 text-right">
//                                                                 <button
//                                                                     onClick={() => setConfirmAction({ type: 'user', id: user.id, name: user.name, currentBlocked: user.is_blocked })}
//                                                                     disabled={loading}
//                                                                     className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${user.is_blocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
//                                                                         }`}
//                                                                 >
//                                                                     {user.is_blocked ? 'Unblock' : 'Block'}
//                                                                 </button>
//                                                             </td>
//                                                         </tr>
//                                                     )) : (
//                                                         <tr><td colSpan={4} className="py-16 text-center text-slate-400">
//                                                             <Search size={28} className="mx-auto mb-2 opacity-20" />
//                                                             <p className="text-sm">{userSearch || userStatusFilter !== 'all' ? 'No users match the current filters' : 'No users found'}</p>
//                                                         </td></tr>
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                     <PaginationControls data={users} onPage={loadUsers} />
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── COMMUNITIES ───────────────────────────────── */}
//                         {activeTab === 'groups' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
//                                     <div>
//                                         <h2 className="font-semibold text-slate-900">Community Management</h2>
//                                         <p className="text-xs text-slate-400 mt-0.5">{groups?.total ?? '—'} total communities</p>
//                                     </div>
//                                     <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//                                         <DialogTrigger asChild>
//                                             <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors flex-shrink-0">
//                                                 <Plus size={14} /> New Community
//                                             </button>
//                                         </DialogTrigger>
//                                         <DialogContent className="bg-white border-slate-200 sm:max-w-md">
//                                             <DialogHeader><DialogTitle>Create New Community</DialogTitle></DialogHeader>
//                                             <div className="space-y-4 mt-4">
//                                                 <div className="space-y-1.5">
//                                                     <Label className="text-sm font-medium">Community Name *</Label>
//                                                     <Input placeholder="e.g. Sports Predictions" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
//                                                 </div>
//                                                 <div className="space-y-1.5">
//                                                     <Label className="text-sm font-medium">Description</Label>
//                                                     <Textarea placeholder="Describe this community…" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} className="min-h-[80px]" />
//                                                 </div>
//                                                 <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
//                                                     <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="mt-0.5 rounded border-slate-300 text-violet-600 h-4 w-4" />
//                                                     <div>
//                                                         <p className="text-sm font-medium text-slate-700">Make Private</p>
//                                                         <p className="text-xs text-slate-400 mt-0.5">Members can only join via invitation</p>
//                                                     </div>
//                                                 </label>
//                                                 <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
//                                                     {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Community'}
//                                                 </Button>
//                                             </div>
//                                         </DialogContent>
//                                     </Dialog>
//                                 </div>
//                                 <div className="p-5">
//                                     {/* Toolbar */}
//                                     <div className="flex flex-col sm:flex-row gap-3 mb-4">
//                                         <div className="relative flex-1">
//                                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                                             <Input
//                                                 placeholder="Search community name, description or creator…"
//                                                 value={groupSearch}
//                                                 onChange={e => setGroupSearch(e.target.value)}
//                                                 className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                                             />
//                                             {groupSearch && (
//                                                 <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setGroupSearch('')}>
//                                                     <X size={13} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <div className="flex flex-wrap gap-1.5 flex-shrink-0">
//                                             {/* Privacy Filter */}
//                                             <Select value={groupPrivacyFilter} onValueChange={(val: any) => setGroupPrivacyFilter(val)}>
//                                                 <SelectTrigger className="w-[120px] h-9 text-xs border-slate-200 bg-white">
//                                                     <SelectValue placeholder="Privacy" />
//                                                 </SelectTrigger>
//                                                 <SelectContent className="bg-white border-slate-200">
//                                                     <SelectItem value="all">All Privacy</SelectItem>
//                                                     <SelectItem value="public">Public</SelectItem>
//                                                     <SelectItem value="private">Private</SelectItem>
//                                                 </SelectContent>
//                                             </Select>

//                                             {/* Status Filter */}
//                                             <Select value={groupStatusFilter} onValueChange={(val: any) => setGroupStatusFilter(val)}>
//                                                 <SelectTrigger className="w-[120px] h-9 text-xs border-slate-200 bg-white">
//                                                     <SelectValue placeholder="Status" />
//                                                 </SelectTrigger>
//                                                 <SelectContent className="bg-white border-slate-200">
//                                                     <SelectItem value="all">All Status</SelectItem>
//                                                     <SelectItem value="active">Active</SelectItem>
//                                                     <SelectItem value="blocked">Blocked</SelectItem>
//                                                 </SelectContent>
//                                             </Select>

//                                             {/* Sort By Filter */}
//                                             <Select value={groupSortBy} onValueChange={(val: any) => setGroupSortBy(val)}>
//                                                 <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white">
//                                                     <SelectValue placeholder="Sort By" />
//                                                 </SelectTrigger>
//                                                 <SelectContent className="bg-white border-slate-200">
//                                                     <SelectItem value="latest">Newest</SelectItem>
//                                                     <SelectItem value="members">Most Members</SelectItem>
//                                                     <SelectItem value="alphabetical">Alphabetical</SelectItem>
//                                                 </SelectContent>
//                                             </Select>
//                                         </div>
//                                     </div>

//                                     {(groupSearch || groupPrivacyFilter !== 'all' || groupStatusFilter !== 'all') && (
//                                         <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
//                                             <span>Showing <strong className="text-slate-700">{filteredGroups.length}</strong> of <strong className="text-slate-700">{groups?.total ?? 0}</strong> communities</span>
//                                             <button onClick={() => { setGroupSearch(''); setGroupPrivacyFilter('all'); setGroupStatusFilter('all'); }} className="text-violet-600 hover:underline font-medium">Clear</button>
//                                         </div>
//                                     )}

//                                     {loading && activeLoader === 'groups' ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
//                                     ) : !groups ? (
//                                         <div className="text-center py-16 text-slate-400 text-sm">Communities not loaded yet.</div>
//                                     ) : (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left text-sm">
//                                                 <thead><tr className="bg-slate-50 border-y border-slate-100">
//                                                     <Th>Community</Th><Th>Type</Th><Th>Creator</Th>
//                                                     <Th>Members</Th><Th>Status</Th><Th right>Actions</Th>
//                                                 </tr></thead>
//                                                 <tbody className="divide-y divide-slate-50">
//                                                     {filteredGroups.length > 0 ? filteredGroups.map(group => (
//                                                         <tr key={group.id} className="hover:bg-slate-50 transition-colors">
//                                                             <td className="px-4 py-3.5 font-medium text-slate-900">{group.name || '(no name)'}</td>
//                                                             <td className="px-4 py-3.5">
//                                                                 {group.is_private
//                                                                     ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"><Lock size={10} /> Private</span>
//                                                                     : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[11px] font-medium"><Globe size={10} /> Public</span>}
//                                                             </td>
//                                                             <td className="px-4 py-3.5 text-slate-500 text-xs">{group.user ? `@${group.user.username}` : '— deleted'}</td>
//                                                             <td className="px-4 py-3.5 font-semibold text-slate-700">{group.members_count}</td>
//                                                             <td className="px-4 py-3.5">
//                                                                 {group.is_blocked
//                                                                     ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><Ban size={10} /> Blocked</span>
//                                                                     : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle size={10} /> Active</span>}
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 <div className="flex items-center justify-end gap-1.5">
//                                                                     <button onClick={() => loadGroupDetails(group)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">View</button>
//                                                                     {group.is_member
//                                                                         ? <button disabled={leavingGroupId === group.id} onClick={() => handleLeaveGroup(group)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50">
//                                                                             {leavingGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Leave'}
//                                                                         </button>
//                                                                         : <button disabled={joiningGroupId === group.id || group.is_private} onClick={() => handleJoinGroup(group)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50">
//                                                                             {joiningGroupId === group.id ? <Loader2 className="h-3 w-3 animate-spin" /> : group.is_private ? 'Private' : 'Join'}
//                                                                         </button>}
//                                                                     <button
//                                                                         onClick={() => setConfirmAction({ type: 'community', id: group.id, name: group.name, currentBlocked: group.is_blocked })}
//                                                                         className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${group.is_blocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
//                                                                     >
//                                                                         {group.is_blocked ? 'Unblock' : 'Block'}
//                                                                     </button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     )) : (
//                                                         <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
//                                                             <Search size={28} className="mx-auto mb-2 opacity-20" />
//                                                             No communities found
//                                                         </td></tr>
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                     <PaginationControls data={groups} onPage={loadGroups} />
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── PREDICTIONS ───────────────────────────────── */}
//                         {activeTab === 'predictions' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
//                                     <div>
//                                         <h2 className="font-semibold text-slate-900">Predictions</h2>
//                                         <p className="text-xs text-slate-400 mt-0.5">{predictions?.total ?? '—'} total predictions</p>
//                                     </div>
//                                     <button onClick={() => openCreateModal('prediction')} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex-shrink-0">
//                                         <Plus size={14} /> Add Prediction
//                                     </button>
//                                 </div>
//                                 <div className="p-5">
//                                     {/* Filters Row 1 – Search inputs */}
//                                     <div className="flex flex-col sm:flex-row gap-2 mb-2">
//                                         <div className="relative flex-1">
//                                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                                             <Input
//                                                 placeholder="Search question…"
//                                                 value={predictionSearch}
//                                                 onChange={e => setPredictionSearch(e.target.value)}
//                                                 className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                                             />
//                                             {predictionSearch && (
//                                                 <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setPredictionSearch('')}>
//                                                     <X size={13} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                         <div className="relative flex-1">
//                                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                                             <Input
//                                                 placeholder="Search by user…"
//                                                 value={predictionUserSearch}
//                                                 onChange={e => setPredictionUserSearch(e.target.value)}
//                                                 className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                                             />
//                                             {predictionUserSearch && (
//                                                 <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setPredictionUserSearch('')}>
//                                                     <X size={13} />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Filters Row 2 – Selects + Date */}
//                                     <div className="flex flex-wrap gap-2 mb-4">
//                                         {/* Category Filter */}
//                                         <Select value={predictionCategoryFilter} onValueChange={setPredictionCategoryFilter}>
//                                             <SelectTrigger className="w-[150px] h-9 text-xs border-slate-200 bg-white">
//                                                 <SelectValue placeholder="All Categories" />
//                                             </SelectTrigger>
//                                             <SelectContent className="bg-white border-slate-200">
//                                                 <SelectItem value="all">All Categories</SelectItem>
//                                                 {fields.map(f => (
//                                                     <SelectItem key={f.id} value={String(f.id)}>{f.fields}</SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>

//                                         {/* Status Filter */}
//                                         <Select value={predictionStatusFilter} onValueChange={(val: any) => setPredictionStatusFilter(val)}>
//                                             <SelectTrigger className="w-[120px] h-9 text-xs border-slate-200 bg-white">
//                                                 <SelectValue placeholder="Status" />
//                                             </SelectTrigger>
//                                             <SelectContent className="bg-white border-slate-200">
//                                                 <SelectItem value="all">All Status</SelectItem>
//                                                 <SelectItem value="active">Active</SelectItem>
//                                                 <SelectItem value="resolved">Resolved</SelectItem>
//                                             </SelectContent>
//                                         </Select>

//                                         {/* Sort By */}
//                                         <Select value={predictionSortBy} onValueChange={(val: any) => setPredictionSortBy(val)}>
//                                             <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white">
//                                                 <SelectValue placeholder="Sort By" />
//                                             </SelectTrigger>
//                                             <SelectContent className="bg-white border-slate-200">
//                                                 <SelectItem value="latest">Latest</SelectItem>
//                                                 <SelectItem value="ending-soon">Ending Soon</SelectItem>
//                                                 <SelectItem value="alphabetical">Alphabetical</SelectItem>
//                                             </SelectContent>
//                                         </Select>

//                                         {/* Validation End Date Filter */}
//                                         <div className="relative">
//                                             <input
//                                                 type="date"
//                                                 value={predictionEndDateFilter}
//                                                 onChange={e => setPredictionEndDateFilter(e.target.value)}
//                                                 className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-300"
//                                                 title="Filter by validation end date"
//                                             />
//                                             {predictionEndDateFilter && (
//                                                 <button
//                                                     className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                                                     onClick={() => setPredictionEndDateFilter('')}
//                                                 >
//                                                     <X size={12} />
//                                                 </button>
//                                             )}
//                                         </div>

//                                         {/* Clear all filters */}
//                                         {(predictionSearch || predictionUserSearch || predictionCategoryFilter !== 'all' || predictionStatusFilter !== 'all' || predictionEndDateFilter) && (
//                                             <button
//                                                 onClick={() => { setPredictionSearch(''); setPredictionUserSearch(''); setPredictionCategoryFilter('all'); setPredictionStatusFilter('all'); setPredictionScopeFilter('all'); setPredictionEndDateFilter(''); }}
//                                                 className="h-9 px-3 text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 border border-violet-200 rounded-md transition-colors"
//                                             >
//                                                 Clear all
//                                             </button>
//                                         )}
//                                     </div>

//                                     {(predictionSearch || predictionUserSearch || predictionCategoryFilter !== 'all' || predictionStatusFilter !== 'all' || predictionEndDateFilter) && (
//                                         <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
//                                             <span>Showing <strong className="text-slate-700">{filteredPredictions.length}</strong> of <strong className="text-slate-700">{predictions?.total ?? 0}</strong> predictions</span>
//                                         </div>
//                                     )}

//                                     {loading && activeLoader === 'predictions' ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-amber-400" /></div>
//                                     ) : (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left text-sm">
//                                                 <thead><tr className="bg-slate-50 border-y border-slate-100">
//                                                     <Th>Question</Th>
//                                                     <Th>Created By</Th>
//                                                     <Th>Category</Th>
//                                                     <Th>Validation End</Th>
//                                                     <Th right>Actions</Th>
//                                                 </tr></thead>
//                                                 <tbody className="divide-y divide-slate-50">
//                                                     {filteredPredictions.length > 0 ? filteredPredictions.map(q => (
//                                                         <tr key={q.id} className="hover:bg-slate-50 transition-colors">
//                                                             <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[280px]">
//                                                                 <span className="block truncate" title={q.questions}>
//                                                                     {q.questions.substring(0, 70)}{q.questions.length > 70 ? '…' : ''}
//                                                                 </span>
//                                                                 {q.is_archived && (
//                                                                     <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Archived</span>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 <span className="text-slate-700 text-xs font-medium">{q.user?.name || '—'}</span>
//                                                                 <span className="block text-[11px] text-slate-400">@{q.user?.username || '—'}</span>
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 {q.field ? (
//                                                                     <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
//                                                                         {q.field.fields}
//                                                                     </span>
//                                                                 ) : <span className="text-slate-300 text-xs">—</span>}
//                                                             </td>
//                                                             <td className="px-4 py-3.5">
//                                                                 {(q.voting_end_date || q.end_date) ? (
//                                                                     <span className="text-xs text-slate-600">
//                                                                         {new Date(q.voting_end_date || q.end_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                                                     </span>
//                                                                 ) : <span className="text-slate-300 text-xs">—</span>}
//                                                             </td>
//                                                             <td className="px-4 py-3.5 text-right">
//                                                                 <div className="flex items-center justify-end gap-1.5">
//                                                                     <button onClick={() => loadQuestionDetails(q)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">View</button>
//                                                                     <button
//                                                                         onClick={() => handleArchiveQuestion(q.id, q.is_archived)}
//                                                                         className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${q.is_archived
//                                                                                 ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
//                                                                                 : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
//                                                                             }`}
//                                                                     >
//                                                                         {q.is_archived ? 'Unarchive' : 'Archive'}
//                                                                     </button>
//                                                                     <button onClick={() => handleDeleteQuestion(q.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Delete</button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     )) : (
//                                                         <tr><td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
//                                                             <Search size={28} className="mx-auto mb-2 opacity-20" />
//                                                             <p>No predictions match the current filters</p>
//                                                         </td></tr>
//                                                     )}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                     <PaginationControls data={predictions} onPage={loadPredictions} />
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── POLLS ─────────────────────────────────────── */}
//                         {activeTab === 'polls' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
//                                     <div>
//                                         <h2 className="font-semibold text-slate-900">Polls</h2>
//                                         <p className="text-xs text-slate-400 mt-0.5">{polls?.total ?? '—'} total polls</p>
//                                     </div>
//                                     <button onClick={() => openCreateModal('poll')} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold hover:bg-pink-700 transition-colors flex-shrink-0">
//                                         <Plus size={14} /> Add Poll
//                                     </button>
//                                 </div>
//                                 <div className="p-5">
//                                     {loading && activeLoader === 'polls' ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-pink-400" /></div>
//                                     ) : (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left text-sm">
//                                                 <thead><tr className="bg-slate-50 border-y border-slate-100">
//                                                     <Th>Poll Question</Th><Th>Created By</Th><Th right>Actions</Th>
//                                                 </tr></thead>
//                                                 <tbody className="divide-y divide-slate-50">
//                                                     {polls?.data.map(q => (
//                                                         <tr key={q.id} className="hover:bg-slate-50 transition-colors">
//                                                             <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[400px]">
//                                                                 {q.questions.substring(0, 90)}{q.questions.length > 90 ? '…' : ''}
//                                                             </td>
//                                                             <td className="px-4 py-3.5 text-slate-400 text-xs">{q.user ? `@${q.user.username}` : '—'}</td>
//                                                             <td className="px-4 py-3.5 text-right">
//                                                                 <div className="flex items-center justify-end gap-1.5">
//                                                                     <button onClick={() => loadQuestionDetails(q)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">View</button>
//                                                                     <button onClick={() => handleDeleteQuestion(q.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Delete</button>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                     <PaginationControls data={polls} onPage={loadPolls} />
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── LEADERBOARD ───────────────────────────────── */}
//                         {activeTab === 'leaderboard' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100">
//                                     <h2 className="font-semibold text-slate-900">Leaderboard</h2>
//                                     <p className="text-xs text-slate-400 mt-0.5">Top users ranked by prediction accuracy</p>
//                                 </div>
//                                 <div className="p-5">
//                                     {loading && activeLoader === 'leaderboard' ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
//                                     ) : (
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-left text-sm">
//                                                 <thead><tr className="bg-slate-50 border-y border-slate-100">
//                                                     <Th>#</Th><Th>User</Th>
//                                                     <Th right>Score</Th><Th right>Accuracy</Th><Th right>Correct / Total</Th>
//                                                 </tr></thead>
//                                                 <tbody className="divide-y divide-slate-50">
//                                                     {leaderboard?.data.map((entry, index) => {
//                                                         const acc = Number(entry.accuracy) || 0;
//                                                         const score = Number(entry.score) || 0;
//                                                         const correct = Number(entry.correct_predictions) || 0;
//                                                         const total = Number(entry.total_predictions) || 0;
//                                                         const rank = (leaderboard.current_page - 1) * 20 + index + 1;
//                                                         return (
//                                                             <tr key={entry.user?.id || index} className="hover:bg-slate-50 transition-colors">
//                                                                 <td className="px-4 py-3.5">
//                                                                     <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold ${rank === 1 ? 'bg-amber-100 text-amber-700'
//                                                                             : rank === 2 ? 'bg-slate-200 text-slate-600'
//                                                                                 : rank === 3 ? 'bg-orange-100 text-orange-600'
//                                                                                     : 'bg-slate-100 text-slate-500'
//                                                                         }`}>{rank}</span>
//                                                                 </td>
//                                                                 <td className="px-4 py-3.5">
//                                                                     <div className="flex items-center gap-3">
//                                                                         {entry.user?.avatar_url && <img src={entry.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
//                                                                         <div>
//                                                                             <p className="font-medium text-slate-900">{entry.user?.name || '—'}</p>
//                                                                             <p className="text-xs text-slate-400">@{entry.user?.username || 'unknown'}</p>
//                                                                         </div>
//                                                                     </div>
//                                                                 </td>
//                                                                 <td className="px-4 py-3.5 text-right font-bold text-slate-900">{score}</td>
//                                                                 <td className="px-4 py-3.5 text-right">
//                                                                     <span className={`font-semibold ${acc >= 70 ? 'text-green-600' : acc >= 40 ? 'text-amber-600' : 'text-slate-400'}`}>
//                                                                         {acc.toFixed(1)}%
//                                                                     </span>
//                                                                 </td>
//                                                                 <td className="px-4 py-3.5 text-right text-slate-600">{correct} / {total}</td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                     <PaginationControls data={leaderboard} onPage={loadLeaderboard} />
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── PRIVACY POLICY ────────────────────────────── */}
//                         {activeTab === 'privacy-policy' && (
//                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//                                 <div className="px-5 py-4 border-b border-slate-100">
//                                     <h2 className="font-semibold text-slate-900">Privacy Policy</h2>
//                                     <p className="text-xs text-slate-400 mt-0.5">Current privacy policy displayed to users</p>
//                                 </div>
//                                 <div className="p-6">
//                                     {privacyLoading ? (
//                                         <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
//                                     ) : privacyText ? (
//                                         <div className="prose prose-slate prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: privacyText }} />
//                                     ) : (
//                                         <div className="text-center py-16 text-slate-400">
//                                             <Shield size={36} className="mx-auto mb-3 opacity-20" />
//                                             <p className="text-sm">No privacy policy content configured</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* ─── PROFILE ───────────────────────────────────── */}
//                         {/* {activeTab === 'profile' && (
//                             <div className="max-w-2xl mx-auto">
//                                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                                     <div className="h-32 bg-gradient-to-r from-violet-500 to-pink-500" />
//                                     <div className="px-6 pb-6">
//                                         {profileLoading ? (
//                                             <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
//                                         ) : adminProfile ? (<>
//                                             <div className="flex items-end gap-4 -mt-12 mb-6">
//                                                 <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
//                                                     <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.name} />
//                                                     <AvatarFallback className="bg-violet-100 text-violet-700 text-2xl font-bold">
//                                                         {(adminProfile.name?.[0] ?? 'A').toUpperCase()}
//                                                     </AvatarFallback>
//                                                 </Avatar>
//                                                 <div className="pb-1 flex-1">
//                                                     <h2 className="text-xl font-bold text-slate-900">{adminProfile.name}</h2>
//                                                     <p className="text-sm text-slate-400">@{adminProfile.username}</p>
//                                                 </div>
//                                                 <span className={`pb-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${adminProfile.role === 'super_admin' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}`}>
//                                                     {adminProfile.role?.replace('_', ' ')}
//                                                 </span>
//                                             </div>
//                                             <div className="grid grid-cols-2 gap-3">
//                                                 {[
//                                                     ['Email', adminProfile.email],
//                                                     ['User ID', `#${adminProfile.id}`],
//                                                     ['Status', adminProfile.is_blocked ? 'Blocked' : 'Active'],
//                                                     ['Member Since', adminProfile.created_at ? new Date(adminProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
//                                                 ].map(([label, val]) => (
//                                                     <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
//                                                         <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
//                                                         <p className="text-sm font-semibold text-slate-800 truncate">{val}</p>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </>) : (
//                                             <div className="text-center py-12 text-slate-400 text-sm">Failed to load profile</div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )} */}


//                         {activeTab === 'profile' && (
//                             <div className="max-w-2xl mx-auto space-y-4">

//                                 {/* ── Profile Hero Card ── */}
//                                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                                     {/* Banner */}
//                                     <div className="relative h-36 bg-[#0f172a] overflow-hidden">
//                                         <div className="absolute inset-0 opacity-20"
//                                             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 80% 20%, #db2777 0%, transparent 50%)' }}
//                                         />
//                                         <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
//                                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                                             <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">Online</span>
//                                         </div>
//                                     </div>

//                                     <div className="px-6 pb-6">
//                                         {profileLoading ? (
//                                             <div className="flex justify-center py-12">
//                                                 <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
//                                             </div>
//                                         ) : adminProfile ? (
//                                             <>
//                                                 {/* Avatar row */}
//                                                 <div className="flex items-end justify-between -mt-14 mb-5">
//                                                     <div className="relative">
//                                                         <Avatar className="h-24 w-24 border-[3px] border-white shadow-lg ring-2 ring-violet-100">
//                                                             <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.name} />
//                                                             <AvatarFallback className="bg-violet-600 text-white text-2xl font-bold">
//                                                                 {(adminProfile.name?.[0] ?? 'A').toUpperCase()}
//                                                             </AvatarFallback>
//                                                         </Avatar>
//                                                         <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
//                                                     </div>
//                                                     <button
//                                                         onClick={openEditProfile}
//                                                         className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
//                                                     >
//                                                         <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                             <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//                                                             <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//                                                         </svg>
//                                                         Edit Profile
//                                                     </button>
//                                                 </div>

//                                                 {/* Name / role */}
//                                                 <div className="mb-5">
//                                                     <div className="flex items-center gap-2.5 flex-wrap">
//                                                         <h2 className="text-xl font-bold text-slate-900">{adminProfile.name}</h2>
//                                                         <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${adminProfile.role === 'super_admin'
//                                                                 ? 'bg-amber-100 text-amber-700'
//                                                                 : adminProfile.role === 'system_admin'
//                                                                     ? 'bg-red-100 text-red-700'
//                                                                     : 'bg-violet-100 text-violet-700'
//                                                             }`}>
//                                                             {adminProfile.role?.replace(/_/g, ' ')}
//                                                         </span>
//                                                     </div>
//                                                     <p className="text-sm text-slate-400 mt-0.5">@{adminProfile.username}</p>
//                                                 </div>

//                                                 {/* Info grid */}
//                                                 <div className="grid grid-cols-2 gap-2.5">
//                                                     {([
//                                                         {
//                                                             icon: (
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                                     <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//                                                                     <polyline points="22,6 12,13 2,6" />
//                                                                 </svg>
//                                                             ),
//                                                             label: 'Email address',
//                                                             value: adminProfile.email,
//                                                             color: 'text-violet-600',
//                                                             bg: 'bg-violet-50',
//                                                         },
//                                                         {
//                                                             icon: (
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                                                                     <circle cx="12" cy="7" r="4" />
//                                                                 </svg>
//                                                             ),
//                                                             label: 'User ID',
//                                                             value: `#${adminProfile.id}`,
//                                                             color: 'text-slate-600',
//                                                             bg: 'bg-slate-50',
//                                                         },
//                                                         {
//                                                             icon: (
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                                     <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//                                                                     <polyline points="22 4 12 14.01 9 11.01" />
//                                                                 </svg>
//                                                             ),
//                                                             label: 'Account status',
//                                                             value: adminProfile.is_blocked ? 'Blocked' : 'Active',
//                                                             color: adminProfile.is_blocked ? 'text-red-600' : 'text-emerald-600',
//                                                             bg: adminProfile.is_blocked ? 'bg-red-50' : 'bg-emerald-50',
//                                                         },
//                                                         {
//                                                             icon: (
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                                     <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//                                                                     <line x1="16" y1="2" x2="16" y2="6" />
//                                                                     <line x1="8" y1="2" x2="8" y2="6" />
//                                                                     <line x1="3" y1="10" x2="21" y2="10" />
//                                                                 </svg>
//                                                             ),
//                                                             label: 'Member since',
//                                                             value: adminProfile.created_at
//                                                                 ? new Date(adminProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
//                                                                 : '—',
//                                                             color: 'text-slate-600',
//                                                             bg: 'bg-slate-50',
//                                                         },
//                                                     ] as { icon: React.ReactNode; label: string; value: string; color: string; bg: string }[]).map(item => (
//                                                         <div key={item.label} className={`flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 ${item.bg}`}>
//                                                             <div className={`mt-0.5 flex-shrink-0 ${item.color}`}>{item.icon}</div>
//                                                             <div className="min-w-0">
//                                                                 <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
//                                                                 <p className={`text-sm font-semibold truncate ${item.color}`}>{item.value}</p>
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </>
//                                         ) : (
//                                             <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
//                                                     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//                                                 </svg>
//                                                 <p className="text-sm">Failed to load profile</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* ── Security Settings ── */}
//                                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//                                     {/* Section header */}
//                                     <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
//                                             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                                         </svg>
//                                         <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Security settings</p>
//                                     </div>

//                                     {/* ── Change Password row ── */}
//                                     <div className="border-b border-slate-100 last:border-0">
//                                         <button
//                                             onClick={() => { setShowPasswordForm(v => !v); setShowEmailForm(false); }}
//                                             className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors group"
//                                         >
//                                             <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                                                     <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                                                 </svg>
//                                             </div>
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="text-sm font-semibold text-slate-800">Change password</p>
//                                                 <p className="text-xs text-slate-400 mt-0.5">Update your account password regularly for security</p>
//                                             </div>
//                                             <div className={`flex-shrink-0 h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center transition-all ${showPasswordForm ? 'bg-violet-600 border-violet-600 rotate-180' : 'bg-white group-hover:border-slate-300'}`}>
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={showPasswordForm ? 'white' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
//                                                     <polyline points="6 9 12 15 18 9" />
//                                                 </svg>
//                                             </div>
//                                         </button>

//                                         {showPasswordForm && (
//                                             <div className="px-5 pb-5 space-y-4 bg-slate-50/50 border-t border-slate-100">
//                                                 <div className="pt-4 grid grid-cols-1 gap-3">
//                                                     <div className="space-y-1.5">
//                                                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current password</label>
//                                                         <Input
//                                                             type="password"
//                                                             placeholder="Enter your current password"
//                                                             value={currentPassword}
//                                                             onChange={e => setCurrentPassword(e.target.value)}
//                                                             className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                         />
//                                                     </div>
//                                                     <div className="grid grid-cols-2 gap-3">
//                                                         <div className="space-y-1.5">
//                                                             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New password</label>
//                                                             <Input
//                                                                 type="password"
//                                                                 placeholder="Min. 8 characters"
//                                                                 value={newPassword}
//                                                                 onChange={e => setNewPassword(e.target.value)}
//                                                                 className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                             />
//                                                         </div>
//                                                         <div className="space-y-1.5">
//                                                             <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm password</label>
//                                                             <Input
//                                                                 type="password"
//                                                                 placeholder="Repeat new password"
//                                                                 value={confirmPassword}
//                                                                 onChange={e => setConfirmPassword(e.target.value)}
//                                                                 className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                             />
//                                                         </div>
//                                                     </div>

//                                                     {/* Password strength indicator */}
//                                                     {newPassword && (
//                                                         <div className="space-y-1.5">
//                                                             <div className="flex gap-1">
//                                                                 {[1, 2, 3, 4].map(i => (
//                                                                     <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${newPassword.length >= i * 2
//                                                                             ? newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-amber-400'
//                                                                             : 'bg-slate-200'
//                                                                         }`} />
//                                                                 ))}
//                                                             </div>
//                                                             <p className={`text-[11px] font-medium ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>
//                                                                 {newPassword.length < 4 ? 'Too short' : newPassword.length < 8 ? 'Almost there — keep going' : 'Strong password'}
//                                                             </p>
//                                                         </div>
//                                                     )}

//                                                     {newPassword && confirmPassword && newPassword !== confirmPassword && (
//                                                         <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
//                                                             <X size={12} /> Passwords do not match
//                                                         </div>
//                                                     )}
//                                                     {newPassword && confirmPassword && newPassword === confirmPassword && (
//                                                         <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
//                                                             <CheckCircle size={12} /> Passwords match
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 <div className="flex items-center justify-between pt-1 border-t border-slate-200">
//                                                     <button
//                                                         onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
//                                                         className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
//                                                     >
//                                                         Cancel
//                                                     </button>
//                                                     <Button
//                                                         size="sm"
//                                                         onClick={handleChangePassword}
//                                                         disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
//                                                         className="h-9 px-5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
//                                                     >
//                                                         {passwordSaving
//                                                             ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Updating…</>
//                                                             : <>
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
//                                                                     <polyline points="20 6 9 17 4 12" />
//                                                                 </svg>
//                                                                 Update password
//                                                             </>
//                                                         }
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* ── Change Email row ── */}
//                                     <div>
//                                         <button
//                                             onClick={() => { setShowEmailForm(v => !v); setShowPasswordForm(false); }}
//                                             className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors group"
//                                         >
//                                             <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                                     <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//                                                     <polyline points="22,6 12,13 2,6" />
//                                                 </svg>
//                                             </div>
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="text-sm font-semibold text-slate-800">Change email address</p>
//                                                 <p className="text-xs text-slate-400 mt-0.5 truncate">Current: <span className="text-slate-500 font-medium">{adminProfile?.email ?? '—'}</span></p>
//                                             </div>
//                                             <div className={`flex-shrink-0 h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center transition-all ${showEmailForm ? 'bg-violet-600 border-violet-600 rotate-180' : 'bg-white group-hover:border-slate-300'}`}>
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={showEmailForm ? 'white' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
//                                                     <polyline points="6 9 12 15 18 9" />
//                                                 </svg>
//                                             </div>
//                                         </button>

//                                         {showEmailForm && (
//                                             <div className="px-5 pb-5 space-y-4 bg-slate-50/50 border-t border-slate-100">
//                                                 <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 border border-sky-100">
//                                                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 flex-shrink-0 mt-0.5">
//                                                         <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
//                                                     </svg>
//                                                     <p className="text-xs text-sky-700 leading-relaxed">
//                                                         A verification link will be sent to your new email. Your email won't change until you verify it.
//                                                     </p>
//                                                 </div>

//                                                 <div className="grid grid-cols-2 gap-3">
//                                                     <div className="space-y-1.5">
//                                                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New email address</label>
//                                                         <Input
//                                                             type="email"
//                                                             placeholder="you@example.com"
//                                                             value={newEmail}
//                                                             onChange={e => setNewEmail(e.target.value)}
//                                                             className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
//                                                         />
//                                                     </div>
//                                                     <div className="space-y-1.5">
//                                                         <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm with password</label>
//                                                         <Input
//                                                             type="password"
//                                                             placeholder="Your current password"
//                                                             value={emailPassword}
//                                                             onChange={e => setEmailPassword(e.target.value)}
//                                                             className="h-10 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
//                                                         />
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex items-center justify-between pt-1 border-t border-slate-200">
//                                                     <button
//                                                         onClick={() => { setShowEmailForm(false); setNewEmail(''); setEmailPassword(''); }}
//                                                         className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
//                                                     >
//                                                         Cancel
//                                                     </button>
//                                                     <Button
//                                                         size="sm"
//                                                         onClick={handleChangeEmail}
//                                                         disabled={emailSaving || !newEmail.trim() || !emailPassword.trim()}
//                                                         className="h-9 px-5 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white border-0 shadow-sm"
//                                                     >
//                                                         {emailSaving
//                                                             ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Updating…</>
//                                                             : <>
//                                                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
//                                                                     <polyline points="20 6 9 17 4 12" />
//                                                                 </svg>
//                                                                 Update email
//                                                             </>
//                                                         }
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* ── Danger Zone ── */}
//                                 <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
//                                     <div className="px-5 py-3.5 border-b border-red-100 flex items-center gap-2 bg-red-50/50">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
//                                             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
//                                             <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
//                                         </svg>
//                                         <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">Danger zone</p>
//                                     </div>
//                                     <div className="px-5 py-4 flex items-center justify-between gap-4">
//                                         <div>
//                                             <p className="text-sm font-semibold text-slate-800">Sign out of all devices</p>
//                                             <p className="text-xs text-slate-400 mt-0.5">Revoke all active sessions across every device</p>
//                                         </div>
//                                         <button
//                                             onClick={handleLogout}
//                                             className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
//                                         >
//                                             <LogOut size={13} />
//                                             Sign out
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}


//                         {/* Edit Profile Modal */}
//                         <Dialog open={editingProfile} onOpenChange={open => { if (!open) setEditingProfile(false); }}>
//                             <DialogContent className="bg-white border-slate-200 shadow-xl max-w-md">
//                                 <DialogHeader>
//                                     <DialogTitle className="text-base font-bold text-slate-900">Edit profile</DialogTitle>
//                                     <p className="text-xs text-slate-400 mt-0.5">Update your display name, username and photo</p>
//                                 </DialogHeader>

//                                 <div className="space-y-5 mt-2">
//                                     {/* Avatar upload */}
//                                     <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
//                                         <div className="relative flex-shrink-0">
//                                             <Avatar className="h-16 w-16 border-2 border-white shadow-md ring-2 ring-violet-100">
//                                                 <AvatarImage src={editAvatarPreview ?? undefined} />
//                                                 <AvatarFallback className="bg-violet-600 text-white text-xl font-bold">
//                                                     {(editName?.[0] ?? 'A').toUpperCase()}
//                                                 </AvatarFallback>
//                                             </Avatar>
//                                             <label
//                                                 htmlFor="avatar-upload"
//                                                 className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-violet-600 text-white cursor-pointer hover:bg-violet-700 transition-colors shadow flex items-center justify-center"
//                                             >
//                                                 <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                                                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                                                     <polyline points="17 8 12 3 7 8" />
//                                                     <line x1="12" y1="3" x2="12" y2="15" />
//                                                 </svg>
//                                                 <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
//                                             </label>
//                                         </div>
//                                         <div>
//                                             <p className="text-sm font-semibold text-slate-700">Profile photo</p>
//                                             <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or GIF · Max 2MB</p>
//                                             {editAvatarPreview && editAvatar && (
//                                                 <button
//                                                     onClick={() => { setEditAvatar(null); setEditAvatarPreview(adminProfile?.avatar_url ?? null); }}
//                                                     className="text-[11px] text-red-500 hover:text-red-700 font-medium mt-1 transition-colors"
//                                                 >
//                                                     Remove new photo
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Fields */}
//                                     <div className="space-y-3">
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div className="space-y-1.5">
//                                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full name</label>
//                                                 <Input
//                                                     value={editName}
//                                                     onChange={e => setEditName(e.target.value)}
//                                                     placeholder="Your full name"
//                                                     className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                 />
//                                             </div>
//                                             <div className="space-y-1.5">
//                                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
//                                                 <div className="relative">
//                                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
//                                                     <Input
//                                                         value={editUsername}
//                                                         onChange={e => setEditUsername(e.target.value)}
//                                                         placeholder="username"
//                                                         maxLength={20}
//                                                         className="h-10 text-sm pl-7 border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div className="space-y-1.5">
//                                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</label>
//                                                 <Input
//                                                     value={editCountry}
//                                                     onChange={e => setEditCountry(e.target.value)}
//                                                     placeholder="e.g. India"
//                                                     className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                 />
//                                             </div>
//                                             <div className="space-y-1.5">
//                                                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
//                                                 <Input
//                                                     value={editCity}
//                                                     onChange={e => setEditCity(e.target.value)}
//                                                     placeholder="e.g. Mumbai"
//                                                     className="h-10 text-sm border-slate-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Actions */}
//                                     <div className="flex items-center justify-between pt-2 border-t border-slate-100">
//                                         <button
//                                             onClick={() => setEditingProfile(false)}
//                                             className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <Button
//                                             onClick={handleSaveProfile}
//                                             disabled={profileSaving || !editName.trim() || !editUsername.trim()}
//                                             className="h-9 px-6 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm"
//                                         >
//                                             {profileSaving
//                                                 ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
//                                                 : <>
//                                                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
//                                                         <polyline points="20 6 9 17 4 12" />
//                                                     </svg>
//                                                     Save changes
//                                                 </>
//                                             }
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </DialogContent>
//                         </Dialog>


//                         {/* ─── NOTIFICATIONS (CONTACT MESSAGES) ────────── */}
//                        {activeTab === 'notifications' && (
//     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
//             <div>
//                 <h2 className="font-semibold text-slate-900">Notifications & Messages</h2>
//                 <p className="text-xs text-slate-400 mt-0.5">
//                     {allNotifications.length + (contactMessages?.data?.length || 0)} total • {unreadCount} unread
//                 </p>
//             </div>

//             <div className="flex gap-2">
//                 {(['all', 'contact', 'join_request'] as const).map(type => (
//                     <button
//                         key={type}
//                         onClick={() => setNotificationFilter(type)}
//                         className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
//                             notificationFilter === type
//                                 ? 'bg-violet-600 text-white'
//                                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                         }`}
//                     >
//                         {type === 'all' && 'All'}
//                         {type === 'contact' && 'Contact Messages'}
//                         {type === 'join_request' && 'Join Requests'}
//                     </button>
//                 ))}
//             </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
//             {/* Left Pane - List */}
//             <div className="md:col-span-1 border-r border-slate-100 p-4 overflow-y-auto max-h-[600px]">
//                 {filteredNotifications().length > 0 ? (
//                     <div className="space-y-2">
//                         {filteredNotifications().map((item: any) => {
//                             const isJoinRequest = item.type === 'App\\Notifications\\JoinRequestNotification' ||
//                                                 item.data?.type === 'join_request';
//                             const isContact = !isJoinRequest;
//                             const isSelected = selectedMessageDetails?.id === (isJoinRequest ? item.id : item.id);

//                             return (
//                                 <div
//                                     key={item.id}
//                                     onClick={() => (isJoinRequest ? viewNotificationDetails(item) : viewMessageDetails(item.id))}
//                                     className={`p-3 flex items-center gap-3 cursor-pointer rounded-xl transition-all border ${
//                                         isSelected ? 'bg-violet-50 border-violet-200' : 'hover:bg-slate-50'
//                                     }`}
//                                 >
//                                     <div className="relative flex-shrink-0">
//                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
//                                             isJoinRequest 
//                                                 ? 'bg-amber-100 text-amber-600' 
//                                                 : (isSelected ? 'bg-violet-200 text-violet-700' : 'bg-pink-100 text-pink-600')
//                                         }`}>
//                                             {isJoinRequest ? '👥' : (item.name?.[0] || 'C')}
//                                         </div>
//                                         {((isJoinRequest && !item.read_at) || (isContact && !item.is_read)) && (
//                                             <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 border border-white" />
//                                         )}
//                                     </div>

//                                     <div className="flex-1 min-w-0">
//                                         <p className="text-xs font-semibold text-slate-800 truncate">
//                                             {isJoinRequest 
//                                                 ? `${item.data?.requester_name} wants to join` 
//                                                 : item.name}
//                                         </p>
//                                         <p className="text-[11px] text-slate-500 truncate mt-0.5">
//                                             {isJoinRequest 
//                                                 ? item.data?.group_name 
//                                                 : item.message}
//                                         </p>
//                                     </div>

//                                     <span className="text-[9px] text-slate-400 whitespace-nowrap self-start mt-0.5">
//                                         {new Date(isJoinRequest ? item.created_at : item.created_at).toLocaleDateString()}
//                                     </span>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 ) : (
//                     <div className="text-center py-20 text-slate-400">
//                         <Bell size={28} className="mx-auto mb-2 opacity-20" />
//                         <p className="text-sm">No notifications found</p>
//                     </div>
//                 )}
//             </div>

//             {/* Right Pane - Details */}
//             <div className="md:col-span-2 p-6 bg-slate-50/50 flex flex-col">
//                 {messageDetailsLoading ? (
//                     <div className="flex-1 flex items-center justify-center">
//                         <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
//                     </div>
//                 ) : selectedMessageDetails ? (
//                     <div className="space-y-5 flex-1 flex flex-col justify-between">
//                         <div className="space-y-4">
//                             <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-200/60 pb-4">
//                                 <div>
//                                     <h3 className="font-bold text-slate-900 text-base">
//                                         {selectedMessageDetails.data?.type === 'join_request' 
//                                             ? `${selectedMessageDetails.data.requester_name} - Join Request`
//                                             : selectedMessageDetails.name}
//                                     </h3>
//                                     <p className="text-sm text-violet-600 font-medium mt-0.5">
//                                         {selectedMessageDetails.data?.type === 'join_request' 
//                                             ? selectedMessageDetails.data.group_name 
//                                             : selectedMessageDetails.email}
//                                     </p>
//                                     <p className="text-xs text-slate-400 mt-1">
//                                         Sent: {new Date(selectedMessageDetails.created_at || selectedMessageDetails.data?.created_at).toLocaleString()}
//                                     </p>
//                                 </div>
//                                 <span className={`self-start px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
//                                     (selectedMessageDetails.read_at || selectedMessageDetails.is_read) 
//                                         ? 'bg-slate-200 text-slate-700' 
//                                         : 'bg-pink-100 text-pink-700'
//                                 }`}>
//                                     {(selectedMessageDetails.read_at || selectedMessageDetails.is_read) ? 'Read' : 'New'}
//                                 </span>
//                             </div>

//                             <div className="p-5 rounded-2xl bg-white border border-slate-150 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm min-h-[150px]">
//                                 {selectedMessageDetails.data?.type === 'join_request' 
//                                     ? `${selectedMessageDetails.data.requester_name} has requested to join the group "${selectedMessageDetails.data.group_name}".`
//                                     : selectedMessageDetails.message}
//                             </div>
//                         </div>

//                         {/* Join Request Actions */}
//                         {selectedMessageDetails.data?.type === 'join_request' && (
//                             <div className="flex gap-3 pt-6 border-t border-slate-200">
//                                 <Button
//                                     onClick={() => handleJoinRequestAction(
//                                         selectedMessageDetails.data.group_id,
//                                         selectedMessageDetails.data.requester_id,
//                                         'accept'
//                                     )}
//                                     className="bg-emerald-600 hover:bg-emerald-700 flex-1"
//                                 >
//                                     ✅ Accept Request
//                                 </Button>
//                                 <Button
//                                     variant="destructive"
//                                     onClick={() => handleJoinRequestAction(
//                                         selectedMessageDetails.data.group_id,
//                                         selectedMessageDetails.data.requester_id,
//                                         'reject'
//                                     )}
//                                     className="flex-1"
//                                 >
//                                     ❌ Reject Request
//                                 </Button>
//                             </div>
//                         )}

//                         {/* Contact Message Actions */}
//                         {selectedMessageDetails.data?.type !== 'join_request' && (
//                             <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/60">
//                                 <Button
//                                     variant="secondary"
//                                     size="sm"
//                                     onClick={() => toggleMessageRead(selectedMessageDetails.id)}
//                                     className="h-9 px-4 text-xs font-medium"
//                                 >
//                                     Mark as {selectedMessageDetails.is_read ? 'Unread' : 'Read'}
//                                 </Button>
//                                 <Button
//                                     variant="destructive"
//                                     size="sm"
//                                     onClick={() => deleteMessage(selectedMessageDetails.id)}
//                                     className="h-9 px-4 text-xs font-medium"
//                                 >
//                                     Delete Permanently
//                                 </Button>
//                             </div>
//                         )}
//                     </div>
//                 ) : (
//                     <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
//                         <MessageSquare size={36} className="mb-2 opacity-25" />
//                         <p className="text-sm">Select a notification or message to view details</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     </div>
// )}









                        
//                     </div>
//                 </main>
//             </div>

//             {/* ─── MODALS ────────────────────────────────────────────────── */}

//             {/* Community Details */}
//             <Dialog open={!!selectedGroup} onOpenChange={open => { if (!open) { setSelectedGroup(null); setGroupDetails(null); } }}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-3xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="text-lg">{selectedGroup?.name || 'Community Details'}</DialogTitle>
//                         <p className="text-sm text-slate-500">{selectedGroup?.description || 'No description'}</p>
//                     </DialogHeader>
//                     <div className="mt-2">
//                         {joinedGroupIds.includes(selectedGroup?.id ?? 0)
//                             ? <Button variant="destructive" disabled={joiningGroupId === selectedGroup?.id} onClick={() => handleLeaveGroup(selectedGroup as Group)}>{joiningGroupId === selectedGroup?.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Leaving…</> : 'Leave Community'}</Button>
//                             : <Button className="bg-violet-600 hover:bg-violet-700" disabled={joiningGroupId === selectedGroup?.id} onClick={() => handleJoinGroup(selectedGroup as Group)}>{joiningGroupId === selectedGroup?.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining…</> : 'Join Community'}</Button>}
//                     </div>
//                     {detailsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>
//                         : groupDetails ? (
//                             <div className="space-y-6 mt-4">
//                                 <div>
//                                     <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Users size={15} /> Members ({groupDetails.members_count || 0})</h3>
//                                     {groupDetails.members?.length > 0
//                                         ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                                             {groupDetails.members.map((m: any) => (
//                                                 <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
//                                                     <Avatar className="h-8 w-8"><AvatarImage src={m.avatar_url} /><AvatarFallback>{m.name?.[0] || '?'}</AvatarFallback></Avatar>
//                                                     <div><p className="text-xs font-semibold text-slate-800">{m.name}</p><p className="text-[10px] text-slate-400">@{m.username}</p></div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                         : <p className="text-sm text-slate-400">No members yet</p>}
//                                 </div>
//                                 <div>
//                                     <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><MessageSquare size={15} /> Questions ({groupDetails.questions?.length || 0})</h3>
//                                     {groupDetails.questions?.length > 0
//                                         ? <div className="space-y-2">
//                                             {groupDetails.questions.map((q: any) => (
//                                                 <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
//                                                     <p className="text-sm font-medium text-slate-800">{q.questions.substring(0, 100)}{q.questions.length > 100 ? '…' : ''}</p>
//                                                     <p className="text-[10px] text-slate-400 mt-1 capitalize">{q.module_type} · @{q.user?.username || 'unknown'}</p>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                         : <p className="text-sm text-slate-400">No questions shared yet</p>}
//                                 </div>
//                             </div>
//                         ) : <div className="text-center py-8 text-slate-400 text-sm">Failed to load details</div>}
//                     <div className="flex justify-end mt-4"><Button variant="outline" onClick={() => setSelectedGroup(null)}>Close</Button></div>
//                 </DialogContent>
//             </Dialog>

//             {/* Question Details */}
//             <Dialog open={!!selectedQuestion} onOpenChange={open => { if (!open) { setSelectedQuestion(null); setQuestionDetails(null); } }}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="capitalize text-lg">{selectedQuestion?.module_type} Details</DialogTitle>
//                         <p className="text-sm text-slate-500">{selectedQuestion?.questions?.substring(0, 120)}{(selectedQuestion?.questions?.length ?? 0) > 120 ? '…' : ''}</p>
//                     </DialogHeader>
//                     {questionLoading ? <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>
//                         : questionDetails ? (
//                             <div className="space-y-5 mt-4">
//                                 <div className="grid grid-cols-2 gap-3">
//                                     {[
//                                         ['Category', questionDetails.field?.fields || '—'],
//                                         ['Posted by', `@${questionDetails.user?.username || 'unknown'}`],
//                                         ['Visibility', questionDetails.visibility || '—'],
//                                         ['Location', questionDetails.location_scope || '—'],
//                                         ['Created', questionDetails.created_at ? new Date(questionDetails.created_at).toLocaleString() : '—'],
//                                         ['Voting Ends', questionDetails.end_date ? new Date(questionDetails.end_date).toLocaleString() : '—'],
//                                     ].map(([k, v]) => (
//                                         <div key={k} className="bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-100">
//                                             <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{k}</p>
//                                             <p className="text-sm font-semibold text-slate-800 capitalize">{v}</p>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
//                                     <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">Result</p>
//                                     <p className="text-sm font-bold text-emerald-800">{questionDetails.correct_answer || 'Not set / Open opinion'}</p>
//                                 </div>
//                                 {questionDetails.module_type === 'poll' && questionDetails.options?.length > 0 && (
//                                     <div>
//                                         <p className="text-sm font-semibold text-slate-700 mb-2">Poll Options</p>
//                                         <div className="space-y-1.5">{questionDetails.options.map((opt: string, i: number) => <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">{opt}</div>)}</div>
//                                     </div>
//                                 )}
//                                 {questionDetails.answers?.length > 0 && (
//                                     <div>
//                                         <p className="text-sm font-semibold text-slate-700 mb-2">Recent Answers ({questionDetails.answers_count || questionDetails.answers.length})</p>
//                                         <div className="space-y-2 max-h-48 overflow-y-auto">
//                                             {questionDetails.answers.map((ans: any) => (
//                                                 <div key={ans.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
//                                                     <div className="flex items-center gap-2 mb-1">
//                                                         <Avatar className="h-5 w-5"><AvatarImage src={ans.user?.avatar_url} /><AvatarFallback>{ans.user?.name?.[0] || '?'}</AvatarFallback></Avatar>
//                                                         <span className="text-xs font-medium">@{ans.user?.username || 'anon'}</span>
//                                                         <span className="text-[10px] text-slate-400">{new Date(ans.created_at).toLocaleString()}</span>
//                                                     </div>
//                                                     <p className="text-slate-600">Answered: <strong>{ans.answer}</strong></p>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : <div className="text-center py-8 text-slate-400 text-sm">Failed to load details</div>}
//                     <div className="flex justify-end mt-4"><Button variant="outline" onClick={() => setSelectedQuestion(null)}>Close</Button></div>
//                 </DialogContent>
//             </Dialog>

//             {/* Create Prediction / Poll */}
//             <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="text-lg">{createType === 'prediction' ? 'Create Prediction' : 'Create Poll'}</DialogTitle>
//                     </DialogHeader>
//                     {createType === 'prediction' ? (
//                         <div className="space-y-4 mt-4">
//                             {/* Category */}
//                             <div className="space-y-1.5">
//                                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category <span className="text-pink-500">*</span></Label>
//                                 <Select value={predSelectedFieldId?.toString() ?? ''} onValueChange={v => setPredSelectedFieldId(Number(v))}>
//                                     <SelectTrigger className="border-slate-200 bg-slate-50 focus:bg-white"><SelectValue placeholder="Select category" /></SelectTrigger>
//                                     <SelectContent className="bg-white border-slate-200">{fields.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>)}</SelectContent>
//                                 </Select>
//                             </div>

//                             {/* Prediction Statement */}
//                             <div className="space-y-1.5">
//                                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prediction Statement <span className="text-pink-500">*</span></Label>
//                                 <Textarea
//                                     placeholder="Write your bold prediction…"
//                                     value={predText}
//                                     onChange={e => setPredText(e.target.value)}
//                                     className="min-h-24 border-slate-200 bg-slate-50 focus:bg-white resize-none"
//                                     maxLength={500}
//                                 />
//                                 <p className="text-right text-[10px] text-slate-400">{predText.length}/500</p>
//                             </div>

//                             {/* Description */}
//                             <div className="space-y-1.5">
//                                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description <span className="font-normal normal-case text-slate-400">(optional)</span></Label>
//                                 <Textarea
//                                     placeholder="Provide context or evidence…"
//                                     value={predDesc}
//                                     onChange={e => setPredDesc(e.target.value)}
//                                     className="min-h-16 border-slate-200 bg-slate-50 focus:bg-white resize-none"
//                                 />
//                             </div>

//                             {/* Dates */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
//                                 <div className="space-y-1.5">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                                         Destined Date <span className="text-pink-500">*</span>
//                                     </Label>
//                                     <p className="text-[10px] text-slate-400">When does this prediction come true?</p>
//                                     <input
//                                         type="datetime-local"
//                                         value={predDestinedDate}
//                                         onChange={e => setPredDestinedDate(e.target.value)}
//                                         min={new Date().toISOString().slice(0, 16)}
//                                         className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-violet-300"
//                                     />
//                                 </div>
//                                 <div className="space-y-1.5">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                                         Validation Ends
//                                     </Label>
//                                     <p className="text-[10px] text-slate-400">Default: 7 days — when community can vote</p>
//                                     <input
//                                         type="datetime-local"
//                                         value={predVotingEndDateNew}
//                                         onChange={e => setPredVotingEndDateNew(e.target.value)}
//                                         min={new Date().toISOString().slice(0, 16)}
//                                         className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-violet-300"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Location scope + Visibility */}
//                             <div className="grid grid-cols-2 gap-3">
//                                 {/* <div className="space-y-1.5">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location Scope</Label>
//                                     <Select value={predLocationScope} onValueChange={v => setPredLocationScope(v as any)}>
//                                         <SelectTrigger className="border-slate-200 bg-slate-50"><SelectValue /></SelectTrigger>
//                                         <SelectContent className="bg-white border-slate-200">
//                                             <SelectItem value="global">🌍 Global</SelectItem>
//                                             <SelectItem value="country">🏳️ Country</SelectItem>
//                                             <SelectItem value="city">🏙️ City</SelectItem>
//                                         </SelectContent>
//                                     </Select>
//                                 </div> */}
//                                 <div className="space-y-1.5">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</Label>
//                                     <RadioGroup value={predVisibility} onValueChange={v => setPredVisibility(v as any)} className="flex gap-4 pt-2">
//                                         <div className="flex items-center gap-2"><RadioGroupItem value="public" id="adm-pp" /><Label htmlFor="adm-pp" className="text-sm cursor-pointer">🌐 Public</Label></div>
//                                         <div className="flex items-center gap-2"><RadioGroupItem value="private" id="adm-pr" /><Label htmlFor="adm-pr" className="text-sm cursor-pointer">🔒 Private</Label></div>
//                                     </RadioGroup>
//                                 </div>
//                             </div>

//                             {/* Group sharing (only visible when private) */}
//                             {predVisibility === 'private' && myGroups.length > 0 && (
//                                 <div className="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share with communities</Label>
//                                     <div className="flex flex-wrap gap-2 mt-2">
//                                         {myGroups.map(group => (
//                                             <button
//                                                 key={group.id}
//                                                 type="button"
//                                                 onClick={() => setPredSelectedGroupIds(prev =>
//                                                     prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
//                                                 )}
//                                                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${predSelectedGroupIds.includes(group.id)
//                                                         ? 'bg-violet-100 border-violet-400 text-violet-700'
//                                                         : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'
//                                                     }`}
//                                             >
//                                                 {predSelectedGroupIds.includes(group.id) && <CheckCircle size={11} />}
//                                                 {group.name}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
//                                 <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="border-slate-200">Cancel</Button>
//                                 <Button
//                                     onClick={handlePublishPrediction}
//                                     disabled={submitting || !predText.trim() || !predSelectedFieldId || !predDestinedDate}
//                                     className="bg-amber-600 hover:bg-amber-700 text-white"
//                                 >
//                                     {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</> : 'Publish Prediction'}
//                                 </Button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="space-y-4 mt-4">
//                             <div className="space-y-1.5"><Label>Category</Label>
//                                 <Select value={pollSelectedFieldId?.toString() ?? ''} onValueChange={v => setPollSelectedFieldId(Number(v))}>
//                                     <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
//                                     <SelectContent>{fields.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>)}</SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="space-y-1.5"><Label>Poll Question</Label>
//                                 <Textarea placeholder="What would you like to ask?" value={pollText} onChange={e => setPollText(e.target.value)} className="min-h-24" maxLength={500} />
//                             </div>
//                             <div className="space-y-2">
//                                 <div className="flex justify-between items-center">
//                                     <Label>Options (2–6)</Label>
//                                     <Button variant="outline" size="sm" onClick={() => { if (pollOptions.length < 6) setPollOptions([...pollOptions, '']); }} disabled={pollOptions.length >= 6}><Plus size={13} className="mr-1" />Add</Button>
//                                 </div>
//                                 {pollOptions.map((opt, i) => (
//                                     <div key={i} className="flex gap-2">
//                                         <Input value={opt} onChange={e => { const u = [...pollOptions]; u[i] = e.target.value; setPollOptions(u); }} placeholder={`Option ${i + 1}`} />
//                                         {pollOptions.length > 2 && <Button variant="ghost" size="icon" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}><X size={15} className="text-red-500" /></Button>}
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="space-y-1.5"><Label>Correct Answer (optional)</Label>
//                                 <Select value={pollCorrectAnswer} onValueChange={setPollCorrectAnswer}>
//                                     <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
//                                     <SelectContent>
//                                         {pollOptions.filter(o => o.trim()).map((opt, i) => <SelectItem key={i} value={opt.trim()}>{opt.trim()}</SelectItem>)}
//                                         <SelectItem value="none">None / No correct answer</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-1.5"><Label>Due Date</Label>
//                                     <Input type="datetime-local" value={pollVotingEndDate} onChange={e => setPollVotingEndDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
//                                 </div>
//                                 <div className="space-y-1.5"><Label>Visibility</Label>
//                                     <RadioGroup value={pollVisibility} onValueChange={v => setPollVisibility(v as any)} className="flex gap-4 pt-2">
//                                         <div className="flex items-center gap-2"><RadioGroupItem value="public" id="polp" /><Label htmlFor="polp">Public</Label></div>
//                                         <div className="flex items-center gap-2"><RadioGroupItem value="private" id="polr" /><Label htmlFor="polr">Private</Label></div>
//                                     </RadioGroup>
//                                 </div>
//                             </div>
//                             <div className="flex justify-end gap-3 pt-2">
//                                 <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
//                                 <Button onClick={handlePublishPoll} disabled={submitting} className="bg-pink-600 hover:bg-pink-700">{submitting ? 'Publishing…' : 'Publish Poll'}</Button>
//                             </div>
//                         </div>
//                     )}
//                 </DialogContent>
//             </Dialog>

//             {/* Confirm Block / Unblock */}
//             <Dialog open={!!confirmAction} onOpenChange={open => { if (!open && !confirmLoading) setConfirmAction(null); }}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle className="flex items-center gap-2">
//                             {confirmAction?.currentBlocked
//                                 ? <><CheckCircle size={18} className="text-green-600" /> Unblock</>
//                                 : <><Ban size={18} className="text-red-600" /> Block</>}
//                         </DialogTitle>
//                     </DialogHeader>
//                     <div className="mt-2 space-y-3">
//                         <p className="text-sm text-slate-600">
//                             {confirmAction?.currentBlocked
//                                 ? <>Unblock <strong className="text-slate-900">{confirmAction.name}</strong>? They'll regain full platform access.</>
//                                 : <>Block <strong className="text-slate-900">{confirmAction?.name}</strong>?</>}
//                         </p>
//                         {!confirmAction?.currentBlocked && (
//                             <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1">
//                                 <p className="font-semibold">This will prevent the user from:</p>
//                                 <ul className="list-disc list-inside space-y-0.5 ml-1">
//                                     <li>Submitting new predictions</li>
//                                     <li>Validating any predictions</li>
//                                     <li>All platform interactions</li>
//                                 </ul>
//                             </div>
//                         )}
//                         {confirmAction?.currentBlocked && (
//                             <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
//                                 ✓ User will be restored to <strong>Active</strong> status.
//                             </div>
//                         )}
//                     </div>
//                     <div className="flex justify-end gap-3 mt-5">
//                         <Button variant="outline" size="sm" disabled={confirmLoading} onClick={() => setConfirmAction(null)}>Cancel</Button>
//                         <Button size="sm" disabled={confirmLoading}
//                             className={confirmAction?.currentBlocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
//                             onClick={async () => {
//                                 if (!confirmAction) return;
//                                 setConfirmLoading(true);
//                                 try {
//                                     if (confirmAction.type === 'user') await handleToggleUserBlock(confirmAction.id);
//                                     else await handleToggleGroupBlock(confirmAction.id);
//                                 } finally { setConfirmLoading(false); setConfirmAction(null); }
//                             }}>
//                             {confirmLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</> : confirmAction?.currentBlocked ? 'Yes, Unblock' : 'Yes, Block'}
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }





























import { useState, useEffect } from 'react';
import { Users, Layers, TrendingUp, Trophy, Home, Bell, UserCircle, LogOut, Menu, X } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { getAuth } from '@/util/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store/hooks';
import { logoutUser } from '@/app/modules/auth/authSlice';

import OverviewTab from './admin/OverviewTab';
import UsersTab from './admin/UsersTab'; 
import GroupsTab from './admin/GroupsTab';
import PredictionsTab from './admin/PredictionsTab';
import LeaderboardTab from './admin/LeaderboardTab';
import NotificationsTab from './admin/NotificationsTab';
// import ProfileTab from './admin/ProfileTab';

interface User { id: number; name: string; email: string; username: string; role: string; is_blocked: boolean; avatar_url?: string; }

export function AdminDashboardScreen() {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'groups' | 'predictions' | 'leaderboard' | 'notifications' | 'profile'>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState<User | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        loadAdminProfile();
    }, []);

    const loadAdminProfile = async () => {
        try {
            const res = await getAuth('/api/user');
            setAdminProfile(res);
        } catch {}
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            toast.success('Logged out successfully');
            navigate('/auth', { replace: true });
        } catch {
            navigate('/auth', { replace: true });
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'groups', label: 'Communities', icon: Layers },
        { id: 'predictions', label: 'Predictions', icon: TrendingUp },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ] as const;

    const pageTitle: Record<string, string> = {
        overview: 'Dashboard Overview',
        users: 'User Management',
        groups: 'Community Management',
        predictions: 'Predictions',
        leaderboard: 'Leaderboard',
        notifications: 'Notifications',
        profile: 'My Profile',
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Sidebar */}
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col bg-[#0f172a] border-r border-white/[0.05] transition-transform md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <Trophy size={15} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">iSaidSo</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Admin Portal</p>
                    </div>
                    <button className="md:hidden text-slate-500 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={15} /></button>
                </div>

                <nav className="flex-1 px-2.5 py-3 space-y-0.5">
                    <p className="px-2.5 pb-1 pt-0.5 text-[9px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
                    {navItems.map(item => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all text-left ${active ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'}`}
                            >
                                <item.icon size={15} className={active ? 'text-violet-400' : 'text-slate-600'} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-slate-200 h-14 px-5 flex items-center justify-between gap-3 flex-shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900">{pageTitle[activeTab]}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`relative p-2 rounded-lg transition-all ${activeTab === 'notifications' ? 'bg-violet-50 text-violet-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-pink-500 text-[9px] text-white">{unreadCount}</span>}
                        </button>

                        <button onClick={handleLogout} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                            <LogOut size={18} />
                        </button>

                        {adminProfile && (
                            <div onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 pl-3 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1 rounded-lg ${activeTab === 'profile' ? 'bg-slate-50' : ''}`}>
                                <Avatar className="h-7 w-7 border-2 border-violet-100">
                                    <AvatarImage src={adminProfile.avatar_url} />
                                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                                        {(adminProfile.name?.[0] ?? 'A').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-slate-800">{adminProfile.name}</p>
                                    <p className="text-[10px] text-slate-400 capitalize">{adminProfile.role?.replace('_', ' ')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50/70 p-5">
                    <div className="max-w-7xl mx-auto">
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'users' && <UsersTab />}
                        {activeTab === 'groups' && <GroupsTab />}
                        {activeTab === 'predictions' && <PredictionsTab />}
                        {activeTab === 'leaderboard' && <LeaderboardTab />}
                        {activeTab === 'notifications' && <NotificationsTab setUnreadCount={setUnreadCount} />}
                        {activeTab === 'profile' && <ProfileTab />}
                    </div>
                </main>
            </div>
        </div>
    );
}
