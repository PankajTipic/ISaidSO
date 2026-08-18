// import { useState, useEffect } from 'react';
// import {
//     TrendingUp, Search, X, Plus, Loader2, Archive, ArchiveRestore,
//     CheckCircle, Ban, AlertCircle
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

// import { getAuth, deleteAuth, postAuth } from '@/util/api';
// import { toast } from 'sonner';

// interface QuestionItem {
//     id: number; questions: string; module_type: 'prediction' | 'poll';
//     user?: { name: string; username: string };
//     field?: { id: number; fields: string };
//     status?: string; location_scope?: string; end_date?: string; voting_end_date?: string; created_at?: string;
//     is_archived?: boolean;
// }

// interface PaginatedData<T> { data: T[]; current_page: number; last_page: number; total: number; }

// interface Group {
//     id: number; name: string; description?: string; is_private: boolean;
//     user: { id: number; name: string; username: string } | null;
//     members_count: number; is_blocked: boolean; is_member?: boolean;
// }

// export default function PredictionsTab() {
//     const [predictions, setPredictions] = useState<PaginatedData<QuestionItem> | null>(null);
//     const [fields, setFields] = useState<{ id: number; fields: string }[]>([]);
//     const [myGroups, setMyGroups] = useState<Group[]>([]);

//     // Loading
//     const [loading, setLoading] = useState(false);
//     const [submitting, setSubmitting] = useState(false);

//     // Pagination
//     const [currentPage, setCurrentPage] = useState(1);

//     // Filters
//     const [predictionSearch, setPredictionSearch] = useState('');
//     const [predictionUserSearch, setPredictionUserSearch] = useState('');
//     const [predictionCategoryFilter, setPredictionCategoryFilter] = useState<string>('all');
//     const [predictionEndDateFilter, setPredictionEndDateFilter] = useState<string>('');
//     const [predictionStatusFilter, setPredictionStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
//     const [predictionScopeFilter, setPredictionScopeFilter] = useState<'all' | 'global' | 'country' | 'city'>('all');
//     const [predictionSortBy, setPredictionSortBy] = useState<'latest' | 'alphabetical' | 'ending-soon'>('latest');

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

//     // Create prediction extended fields
//     const [predDestinedDate, setPredDestinedDate] = useState('');
//     const [predVotingEndDateNew, setPredVotingEndDateNew] = useState('');

//     // Question details modal
//     const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
//     const [questionDetails, setQuestionDetails] = useState<any>(null);
//     const [questionLoading, setQuestionLoading] = useState(false);

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

//     const loadPredictions = async (page = 1) => {
//         setLoading(true);
//         try {
//             const res = await getAuth(`/api/admin/predictions?page=${page}`);
//             setPredictions(res);
//         } catch {
//             toast.error('Failed to load predictions');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadRefs = async () => {
//         try {
//             const [fieldsRes, groupsRes] = await Promise.all([
//                 getAuth('/api/fields'),
//                 getAuth('/api/groups?my_groups=1'),
//             ]);
//             setFields(fieldsRes?.data ?? fieldsRes ?? []);
//             setMyGroups(groupsRes?.data ?? groupsRes ?? []);
//         } catch {
//             toast.error('Failed to load form data');
//         }
//     };

//     useEffect(() => {
//         loadPredictions();
//         loadRefs();
//     }, []);

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

//     const openCreateModal = (type: 'prediction' | 'poll') => {
//         setCreateType(type);
//         setCreateModalOpen(true);
//         if (type === 'prediction') {
//             setPredText('');
//             setPredDesc('');
//             setPredLocationScope('global');
//             setPredVisibility('public');
//             setPredCorrectAnswer('');
//             setPredVotingEndDate('');
//             setPredSelectedFieldId(fields[0]?.id ?? null);
//             setPredSelectedGroupIds([]);
//             // Set default voting end date to 7 days from now
//             const defaultVotingDate = new Date();
//             defaultVotingDate.setDate(defaultVotingDate.getDate() + 7);
//             defaultVotingDate.setHours(23, 59);
//             setPredVotingEndDateNew(defaultVotingDate.toISOString().slice(0, 16));
//             setPredDestinedDate('');
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
//             toast.success('Prediction published!');
//             setCreateModalOpen(false);
//             loadPredictions();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Failed');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const loadQuestionDetails = async (question: QuestionItem) => {
//         setSelectedQuestion(question);
//         setQuestionLoading(true);
//         setQuestionDetails(null);
//         try {
//             const res = await getAuth(`/api/admin/questions/${question.id}`);
//             setQuestionDetails(res);
//         } catch {
//             toast.error('Failed to load question details');
//         } finally {
//             setQuestionLoading(false);
//         }
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
//             loadPredictions();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Action failed');
//         }
//     };

//     const handleDeleteQuestion = async (questionId: number) => {
//         if (!window.confirm('Delete this question? Cannot be undone.')) return;
//         try {
//             await deleteAuth(`/api/admin/questions/${questionId}`);
//             toast.success('Deleted successfully.');
//             loadPredictions();
//         } catch (err: any) {
//             toast.error(err.response?.data?.message || 'Delete failed');
//         }
//     };


