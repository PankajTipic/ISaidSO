import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Loader2, MessageSquare, ChevronRight, Gavel, BarChart3, Clock, Users, Lock, Globe, ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getAuth, postAuth } from '@/util/api';

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
    createdAt: string;
    members?: GroupMember[];
}

export function GroupDetailScreen() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('questions');
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [questions, setQuestions] = useState<GroupQuestion[]>([]);

    const [leaving, setLeaving] = useState(false);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const [groupRes, questionsRes] = await Promise.all([
                getAuth(`/api/groups/${id}`),
                getAuth(`/api/groups/${id}/questions`)
            ]);
            setGroup(groupRes);
            setQuestions(questionsRes.data || []);
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

    const handleLeaveGroup = async () => {
    if (!group || leaving) return;

    setLeaving(true);

    try {
        await postAuth(`/api/groups/${group.id}/leave`);
        toast.success(`You have left ${group.name}`);
        navigate('/groups');
    } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to leave group';
        toast.error(msg);
        console.error('Leave group failed:', err);
    } finally {
        setLeaving(false);
    }
};

    useEffect(() => {
        if (id) fetchGroupDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <TopNav />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading group...</p>
                </div>
                <MobileNav />
            </div>
        );
    }

    if (!group) return null;

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-6">
            <TopNav />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/groups')}
                    className="mb-6 hover:bg-muted -ml-2 text-muted-foreground"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Groups
                </Button>

                {/* Group Header */}
                <div className="glass-card rounded-3xl p-6 md:p-10 border border-border mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Users size={120} />
                    </div>

                    <div className="relative z-10">
                        {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{group.name}</h1>
                                    {group.isPrivate ? (
                                        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                            <Lock size={18} />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                            <Globe size={18} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                                    {group.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium pt-2">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                        <Users size={16} />
                                        <span>{group.memberCount} Members</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        Created {new Date(group.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="space-y-3">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{group.name}</h1>
            {group.isPrivate ? (
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    <Lock size={18} />
                </div>
            ) : (
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    <Globe size={18} />
                </div>
            )}
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            {group.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Users size={16} />
                <span>{group.memberCount} Members</span>
            </div>
            <div className="text-muted-foreground">
                Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
        </div>
    </div>

    {group.isMember && (
        <Button
            variant="destructive"
            size="lg"
            disabled={leaving}
            onClick={handleLeaveGroup}
            className="gap-2 min-w-[140px]"
        >
            {leaving ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Leaving...
                </>
            ) : (
                <>
                    <LogOut size={18} />
                    Leave Group
                </>
            )}
        </Button>
    )}
</div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
                    <TabsList className="bg-muted/50 p-1 h-auto inline-flex overflow-x-auto max-w-full no-scrollbar">
                        <TabsTrigger value="questions" className="px-8 py-2.5 rounded-md min-w-[120px]">
                            Questions
                        </TabsTrigger>
                        <TabsTrigger value="members" className="px-8 py-2.5 rounded-md min-w-[120px]">
                            Members
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-0 focus:outline-none">
                        {questions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {questions.map((q) => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => navigate(q.module_type === 'prediction' ? `/prediction/${q.id}` : `/poll/${q.id}`)}
                                        className="glass-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group cursor-pointer shadow-lg hover:shadow-primary/5"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${q.module_type === 'prediction' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {q.module_type === 'prediction' ? <Gavel size={16} /> : <BarChart3 size={16} />}
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                                                    {q.field.fields}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted rounded-md self-start">
                                                <Clock size={14} />
                                                Ends {new Date(q.end_date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-lg mb-6 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {q.text}
                                        </h4>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="w-8 h-8 border border-border">
                                                    <AvatarImage src={q.user.avatar || undefined} />
                                                    <AvatarFallback className="text-[10px] font-bold bg-primary/20 text-primary">
                                                        {q.user.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">@{q.user.username}</span>
                                                    <span className="text-[10px] text-muted-foreground">Creator</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground bg-muted px-2 py-1 rounded">
                                                    {q.module_type === 'prediction' ? (
                                                        `${(q.yes_count || 0) + (q.no_count || 0)} Predictions`
                                                    ) : (
                                                        `${q.answers_count || 0} Votes`
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/30 rounded-3xl border border-dashed border-border shadow-inner">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={40} className="text-muted-foreground/40" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">No active questions</h4>
                                <p className="text-muted-foreground max-w-md mx-auto px-4">
                                    Shared predictions and polls will appear here. Create one and share it with this group!
                                </p>
                                <Button
                                    className="mt-8 rounded-full px-8"
                                    variant="outline"
                                    onClick={() => navigate('/create')}
                                >
                                    Create New Question
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="members" className="mt-0 focus:outline-none">
                        {group.members && group.members.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.members.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-muted border border-border hover:border-primary/20 transition-all shadow-md group"
                                    >
                                        <Avatar className="w-12 h-12 border-2 border-border group-hover:border-primary/20 transition-all">
                                            <AvatarImage src={member.avatar || undefined} alt={member.username} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {member.name?.[0] || member.username?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                {member.name || member.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate font-medium">@{member.username}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-muted-foreground">No members found</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <MobileNav />
        </div>
    );
}
