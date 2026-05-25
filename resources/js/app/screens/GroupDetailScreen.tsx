import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
    Loader2, MessageSquare, ChevronRight, Gavel, BarChart3, Clock,
    Users, Lock, Globe, ArrowLeft, LogOut, UserPlus, X, Shield,
    Calendar, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getAuth, postAuth, deleteAuth } from '@/util/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface GroupMember {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
}

interface GroupQuestion {
    id: number;
    text: string;
    module_type: 'prediction' | 'poll';
    status: string;
    end_date: string;
    user: {
        username: string;
        name: string;
        avatar: string | null;
    };
    field: {
        fields: string;
    };
    yes_count?: number;
    no_count?: number;
    answers_count?: number;
}

interface Group {
    id: number;
    name: string;
    description: string;
    memberCount: number;
    isPrivate: boolean;
    isMember: boolean;
    isOwner: boolean;
    pendingRequest?: boolean;
    createdAt: string;
    members?: GroupMember[];
}

const cardPalettes = [
    { border: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
    { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
    { border: '#10b981', bg: 'rgba(16,185,129,0.06)' },
    { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
    { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
    { border: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
];

const getPalette = (index: number) => cardPalettes[index % cardPalettes.length];

export function GroupDetailScreen() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('questions');
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [questions, setQuestions] = useState<GroupQuestion[]>([]);
    const [joinRequests, setJoinRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const [groupRes, questionsRes] = await Promise.all([
                getAuth(`/api/groups/${id}`),
                getAuth(`/api/groups/${id}/questions`)
            ]);
            setGroup(groupRes);
            setQuestions(questionsRes.data || []);

            if (groupRes.isOwner) {
                fetchJoinRequests();
            }
        } catch (error: any) {
            console.error('Failed to fetch group details', error);
            toast.error('Failed to load group details');
            if (error.status === 403 || error.status === 404) {
                navigate('/groups');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchJoinRequests = async () => {
        try {
            setRequestsLoading(true);
            const res = await getAuth(`/api/groups/${id}/requests`);
            console.log('Join Requests fetched:', res);
            setJoinRequests(res || []);
        } catch (error) {
            console.error('Failed to fetch join requests', error);
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleJoinRequest = async (requestId: number, action: 'accept' | 'reject') => {
        try {
            await postAuth(`/api/groups/${id}/requests/${requestId}`, { action });
            toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
            fetchJoinRequests();
            if (action === 'accept') fetchGroupDetails();
        } catch (error) {
            toast.error('Failed to handle request');
        }
    };

    const handleAddMember = async () => {
        if (!newMemberUsername.trim()) return;
        try {
            setAddingMember(true);
            await postAuth(`/api/groups/${id}/members/add`, { username: newMemberUsername });
            toast.success('Member added successfully');
            setIsAddMemberDialogOpen(false);
            setNewMemberUsername('');
            fetchGroupDetails();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    // const handleRemoveMember = async (userId: number) => {
    //     if (!window.confirm('Are you sure you want to remove this member?')) return;
    //     try {
    //         await deleteAuth(`/api/groups/${id}/members/${userId}`);
    //         toast.success('Member removed');
    //         fetchGroupDetails();
    //     } catch (error) {
    //         toast.error('Failed to remove member');
    //     }
    // };


    const handleRemoveMember = (userId: number) => {
        setSelectedUserId(userId);
        setRemoveMemberOpen(true);
    };

    const confirmRemoveMember = async () => {
        if (!selectedUserId) return;

        try {
            await deleteAuth(`/api/groups/${id}/members/${selectedUserId}`);

            toast.success('Member removed');

            fetchGroupDetails();

            setRemoveMemberOpen(false);
            setSelectedUserId(null);

        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const handleLeaveGroup = async () => {
        if (!group || leaving) return;
        setLeaving(true);
        try {
            await postAuth(`/api/groups/${group.id}/leave`);
            toast.success(`You have left ${group.name}`);
            navigate('/groups');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to leave group');
        } finally {
            setLeaving(false);
        }
    };

    useEffect(() => {
        if (id) fetchGroupDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB]">
                <TopNav />
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-10 h-10 text-[#a855f7] animate-spin" />
                    <p className="text-slate-500 font-medium text-sm">Loading group...</p>
                </div>
                <MobileNav />
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-24 md:pb-6">
            <TopNav />

            <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
                {/* Navigation Header */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <button
                        onClick={() => navigate('/groups')}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Group Detail</h2>
                        <button onClick={() => navigate('/groups')} className="text-base font-bold text-slate-900 hover:text-[#a855f7] transition-colors leading-none">
                            Back to Groups
                        </button>
                    </div>
                </div>

                {/* Main Header Card */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] -mr-2 -mt-2 pointer-events-none">
                        <Users size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mr-1">{group.name}</h1>
                                        {group.isPrivate && (
                                            <div className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded-full border border-red-100 flex items-center gap-1 uppercase tracking-wider">
                                                <Lock size={9} /> Private
                                            </div>
                                        )}
                                        {group.isOwner && (
                                            <div className="px-2 py-0.5 bg-violet-50 text-[#a855f7] text-[8px] font-black rounded-full border border-violet-100 flex items-center gap-1 uppercase tracking-wider">
                                                <Shield size={9} /> Owner
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-500 text-xs md:text-sm max-w-2xl leading-tight font-medium">
                                        {group.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[9px] font-bold">
                                        <Users size={12} className="text-[#a855f7]" />
                                        <span>{group.memberCount} Members</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[9px] font-bold">
                                        <Calendar size={12} className="text-[#a855f7]" />
                                        <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col gap-2">
                                {group.isOwner && (
                                    <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="rounded-full h-9 md:h-10 px-4 shadow-md bg-[#a855f7] hover:bg-[#9333ea] font-bold text-[10px] md:text-xs">
                                                <UserPlus size={14} className="mr-1.5" />
                                                Add Member
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl border-slate-100 shadow-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-black">Add Direct Member</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username" className="font-bold text-slate-600 text-sm">Username</Label>
                                                    <Input
                                                        id="username"
                                                        placeholder="Enter exact username"
                                                        value={newMemberUsername}
                                                        onChange={(e) => setNewMemberUsername(e.target.value)}
                                                        className="h-11 rounded-xl border-slate-200 focus:ring-[#a855f7]"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleAddMember}
                                                    disabled={addingMember || !newMemberUsername.trim()}
                                                    className="w-full h-11 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] font-bold"
                                                >
                                                    {addingMember ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                                                    Add Member
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {group.isMember && !group.isOwner && (
                                    <Button
                                        variant="outline"
                                        disabled={leaving}
                                        onClick={handleLeaveGroup}
                                        className="rounded-full h-9 md:h-10 px-4 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-[10px] md:text-xs transition-all"
                                    >
                                        {leaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <LogOut size={14} className="mr-1.5" />
                                                Leave
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-3 md:space-y-4">
                    <TabsList className="flex flex-wrap gap-2 bg-transparent p-0 h-auto w-full justify-start border-0 shadow-none">
                        <TabsTrigger
                            value="questions"
                            className="
                                px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border
                                bg-white dark:bg-white/5
                                border-slate-200 dark:border-white/10
                                text-slate-600 dark:text-slate-400
                                hover:border-[#a855f7]/40
                                data-[state=active]:bg-[#a855f7]
                                data-[state=active]:text-white
                                data-[state=active]:border-[#a855f7]
                                data-[state=active]:shadow-sm 
                                h-8
                            "
                        >
                            Questions
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="
                                px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border
                                bg-white dark:bg-white/5
                                border-slate-200 dark:border-white/10
                                text-slate-600 dark:text-slate-400
                                hover:border-[#a855f7]/40
                                data-[state=active]:bg-[#a855f7]
                                data-[state=active]:text-white
                                data-[state=active]:border-[#a855f7]
                                data-[state=active]:shadow-sm
                                h-8
                            "
                        >
                            Members
                        </TabsTrigger>
                        {group.isOwner && (
                            <TabsTrigger
                                value="requests"
                                className="
                                    px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border
                                    bg-white dark:bg-white/5
                                    border-slate-200 dark:border-white/10
                                    text-slate-600 dark:text-slate-400
                                    hover:border-[#a855f7]/40
                                    data-[state=active]:bg-[#a855f7]
                                    data-[state=active]:text-white
                                    data-[state=active]:border-[#a855f7]
                                    data-[state=active]:shadow-sm
                                    relative
                                    h-8
                                    
                                "
                            >
                                Requests
                                {(Array.isArray(joinRequests) ? joinRequests.length : (joinRequests as any)?.data?.length) > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                                        {Array.isArray(joinRequests) ? joinRequests.length : (joinRequests as any)?.data?.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Questions Tab Content */}
                    <TabsContent value="questions" className="mt-0 focus:outline-none">
                        <AnimatePresence mode="wait">
                            {questions.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                                >
                                    {questions.map((q, idx) => {
                                        const pal = getPalette(idx);
                                        return (
                                            <motion.div
                                                key={q.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => navigate(q.module_type === 'prediction' ? `/prediction/${q.id}` : `/poll/${q.id}`)}
                                                className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl hover:shadow-violet-500/5 transition-all group cursor-pointer relative overflow-hidden"
                                                style={{
                                                    borderLeft: `4px solid ${pal.border}`,
                                                    background: `linear-gradient(to right, ${pal.bg}, transparent)`
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${pal.border}20`, color: pal.border }}>
                                                            {q.module_type === 'prediction' ? <Gavel size={18} /> : <BarChart3 size={18} />}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {q.field.fields}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <Clock size={12} className="text-violet-400" />
                                                        Ends {new Date(q.end_date).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-lg mb-4 leading-tight text-slate-800 group-hover:text-[#a855f7] transition-colors line-clamp-2 min-h-[3rem]">
                                                    {q.text}
                                                </h4>

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                                                            <AvatarImage src={q.user.avatar || undefined} />
                                                            <AvatarFallback className="text-[10px] font-black bg-violet-50 text-[#a855f7]">
                                                                {q.user.username[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-slate-800 leading-none">@{q.user.username}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Creator</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[9px] font-black uppercase tracking-tight text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                            {q.module_type === 'prediction' ? (
                                                                `${(q.yes_count || 0) + (q.no_count || 0)} Preds`
                                                            ) : (
                                                                `${q.answers_count || 0} Votes`
                                                            )}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#a855f7] group-hover:text-white transition-all shadow-sm">
                                                            <ChevronRight size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm"
                                >
                                    <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare size={44} className="text-violet-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-800 mb-2">No questions yet</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto px-4 font-medium mb-10">
                                        This group doesn't have any active predictions or polls yet.
                                    </p>
                                    <Button
                                        className="rounded-2xl h-14 px-10 bg-violet-600 shadow-xl shadow-violet-200 font-bold hover:scale-[1.05] transition-transform"
                                        onClick={() => navigate('/create')}
                                    >
                                        Create New Question
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    {/* Members Tab Content */}
                    <TabsContent value="members" className="mt-0 focus:outline-none">
                        <AnimatePresence mode="wait">
                            {group.members && group.members.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {group.members.map((member, idx) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 transition-all group"
                                        >
                                            <Avatar className="w-14 h-14 border-4 border-slate-50 group-hover:border-violet-100 transition-all shadow-sm">
                                                <AvatarImage src={member.avatar || undefined} alt={member.username} />
                                                <AvatarFallback className="bg-violet-50 text-violet-600 font-black text-lg">
                                                    {member.name?.[0] || member.username?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-800 truncate group-hover:text-violet-600 transition-colors">
                                                    {member.name || member.username}
                                                </p>
                                                <p className="text-xs text-slate-400 font-bold">@{member.username}</p>
                                            </div>
                                            {group.isOwner && member.id !== group.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <X size={18} />
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                    <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-bold">No members found</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    {/* Join Requests Tab Content */}
                    <TabsContent value="requests" className="mt-0 focus:outline-none">
                        <AnimatePresence mode="wait">
                            {(Array.isArray(joinRequests) ? joinRequests : (joinRequests as any)?.data || []).length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                >
                                    {(Array.isArray(joinRequests) ? joinRequests : (joinRequests as any)?.data || []).map((req: any, idx: number) => (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="w-10 h-10 border-2 border-violet-50">
                                                    <AvatarImage src={req.user.avatar || undefined} />
                                                    <AvatarFallback className="bg-violet-100 text-[#a855f7] font-black text-sm">
                                                        {req.user.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 truncate text-sm">@{req.user.username}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleJoinRequest(req.id, 'accept')}
                                                    className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black px-4 shadow-lg shadow-emerald-200"
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleJoinRequest(req.id, 'reject')}
                                                    className="h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-bold px-3"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <UserPlus size={36} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 mb-1">No pending requests</h4>
                                    <p className="text-slate-400 text-sm font-medium">When users request to join, they'll appear here.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>
            </div>




            <AnimatePresence>
                {removeMemberOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setRemoveMemberOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-foreground">
                                    Remove Member
                                </h2>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => setRemoveMemberOpen(false)}
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            <p className="text-muted-foreground text-sm md:text-base mb-8">
                                Are you sure you want to remove this member from the group?
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11 rounded-xl"
                                    onClick={() => setRemoveMemberOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={confirmRemoveMember}
                                    className="flex-1 h-11 rounded-xl font-bold"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            <MobileNav />
        </div>
    );
}