//     // Pagination Component
//     const PaginationControls = () => {
//         if (!predictions || predictions.last_page <= 1) return null;
        
//         return (
//             <div className="mt-6 flex justify-center items-center gap-3">
//                 <Button
//                     variant="outline"
//                     disabled={predictions.current_page === 1 || loading}
//                     onClick={() => loadPredictions(predictions.current_page - 1)}
//                 >
//                     ← Previous
//                 </Button>
//                 <span className="text-sm text-slate-600">
//                     Page <strong>{predictions.current_page}</strong> of <strong>{predictions.last_page}</strong>
//                 </span>
//                 <Button
//                     variant="outline"
//                     disabled={predictions.current_page === predictions.last_page || loading}
//                     onClick={() => loadPredictions(predictions.current_page + 1)}
//                 >
//                     Next →
//                 </Button>
//             </div>
//         );
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
//             <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
//                 <div>
//                     <h2 className="font-semibold text-slate-900">Predictions</h2>
//                     <p className="text-xs text-slate-400 mt-0.5">{predictions?.total ?? '—'} total predictions</p>
//                 </div>
//                 <button
//                     onClick={() => openCreateModal('prediction')}
//                     className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex-shrink-0"
//                 >
//                     <Plus size={14} /> Add Prediction
//                 </button>
//             </div>

//             <div className="p-5">
//                 {/* Filters Row 1 – Search inputs */}
//                 <div className="flex flex-col sm:flex-row gap-2 mb-2">
//                     <div className="relative flex-1">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                         <Input
//                             placeholder="Search question…"
//                             value={predictionSearch}
//                             onChange={e => setPredictionSearch(e.target.value)}
//                             className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                         />
//                         {predictionSearch && (
//                             <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setPredictionSearch('')}>
//                                 <X size={13} />
//                             </button>
//                         )}
//                     </div>
//                     <div className="relative flex-1">
//                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                         <Input
//                             placeholder="Search by user…"
//                             value={predictionUserSearch}
//                             onChange={e => setPredictionUserSearch(e.target.value)}
//                             className="pl-8 h-9 text-sm border-slate-200 bg-slate-50 focus:bg-white"
//                         />
//                         {predictionUserSearch && (
//                             <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setPredictionUserSearch('')}>
//                                 <X size={13} />
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 {/* Filters Row 2 – Selects + Date */}
//                 <div className="flex flex-wrap gap-2 mb-4">
//                     {/* Category Filter */}
//                     <Select value={predictionCategoryFilter} onValueChange={setPredictionCategoryFilter}>
//                         <SelectTrigger className="w-[150px] h-9 text-xs border-slate-200 bg-white">
//                             <SelectValue placeholder="All Categories" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="all">All Categories</SelectItem>
//                             {fields.map(f => (
//                                 <SelectItem key={f.id} value={String(f.id)}>{f.fields}</SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>

//                     {/* Status Filter */}
//                     <Select value={predictionStatusFilter} onValueChange={(val: any) => setPredictionStatusFilter(val)}>
//                         <SelectTrigger className="w-[120px] h-9 text-xs border-slate-200 bg-white">
//                             <SelectValue placeholder="Status" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="active">Active</SelectItem>
//                             <SelectItem value="resolved">Resolved</SelectItem>
//                         </SelectContent>
//                     </Select>

//                     {/* Sort By */}
//                     <Select value={predictionSortBy} onValueChange={(val: any) => setPredictionSortBy(val)}>
//                         <SelectTrigger className="w-[130px] h-9 text-xs border-slate-200 bg-white">
//                             <SelectValue placeholder="Sort By" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white border-slate-200">
//                             <SelectItem value="latest">Latest</SelectItem>
//                             <SelectItem value="ending-soon">Ending Soon</SelectItem>
//                             <SelectItem value="alphabetical">Alphabetical</SelectItem>
//                         </SelectContent>
//                     </Select>

//                     {/* Validation End Date Filter */}
//                     <div className="relative">
//                         <input
//                             type="date"
//                             value={predictionEndDateFilter}
//                             onChange={e => setPredictionEndDateFilter(e.target.value)}
//                             className="h-9 px-3 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-300"
//                             title="Filter by validation end date"
//                         />
//                         {predictionEndDateFilter && (
//                             <button
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                                 onClick={() => setPredictionEndDateFilter('')}
//                             >
//                                 <X size={12} />
//                             </button>
//                         )}
//                     </div>

//                     {/* Clear all filters */}
//                     {(predictionSearch || predictionUserSearch || predictionCategoryFilter !== 'all' || predictionStatusFilter !== 'all' || predictionEndDateFilter) && (
//                         <button
//                             onClick={() => {
//                                 setPredictionSearch('');
//                                 setPredictionUserSearch('');
//                                 setPredictionCategoryFilter('all');
//                                 setPredictionStatusFilter('all');
//                                 setPredictionScopeFilter('all');
//                                 setPredictionEndDateFilter('');
//                             }}
//                             className="h-9 px-3 text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 border border-violet-200 rounded-md transition-colors"
//                         >
//                             Clear all
//                         </button>
//                     )}
//                 </div>

