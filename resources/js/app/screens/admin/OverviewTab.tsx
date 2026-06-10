// import { useState, useEffect } from 'react';
// import { Users, TrendingUp, PieChart, Layers, Trophy, Loader2, CheckCircle } from 'lucide-react';
// import { getAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface Stats { users: number; predictions: number; polls: number; groups: number; }

// export default function OverviewTab() {
//     const [stats, setStats] = useState<Stats | null>(null);
//     const [mostActiveData, setMostActiveData] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [mostActiveLoading, setMostActiveLoading] = useState(false);

//     useEffect(() => {
//         loadStats();
//         loadMostActiveUsers();
//     }, []);

//     const loadStats = async () => {
//         try {
//             const res = await getAuth('/api/admin/stats');
//             setStats(res);
//         } catch {
//             toast.error('Failed to load statistics');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadMostActiveUsers = async () => {
//         setMostActiveLoading(true);
//         try {
//             const res = await getAuth('/api/admin/mostActivated');
//             setMostActiveData(res);
//         } catch {
//             toast.error('Failed to load most active users');
//         } finally {
//             setMostActiveLoading(false);
//         }
//     };

//     return (
//         <>
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                 {[
//                     { label: 'Total Users', val: stats?.users, icon: Users, color: 'violet' },
//                     { label: 'Predictions', val: stats?.predictions, icon: TrendingUp, color: 'amber' },
//                     { label: 'Active Polls', val: stats?.polls, icon: PieChart, color: 'pink' },
//                     { label: 'Communities', val: stats?.groups, icon: Layers, color: 'emerald' },
//                 ].map((card, i) => (
//                     <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
//                         <div className={`inline-flex p-2.5 rounded-xl bg-${card.color}-50 text-${card.color}-700 mb-3`}>
//                             <card.icon size={18} />
//                         </div>
//                         <p className="text-2xl font-bold text-slate-900">
//                             {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" /> : (card.val ?? 0)}
//                         </p>
//                         <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Most Active Users */}
//             <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//                 <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
//                     <Trophy size={16} /> Most Active Users
//                 </h2>
//                 {mostActiveLoading ? (
//                     <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
//                 ) : mostActiveData ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="border border-slate-100 rounded-xl p-4">
//                             <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Questions Created</p>
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">Q</div>
//                                 <div>
//                                     <p className="font-semibold text-slate-900">{mostActiveData.most_question_creator?.name || '—'}</p>
//                                     <p className="text-sm text-slate-500">{mostActiveData.most_question_creator?.questions_count || 0} questions</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="border border-slate-100 rounded-xl p-4">
//                             <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Answers Submitted</p>
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">A</div>
//                                 <div>
//                                     <p className="font-semibold text-slate-900">{mostActiveData.most_active_answerer?.name || '—'}</p>
//                                     <p className="text-sm text-slate-500">{mostActiveData.most_active_answerer?.answers_count || 0} answers</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ) : <p className="text-slate-400 text-center py-8">No data available</p>}
//             </div>
//         </>
//     );
// }





import { useState, useEffect } from 'react';
import { 
    Users, TrendingUp, PieChart, Layers, Trophy, 
    Loader2, CheckCircle, Home 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { getAuth } from '@/util/api';
import { toast } from 'sonner';

interface Stats { 
    users: number; 
    predictions: number; 
    polls: number; 
    groups: number; 
}

interface OverviewTabProps {
    onTabChange?: (tab: string) => void;  // For quick actions navigation
}

export default function OverviewTab({ onTabChange }: OverviewTabProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [mostActiveData, setMostActiveData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mostActiveLoading, setMostActiveLoading] = useState(false);

    useEffect(() => {
        loadStats();
        loadMostActiveUsers();
    }, []);

    const loadStats = async () => {
        try {
            const res = await getAuth('/api/admin/stats');
            setStats(res);
        } catch {
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const loadMostActiveUsers = async () => {
        setMostActiveLoading(true);
        try {
            const res = await getAuth('/api/admin/mostActivated');
            setMostActiveData(res);
        } catch {
            toast.error('Failed to load most active users');
        } finally {
            setMostActiveLoading(false);
        }
    };

    const handleQuickAction = (tab: string) => {
        onTabChange?.(tab);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { 
                        label: 'Total Users', 
                        val: stats?.users, 
                        icon: Users, 
                        light: 'bg-violet-50 text-violet-700' 
                    },
                    { 
                        label: 'Predictions', 
                        val: stats?.predictions, 
                        icon: TrendingUp, 
                        light: 'bg-amber-50 text-amber-700' 
                    },
                    { 
                        label: 'Active Polls', 
                        val: stats?.polls, 
                        icon: PieChart, 
                        light: 'bg-pink-50 text-pink-700' 
                    },
                    { 
                        label: 'Communities', 
                        val: stats?.groups, 
                        icon: Layers, 
                        light: 'bg-emerald-50 text-emerald-700' 
                    },
                ].map((card, i) => (
                    <div 
                        key={i} 
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`inline-flex p-2.5 rounded-xl ${card.light} mb-3`}>
                            <card.icon size={18} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                            ) : (
                                card.val ?? 0
                            )}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { 
                            label: 'Manage Users', 
                            tab: 'users', 
                            icon: Users, 
                            color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100' 
                        },
                        { 
                            label: 'Communities', 
                            tab: 'groups', 
                            icon: Layers, 
                            color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100' 
                        },
                        { 
                            label: 'Predictions', 
                            tab: 'predictions', 
                            icon: TrendingUp, 
                            color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100' 
                        },
                        { 
                            label: 'Leaderboard', 
                            tab: 'leaderboard', 
                            icon: Trophy, 
                            color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' 
                        },
                    ].map((qa) => (
                        <button 
                            key={qa.tab} 
                            onClick={() => handleQuickAction(qa.tab)}
                            className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-colors ${qa.color}`}
                        >
                            <qa.icon size={16} />
                            {qa.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-emerald-900">All Systems Operational</p>
                        <p className="text-sm text-emerald-700">All core services are running normally.</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Trophy size={16} /> Most Active Users
                </h2>

                {mostActiveLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                    </div>
                ) : mostActiveData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Most Question Creator */}
                        <div className="border border-slate-100 rounded-xl p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Questions Created</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">
                                    Q
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {mostActiveData.most_question_creator?.name || '—'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {mostActiveData.most_question_creator?.questions_count || 0} questions
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Most Active Answerer */}
                        <div className="border border-slate-100 rounded-xl p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Most Answers Submitted</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                                    A
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {mostActiveData.most_active_answerer?.name || '—'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {mostActiveData.most_active_answerer?.answers_count || 0} answers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">No data available</p>
                )}
            </div>
        </div>
    );
}