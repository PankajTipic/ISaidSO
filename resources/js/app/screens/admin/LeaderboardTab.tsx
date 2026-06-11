// import { useState, useEffect } from 'react';
// import { Trophy, Loader2 } from 'lucide-react';
// import { getAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface LeaderboardEntry {
//     user: { id: number; name: string; username: string; avatar_url?: string };
//     score: number; accuracy: number; correct_predictions: number; total_predictions: number;
// }

// export default function LeaderboardTab() {
//     const [leaderboard, setLeaderboard] = useState<any>(null);
//     const [loading, setLoading] = useState(false);

//     const loadLeaderboard = async () => {
//         setLoading(true);
//         try {
//             const res = await getAuth('/api/admin/leaderboard');
//             setLeaderboard(res);
//         } catch {
//             toast.error('Failed to load leaderboard');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { loadLeaderboard(); }, []);

//     return (
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//             <div className="px-5 py-4 border-b">
//                 <h2 className="font-semibold text-slate-900">Leaderboard</h2>
//                 <p className="text-xs text-slate-400">Top users by prediction accuracy</p>
//             </div>

//             <div className="p-5">
//                 {loading ? (
//                     <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-slate-50 border-y">
//                                     <th className="px-4 py-3 text-left">#</th>
//                                     <th className="px-4 py-3 text-left">User</th>
//                                     <th className="px-4 py-3 text-right">Score</th>
//                                     <th className="px-4 py-3 text-right">Accuracy</th>
//                                     <th className="px-4 py-3 text-right">Correct / Total</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y">
//                                 {leaderboard?.data?.map((entry: LeaderboardEntry, index: number) => {
//                                     const rank = index + 1;
//                                     return (
//                                         <tr key={entry.user?.id} className="hover:bg-slate-50">
//                                             <td className="px-4 py-3.5">
//                                                 <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold ${rank === 1 ? 'bg-amber-100 text-amber-700' : rank === 2 ? 'bg-slate-200' : rank === 3 ? 'bg-orange-100' : 'bg-slate-100'}`}>
//                                                     {rank}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3.5">
//                                                 <div className="flex items-center gap-3">
//                                                     {entry.user?.avatar_url && <img src={entry.user?.avatar_url} className="w-8 h-8 rounded-full" />}
//                                                     <div>
//                                                         <p className="font-medium">{entry.user?.name}</p>
//                                                         <p className="text-xs text-slate-400">@{entry.user?.username}</p>
//                                                     </div>
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-3.5 text-right font-bold">{entry.score}</td>
//                                             <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">{entry.accuracy}%</td>
//                                             <td className="px-4 py-3.5 text-right text-slate-600">{entry.correct_predictions} / {entry.total_predictions}</td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }










import { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { getAuth } from '@/util/api';
import { toast } from 'sonner';

interface LeaderboardEntry {
    user: { id: number; name: string; username: string; avatar_url?: string };
    score: number; accuracy: number; correct_predictions: number; total_predictions: number;
}

export default function LeaderboardTab() {
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await getAuth('/api/admin/leaderboard');
            setLeaderboard(res);
        } catch {
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLeaderboard(); }, []);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Header — violet tint */}
            <div className="px-5 py-4 border-b border-violet-100 bg-violet-50 rounded-t-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-violet-900">Leaderboard</h2>
                        <p className="text-xs text-violet-400">Top users by prediction accuracy</p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-violet-50 border-b border-violet-100">
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Accuracy</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Correct / Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaderboard?.data?.map((entry: LeaderboardEntry, index: number) => {
                                    const rank = index + 1;
                                    return (
                                        <tr 
                                            key={entry.user?.id} 
                                            className={`transition-colors hover:bg-violet-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                        >
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold 
                                                    ${rank === 1 ? 'bg-amber-100 text-amber-700' : 
                                                      rank === 2 ? 'bg-slate-200 text-slate-700' : 
                                                      rank === 3 ? 'bg-orange-100 text-orange-700' : 
                                                      'bg-violet-100 text-violet-700'}`}>
                                                    {rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {entry.user?.avatar_url ? (
                                                        <img 
                                                            src={entry.user.avatar_url} 
                                                            alt={entry.user.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-violet-100" 
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-medium">
                                                            {entry.user?.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-900">{entry.user?.name}</p>
                                                        <p className="text-xs text-slate-400">@{entry.user?.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-bold text-slate-700">{entry.score}</td>
                                            <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">
                                                {entry.accuracy}%
                                            </td>
                                            <td className="px-4 py-3.5 text-right text-slate-600">
                                                {entry.correct_predictions} / {entry.total_predictions}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!leaderboard?.data || leaderboard.data.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                                            <Trophy size={28} className="mx-auto mb-2 opacity-20" />
                                            No leaderboard data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}