//                 {(predictionSearch || predictionUserSearch || predictionCategoryFilter !== 'all' || predictionStatusFilter !== 'all' || predictionEndDateFilter) && (
//                     <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
//                         <span>Showing <strong className="text-slate-700">{filteredPredictions.length}</strong> of <strong className="text-slate-700">{predictions?.total ?? 0}</strong> predictions</span>
//                     </div>
//                 )}

//                 {loading ? (
//                     <div className="flex justify-center py-16">
//                         <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
//                     </div>
//                 ) : (
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left text-sm">
//                             <thead>
//                                 <tr className="bg-slate-50 border-y border-slate-100">
//                                     <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Question</th>
//                                     <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Created By</th>
//                                     <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Category</th>
//                                     <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Validation End</th>
//                                     <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-50">
//                                 {filteredPredictions.length > 0 ? filteredPredictions.map(q => (
//                                     <tr key={q.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-4 py-3.5 font-medium text-slate-800 max-w-[280px]">
//                                             <span className="block truncate" title={q.questions}>
//                                                 {q.questions.substring(0, 70)}{q.questions.length > 70 ? '…' : ''}
//                                             </span>
//                                             {q.is_archived && (
//                                                 <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Archived</span>
//                                             )}
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             <span className="text-slate-700 text-xs font-medium">{q.user?.name || '—'}</span>
//                                             <span className="block text-[11px] text-slate-400">@{q.user?.username || '—'}</span>
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             {q.field ? (
//                                                 <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
//                                                     {q.field.fields}
//                                                 </span>
//                                             ) : <span className="text-slate-300 text-xs">—</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5">
//                                             {(q.voting_end_date || q.end_date) ? (
//                                                 <span className="text-xs text-slate-600">
//                                                     {new Date(q.voting_end_date || q.end_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                                 </span>
//                                             ) : <span className="text-slate-300 text-xs">—</span>}
//                                         </td>
//                                         <td className="px-4 py-3.5 text-right">
//                                             <div className="flex items-center justify-end gap-1.5">
//                                                 <button onClick={() => loadQuestionDetails(q)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">View</button>
//                                                 <button
//                                                     onClick={() => handleArchiveQuestion(q.id, !!q.is_archived)}
//                                                     className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${q.is_archived
//                                                             ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
//                                                             : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
//                                                         }`}
//                                                 >
//                                                     {q.is_archived ? 'Unarchive' : 'Archive'}
//                                                 </button>
//                                                 <button onClick={() => handleDeleteQuestion(q.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">Delete</button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 )) : (
//                                     <tr>
//                                         <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
//                                             <Search size={28} className="mx-auto mb-2 opacity-20" />
//                                             <p>No predictions match the current filters</p>
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>

//                         <PaginationControls />
//                     </div>


//                 )}
//             </div>

//             {/* Question Details Modal */}
//             <Dialog open={!!selectedQuestion} onOpenChange={open => { if (!open) { setSelectedQuestion(null); setQuestionDetails(null); } }}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="capitalize text-lg">Prediction Details</DialogTitle>
//                         <p className="text-sm text-slate-500">{selectedQuestion?.questions?.substring(0, 120)}{(selectedQuestion?.questions?.length ?? 0) > 120 ? '…' : ''}</p>
//                     </DialogHeader>
//                     {questionLoading ? (
//                         <div className="flex justify-center py-12">
//                             <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
//                         </div>
//                     ) : questionDetails ? (
//                         <div className="space-y-5 mt-4">
//                             <div className="grid grid-cols-2 gap-3">
//                                 {[
//                                     ['Category', questionDetails.field?.fields || '—'],
//                                     ['Posted by', `@${questionDetails.user?.username || 'unknown'}`],
//                                     ['Visibility', questionDetails.visibility || '—'],
//                                     ['Location', questionDetails.location_scope || '—'],
//                                     ['Created', questionDetails.created_at ? new Date(questionDetails.created_at).toLocaleString() : '—'],
//                                     ['Voting Ends', questionDetails.end_date ? new Date(questionDetails.end_date).toLocaleString() : '—'],
//                                 ].map(([k, v]) => (
//                                     <div key={k} className="bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-100">
//                                         <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{k}</p>
//                                         <p className="text-sm font-semibold text-slate-800 capitalize">{v}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
//                                 <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">Result</p>
//                                 <p className="text-sm font-bold text-emerald-800">{questionDetails.correct_answer || 'Not set / Open opinion'}</p>
//                             </div>
//                             {questionDetails.answers?.length > 0 && (
//                                 <div>
//                                     <p className="text-sm font-semibold text-slate-700 mb-2">Recent Answers ({questionDetails.answers_count || questionDetails.answers.length})</p>
//                                     <div className="space-y-2 max-h-48 overflow-y-auto">
//                                         {questionDetails.answers.map((ans: any) => (
//                                             <div key={ans.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
//                                                 <div className="flex items-center gap-2 mb-1">
//                                                     <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs">{ans.user?.name?.[0] || '?'}</div>
//                                                     <span className="text-xs font-medium">@{ans.user?.username || 'anon'}</span>
//                                                     <span className="text-[10px] text-slate-400">{new Date(ans.created_at).toLocaleString()}</span>
//                                                 </div>
//                                                 <p className="text-slate-600">Answered: <strong>{ans.answer}</strong></p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     ) : (
//                         <div className="text-center py-8 text-slate-400 text-sm">Failed to load details</div>
//                     )}
//                     <div className="flex justify-end mt-4">
//                         <Button variant="outline" onClick={() => setSelectedQuestion(null)}>Close</Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>

//             {/* Create Prediction Modal */}
//             <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
//                 <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
//                     <DialogHeader>
//                         <DialogTitle className="text-lg">Create Prediction</DialogTitle>
//                     </DialogHeader>
//                     {createType === 'prediction' && (
//                         <div className="space-y-4 mt-4">
//                             {/* Category */}
//                             <div className="space-y-1.5">
//                                 <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category <span className="text-pink-500">*</span></Label>
//                                 <Select value={predSelectedFieldId?.toString() ?? ''} onValueChange={v => setPredSelectedFieldId(Number(v))}>
//                                     <SelectTrigger className="border-slate-200 bg-slate-50 focus:bg-white">
//                                         <SelectValue placeholder="Select category" />
//                                     </SelectTrigger>
//                                     <SelectContent className="bg-white border-slate-200">
//                                         {fields.map(f => (
//                                             <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
//                                         ))}
//                                     </SelectContent>
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
//                                 <div className="space-y-1.5">
//                                     <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</Label>
//                                     <RadioGroup value={predVisibility} onValueChange={v => setPredVisibility(v as any)} className="flex gap-4 pt-2">
//                                         <div className="flex items-center gap-2">
//                                             <RadioGroupItem value="public" id="adm-pp" />
//                                             <Label htmlFor="adm-pp" className="text-sm cursor-pointer">🌐 Public</Label>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <RadioGroupItem value="private" id="adm-pr" />
//                                             <Label htmlFor="adm-pr" className="text-sm cursor-pointer">🔒 Private</Label>
//                                         </div>
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
//                                     {submitting ? (
//                                         <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</>
//                                     ) : 'Publish Prediction'}
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// }










import { useState, useEffect } from 'react';
import {
    TrendingUp, Search, X, Plus, Loader2, Archive, ArchiveRestore,
    CheckCircle, Ban, AlertCircle
} from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';

import { getAuth, deleteAuth, postAuth } from '@/util/api';
import { toast } from 'sonner';
import { getCategoryPlaceholder } from '@/util/categoryPlaceholders';

interface QuestionItem {
    id: number; questions: string; module_type: 'prediction' | 'poll';
    user?: { name: string; username: string };
    field?: { id: number; fields: string };
    status?: string; location_scope?: string; end_date?: string; voting_end_date?: string; created_at?: string;
    is_archived?: boolean;
}

interface PaginatedData<T> { data: T[]; current_page: number; last_page: number; total: number; }

interface Group {
    id: number; name: string; description?: string; is_private: boolean;
    user: { id: number; name: string; username: string } | null;
    members_count: number; is_blocked: boolean; is_member?: boolean;
}

export default function PredictionsTab() {
    const [predictions, setPredictions] = useState<PaginatedData<QuestionItem> | null>(null);
    const [fields, setFields] = useState<{ id: number; fields: string }[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);

    // Loading
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Filters
    const [predictionSearch, setPredictionSearch] = useState('');
    const [predictionUserSearch, setPredictionUserSearch] = useState('');
    const [predictionCategoryFilter, setPredictionCategoryFilter] = useState<string>('all');
    const [predictionEndDateFilter, setPredictionEndDateFilter] = useState<string>('');
    const [predictionStatusFilter, setPredictionStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
    const [predictionScopeFilter, setPredictionScopeFilter] = useState<'all' | 'global' | 'country' | 'city'>('all');
    const [predictionSortBy, setPredictionSortBy] = useState<'latest' | 'alphabetical' | 'ending-soon'>('latest');

    // Create prediction/poll modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createType, setCreateType] = useState<'prediction' | 'poll' | null>(null);

    // Prediction form
    const [predText, setPredText] = useState('');
    const [predDesc, setPredDesc] = useState('');
    const [predLocationScope, setPredLocationScope] = useState<'global' | 'country' | 'city'>('global');
    const [predVisibility, setPredVisibility] = useState<'public' | 'private'>('public');
    const [predCorrectAnswer, setPredCorrectAnswer] = useState('');
    const [predVotingEndDate, setPredVotingEndDate] = useState('');
    const [predSelectedFieldId, setPredSelectedFieldId] = useState<number | null>(null);
    const [predSelectedGroupIds, setPredSelectedGroupIds] = useState<number[]>([]);

    const predCategoryName = fields.find(f => f.id === predSelectedFieldId)?.fields;

    // Create prediction extended fields
    const [predDestinedDate, setPredDestinedDate] = useState('');
    const [predVotingEndDateNew, setPredVotingEndDateNew] = useState('');

    // Question details modal
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
    const [questionDetails, setQuestionDetails] = useState<any>(null);
    const [questionLoading, setQuestionLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmData, setConfirmData] = useState<{
    type: 'archive' | 'delete';
    questionId: number;
    currentlyArchived?: boolean;
} | null>(null);

const [actionLoading, setActionLoading] = useState(false);

    const formatToMySQLDateTime = (dateStr: string): string | null => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
                `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
        } catch { return null; }
    };

    const loadPredictions = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getAuth(`/api/admin/predictions?page=${page}`);
            setPredictions(res);
        } catch {
            toast.error('Failed to load predictions');
        } finally {
            setLoading(false);
        }
    };

    const loadRefs = async () => {
        try {
            const [fieldsRes, groupsRes] = await Promise.all([
                getAuth('/api/fields'),
                getAuth('/api/groups?my_groups=1'),
            ]);
            setFields(fieldsRes?.data ?? fieldsRes ?? []);
            setMyGroups(groupsRes?.data ?? groupsRes ?? []);
        } catch {
            toast.error('Failed to load form data');
        }
    };

    useEffect(() => {
        loadPredictions();
        loadRefs();
    }, []);

    const filteredPredictions = (predictions?.data ?? []).filter(p => {
        const q = predictionSearch.trim().toLowerCase();
        const uq = predictionUserSearch.trim().toLowerCase();
        const matchSearch = !q || (p.questions ?? '').toLowerCase().includes(q);
        const matchUser = !uq ||
            (p.user?.username ?? '').toLowerCase().includes(uq) ||
            (p.user?.name ?? '').toLowerCase().includes(uq);

        const matchCategory =
            predictionCategoryFilter === 'all' ||
            String(p.field?.id ?? '') === predictionCategoryFilter;

        const matchEndDate = !predictionEndDateFilter || (() => {
            const filterDate = new Date(predictionEndDateFilter);
            const endDate = p.voting_end_date ? new Date(p.voting_end_date) : (p.end_date ? new Date(p.end_date) : null);
            if (!endDate) return false;
            return endDate.toDateString() === filterDate.toDateString();
        })();

        const matchStatus =
            predictionStatusFilter === 'all' ||
            (predictionStatusFilter === 'active' && p.status === 'active') ||
            (predictionStatusFilter === 'resolved' && p.status === 'closed');

        const matchScope =
            predictionScopeFilter === 'all' ||
            (p.location_scope ?? '').toLowerCase() === predictionScopeFilter.toLowerCase();

        return matchSearch && matchUser && matchCategory && matchEndDate && matchStatus && matchScope;
    }).sort((a, b) => {
        if (predictionSortBy === 'alphabetical') {
            return (a.questions || '').localeCompare(b.questions || '');
        }
        if (predictionSortBy === 'ending-soon') {
            const aTime = (a.voting_end_date || a.end_date) ? new Date(a.voting_end_date || a.end_date!).getTime() : Infinity;
            const bTime = (b.voting_end_date || b.end_date) ? new Date(b.voting_end_date || b.end_date!).getTime() : Infinity;
            return aTime - bTime;
        }
        return b.id - a.id;
    });

    const openCreateModal = (type: 'prediction' | 'poll') => {
        setCreateType(type);
        setCreateModalOpen(true);
        if (type === 'prediction') {
            setPredText('');
            setPredDesc('');
            setPredLocationScope('global');
            setPredVisibility('public');
            setPredCorrectAnswer('');
            setPredVotingEndDate('');
            setPredSelectedFieldId(fields[0]?.id ?? null);
            setPredSelectedGroupIds([]);
            // Set default voting end date to 7 days from now
            const defaultVotingDate = new Date();
            defaultVotingDate.setDate(defaultVotingDate.getDate() + 7);
            defaultVotingDate.setHours(23, 59);
            setPredVotingEndDateNew(defaultVotingDate.toISOString().slice(0, 16));
            setPredDestinedDate('');
        }
    };

    const handlePublishPrediction = async () => {
        if (!predText.trim()) return toast.error('Prediction text required');
        if (!predSelectedFieldId) return toast.error('Select a category');
        if (!predDestinedDate) return toast.error('Set destined (prediction end) date');
        const predDate = new Date(predDestinedDate);
        if (predDate <= new Date()) return toast.error('Destined date must be in the future');
        if (predVotingEndDateNew) {
            const vDate = new Date(predVotingEndDateNew);
            if (vDate <= new Date()) return toast.error('Validation end date must be in the future');
        }
        try {
            setSubmitting(true);
            await postAuth('/api/predictions', {
                field_id: predSelectedFieldId,
                questions: predText.trim(),
                description: predDesc.trim() || null,
                location_scope: predLocationScope,
                visibility: predVisibility,
                start_date: formatToMySQLDateTime(new Date().toISOString()),
                end_date: formatToMySQLDateTime(predDestinedDate),
                voting_end_date: predVotingEndDateNew ? formatToMySQLDateTime(predVotingEndDateNew) : null,
                options: ['Yes', 'No', 'Vague'],
                group_ids: predSelectedGroupIds,
            });
            toast.success('Prediction published!');
            setCreateModalOpen(false);
            loadPredictions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    const loadQuestionDetails = async (question: QuestionItem) => {
        setSelectedQuestion(question);
        setQuestionLoading(true);
        setQuestionDetails(null);
        try {
            const res = await getAuth(`/api/admin/questions/${question.id}`);
            setQuestionDetails(res);
        } catch {
            toast.error('Failed to load question details');
        } finally {
            setQuestionLoading(false);
        }
    };

    // const handleArchiveQuestion = async (questionId: number, currentlyArchived: boolean) => {
    //     if (!window.confirm(
    //         currentlyArchived
    //             ? 'Unarchive this question? It will become visible again.'
    //             : 'Archive this question? It will be hidden from all users but not deleted.'
    //     )) return;

    //     try {
    //         const action = currentlyArchived ? 'unarchive' : 'archive';
    //         await postAuth(`/api/admin/questions/${questionId}/${action}`);
    //         toast.success(currentlyArchived ? 'Question unarchived' : 'Question archived successfully');
    //         loadPredictions();
    //     } catch (err: any) {
    //         toast.error(err.response?.data?.message || 'Action failed');
    //     }
    // };


    const handleArchiveQuestion = (
    questionId: number,
    currentlyArchived: boolean
) => {
    setConfirmData({
        type: 'archive',
        questionId,
        currentlyArchived,
    });
    setConfirmOpen(true);
};

    // const handleDeleteQuestion = async (questionId: number) => {
    //     if (!window.confirm('Delete this question? Cannot be undone.')) return;
    //     try {
    //         await deleteAuth(`/api/admin/questions/${questionId}`);
    //         toast.success('Deleted successfully.');
    //         loadPredictions();
    //     } catch (err: any) {
    //         toast.error(err.response?.data?.message || 'Delete failed');
    //     }
    // };

    // Pagination Component
   
   
   const handleDeleteQuestion = (questionId: number) => {
    setConfirmData({
        type: 'delete',
        questionId,
    });
    setConfirmOpen(true);
};



const handleConfirmAction = async () => {
    if (!confirmData) return;

    try {
        setActionLoading(true);

        if (confirmData.type === 'archive') {
            const action = confirmData.currentlyArchived
                ? 'unarchive'
                : 'archive';

            await postAuth(
                `/api/admin/questions/${confirmData.questionId}/${action}`
            );

            toast.success(
                confirmData.currentlyArchived
                    ? 'Question unarchived successfully'
                    : 'Question archived successfully'
            );
        }

        if (confirmData.type === 'delete') {
            await deleteAuth(
                `/api/admin/questions/${confirmData.questionId}`
            );

            toast.success('Question deleted successfully');
        }

        setConfirmOpen(false);
        setConfirmData(null);

        loadPredictions();
    } catch (err: any) {
        toast.error(
            err.response?.data?.message || 'Action failed'
        );
    } finally {
        setActionLoading(false);
    }
};



   
    const PaginationControls = () => {
        if (!predictions || predictions.last_page <= 1) return null;
        
        return (
            <div className="mt-5 flex justify-center items-center gap-3">
                <Button
                    variant="outline"
                    disabled={predictions.current_page === 1 || loading}
                    onClick={() => loadPredictions(predictions.current_page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    ← Previous
                </Button>
                <span className="text-xs text-slate-500">
                    Page <strong>{predictions.current_page}</strong> of <strong>{predictions.last_page}</strong>
                </span>
                <Button
                    variant="outline"
                    disabled={predictions.current_page === predictions.last_page || loading}
                    onClick={() => loadPredictions(predictions.current_page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next →
                </Button>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            {/* Header — violet tint */}
            <div className="px-5 py-4 border-b border-violet-100 bg-violet-50 rounded-t-2xl flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-violet-900">Predictions Management</h2>
                    <p className="text-xs text-violet-400 mt-0.5">{predictions?.total ?? '—'} total predictions</p>
                </div>
                <button
                    onClick={() => openCreateModal('prediction')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <Plus size={14} /> New Prediction
                </button>
            </div>

            <div className="p-5">
                {/* Filters Row 1 – Search inputs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                        <Input
                            placeholder="Search question…"
                            value={predictionSearch}
                            onChange={e => setPredictionSearch(e.target.value)}
                            className="pl-8 h-9 text-sm border-violet-200 bg-violet-50/50 focus:bg-white placeholder:text-violet-300"
                        />
                        {predictionSearch && (
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-600" onClick={() => setPredictionSearch('')}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                        <Input
                            placeholder="Search by user…"
                            value={predictionUserSearch}
                            onChange={e => setPredictionUserSearch(e.target.value)}
                            className="pl-8 h-9 text-sm border-violet-200 bg-violet-50/50 focus:bg-white placeholder:text-violet-300"
                        />
                        {predictionUserSearch && (
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-600" onClick={() => setPredictionUserSearch('')}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Row 2 – Selects + Date */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {/* Category Filter */}
                    <Select value={predictionCategoryFilter} onValueChange={setPredictionCategoryFilter}>
                        <SelectTrigger className="w-[160px] h-9 text-xs border-violet-200 bg-white">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="all">All Categories</SelectItem>
                            {fields.map(f => (
                                <SelectItem key={f.id} value={String(f.id)}>{f.fields}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={predictionStatusFilter} onValueChange={(val: any) => setPredictionStatusFilter(val)}>
                        <SelectTrigger className="w-[130px] h-9 text-xs border-violet-200 bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort By */}
                    <Select value={predictionSortBy} onValueChange={(val: any) => setPredictionSortBy(val)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs border-violet-200 bg-white">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="ending-soon">Ending Soon</SelectItem>
                            <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Validation End Date Filter */}
                    <div className="relative">
                        <input
                            type="date"
                            value={predictionEndDateFilter}
                            onChange={e => setPredictionEndDateFilter(e.target.value)}
                            className="h-9 px-4 text-xs border border-violet-200 rounded-md bg-white focus:border-violet-400"
                            title="Filter by validation end date"
                        />
                        {predictionEndDateFilter && (
                            <button
                                // className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-violet-600"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 ps-10 rounded-full text-violet-400 hover:text-violet-600 hover:bg-violet-100"
                                onClick={() => setPredictionEndDateFilter('')}
                            >
                              {/* <X className='' size={20} /> */}
                            </button>
                        )}
                    </div>

                    {/* Clear all filters */}
                    {(predictionSearch || predictionUserSearch || predictionCategoryFilter !== 'all' || predictionStatusFilter !== 'all' || predictionEndDateFilter) && (
                        <button
                            onClick={() => {
                                setPredictionSearch('');
                                setPredictionUserSearch('');
                                setPredictionCategoryFilter('all');
                                setPredictionStatusFilter('all');
                                setPredictionEndDateFilter('');
                            }}
                            className="h-9 px-4 text-xs font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 rounded-md transition-colors"
                        >
                            Clear all
                        </button>
                    )}
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
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Question</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Created By</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Validation End</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-violet-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPredictions.length > 0 ? filteredPredictions.map((q, idx) => (
                                    <tr key={q.id} className={`transition-colors hover:bg-violet-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                        <td className="px-4 py-3.5 font-medium text-slate-900 max-w-[280px]">
                                            <span className="block truncate" title={q.questions}>
                                                {q.questions.substring(0, 70)}{q.questions.length > 70 ? '…' : ''}
                                            </span>
                                            {q.is_archived && (
                                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Archived</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-slate-700 text-xs font-medium">{q.user?.name || '—'}</span>
                                            <span className="block text-[11px] text-slate-400">@{q.user?.username || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {q.field ? (
                                                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                                                    {q.field.fields}
                                                </span>
                                            ) : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {(q.voting_end_date || q.end_date) ? (
                                                <span className="text-xs text-slate-600">
                                                    {new Date(q.voting_end_date || q.end_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            ) : <span className="text-slate-300 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => loadQuestionDetails(q)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors">View</button>
                                                <button
                                                    onClick={() => handleArchiveQuestion(q.id, !!q.is_archived)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${q.is_archived
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                        }`}
                                                >
                                                    {q.is_archived ? 'Unarchive' : 'Archive'}
                                                </button>
                                                <button onClick={() => handleDeleteQuestion(q.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                                            <Search size={28} className="mx-auto mb-2 opacity-20" />
                                            No predictions match the current filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <PaginationControls />
                    </div>
                )}
            </div>

            {/* Question Details Modal */}
            <Dialog open={!!selectedQuestion} onOpenChange={open => { if (!open) { setSelectedQuestion(null); setQuestionDetails(null); } }}>
                <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="capitalize text-lg text-violet-900">Prediction Details</DialogTitle>
                        <p className="text-sm text-slate-500">{selectedQuestion?.questions?.substring(0, 120)}{(selectedQuestion?.questions?.length ?? 0) > 120 ? '…' : ''}</p>
                    </DialogHeader>
                    {questionLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                        </div>
                    ) : questionDetails ? (
                        <div className="space-y-5 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ['Category', questionDetails.field?.fields || '—'],
                                    ['Posted by', `@${questionDetails.user?.username || 'unknown'}`],
                                    ['Visibility', questionDetails.visibility || '—'],
                                    ['Location', questionDetails.location_scope || '—'],
                                    ['Created', questionDetails.created_at ? new Date(questionDetails.created_at).toLocaleString() : '—'],
                                    ['Voting Ends', questionDetails.end_date ? new Date(questionDetails.end_date).toLocaleString() : '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-violet-50 rounded-xl px-3.5 py-3 border border-violet-100">
                                        <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">{k}</p>
                                        <p className="text-sm font-semibold text-slate-800 capitalize">{v}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">Result</p>
                                <p className="text-sm font-bold text-emerald-800">{questionDetails.correct_answer || 'Not set / Open opinion'}</p>
                            </div>
                            {questionDetails.answers?.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Recent Answers ({questionDetails.answers_count || questionDetails.answers.length})</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {questionDetails.answers.map((ans: any) => (
                                            <div key={ans.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs">{ans.user?.name?.[0] || '?'}</div>
                                                    <span className="text-xs font-medium">@{ans.user?.username || 'anon'}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(ans.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-slate-600">Answered: <strong>{ans.answer}</strong></p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">Failed to load details</div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setSelectedQuestion(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Prediction Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="bg-white border-slate-200 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg text-violet-900">Create Prediction</DialogTitle>
                    </DialogHeader>
                    {createType === 'prediction' && (
                        <div className="space-y-4 mt-4">
                            {/* Category */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category <span className="text-pink-500">*</span></Label>
                                <Select value={predSelectedFieldId?.toString() ?? ''} onValueChange={v => setPredSelectedFieldId(Number(v))}>
                                    <SelectTrigger className="border-violet-200 bg-white">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                        {fields.map(f => (
                                            <SelectItem key={f.id} value={f.id.toString()}>{f.fields}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Prediction Statement */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prediction Statement <span className="text-pink-500">*</span></Label>
                                <Textarea
                                    placeholder={getCategoryPlaceholder(predCategoryName, 'prediction')}
                                    value={predText}
                                    onChange={e => setPredText(e.target.value)}
                                    className="min-h-24 border-violet-200 bg-white focus:bg-white resize-none"
                                    maxLength={500}
                                />
                                <p className="text-right text-[10px] text-slate-400">{predText.length}/500</p>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description <span className="font-normal normal-case text-slate-400">(optional)</span></Label>
                                <Textarea
                                    placeholder="Provide context or evidence…"
                                    value={predDesc}
                                    onChange={e => setPredDesc(e.target.value)}
                                    className="min-h-16 border-violet-200 bg-white focus:bg-white resize-none"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Destined Date <span className="text-pink-500">*</span>
                                    </Label>
                                    <p className="text-[10px] text-slate-400">When does this prediction come true?</p>
                                    <input
                                        type="datetime-local"
                                        value={predDestinedDate}
                                        onChange={e => setPredDestinedDate(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full h-9 px-3 text-sm border border-violet-200 rounded-md bg-white focus:border-violet-400"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Validation Ends
                                    </Label>
                                    <p className="text-[10px] text-slate-400">Default: 7 days — when community can vote</p>
                                    <input
                                        type="datetime-local"
                                        value={predVotingEndDateNew}
                                        onChange={e => setPredVotingEndDateNew(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full h-9 px-3 text-sm border border-violet-200 rounded-md bg-white focus:border-violet-400"
                                    />
                                </div>
                            </div>

                            {/* Location scope + Visibility */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibility</Label>
                                    <RadioGroup value={predVisibility} onValueChange={v => setPredVisibility(v as any)} className="flex gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="public" id="adm-pp" />
                                            <Label htmlFor="adm-pp" className="text-sm cursor-pointer">🌐 Public</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="private" id="adm-pr" />
                                            <Label htmlFor="adm-pr" className="text-sm cursor-pointer">🔒 Private</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            {/* Group sharing (only visible when private) */}
                            {predVisibility === 'private' && myGroups.length > 0 && (
                                <div className="space-y-2 p-3 rounded-xl border border-violet-200 bg-violet-50">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share with communities</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {myGroups.map(group => (
                                            <button
                                                key={group.id}
                                                type="button"
                                                onClick={() => setPredSelectedGroupIds(prev =>
                                                    prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
                                                )}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${predSelectedGroupIds.includes(group.id)
                                                        ? 'bg-violet-100 border-violet-400 text-violet-700'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'
                                                    }`}
                                            >
                                                {predSelectedGroupIds.includes(group.id) && <CheckCircle size={11} />}
                                                {group.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="border-slate-200">Cancel</Button>
                                <Button
                                    onClick={handlePublishPrediction}
                                    disabled={submitting || !predText.trim() || !predSelectedFieldId || !predDestinedDate}
                                    className="bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    {submitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</>
                                    ) : 'Publish Prediction'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>






<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
    <DialogContent className="max-w-md bg-white border-slate-200">
        <div className="flex flex-col items-center text-center py-2">

            {confirmData?.type === 'delete' ? (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
            ) : (
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    {confirmData?.currentlyArchived ? (
                        <ArchiveRestore className="h-8 w-8 text-emerald-600" />
                    ) : (
                        <Archive className="h-8 w-8 text-amber-600" />
                    )}
                </div>
            )}

            <h3 className="text-lg font-semibold text-slate-900">
                {confirmData?.type === 'delete'
                    ? 'Delete Question'
                    : confirmData?.currentlyArchived
                    ? 'Unarchive Question'
                    : 'Archive Question'}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
                {confirmData?.type === 'delete'
                    ? 'This action cannot be undone. The question will be permanently removed.'
                    : confirmData?.currentlyArchived
                    ? 'This question will become visible to users again.'
                    : 'This question will be hidden from users but not deleted.'}
            </p>

            <div className="flex justify-center gap-3 mt-6 w-full">
                <Button
                    variant="outline"
                    onClick={() => {
                        setConfirmOpen(false);
                        setConfirmData(null);
                    }}
                    disabled={actionLoading}
                    className="flex-1"
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleConfirmAction}
                    disabled={actionLoading}
                    className={
                        confirmData?.type === 'delete'
                            ? 'flex-1 bg-red-600 hover:bg-red-700'
                            : 'flex-1 bg-violet-600 hover:bg-violet-700'
                    }
                >
                    {actionLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : confirmData?.type === 'delete' ? (
                        'Delete'
                    ) : confirmData?.currentlyArchived ? (
                        'Unarchive'
                    ) : (
                        'Archive'
                    )}
                </Button>
            </div>
        </div>
    </DialogContent>
</Dialog>




        </div>





    );
}
