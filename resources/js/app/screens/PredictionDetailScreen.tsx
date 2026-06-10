// import { useState, useEffect, useRef } from 'react';
// import { UNSAFE_ErrorResponseImpl, useNavigate, useParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import { Twitter, Send, MessageCircle, Link2, BarChart3, Calendar, Zap, ShieldCheck, TrendingUp, Trophy, ArrowLeft, Clock, Target, Users, Globe, Lock, CheckCircle2, XCircle, HelpCircle, MessageSquare } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { useAppSelector } from '@/app/store/hooks';
// import { getAuth, postAuth, putAuth } from '@/util/api';
// import { Input } from '@/app/components/ui/input';
// import { Textarea } from '@/app/components/ui/textarea';
// import { Label } from '@/app/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
// import { Edit2, Save } from 'lucide-react';
// // import sports from '../../../../../public/bgimg/sports.png'
// import sports from '../../../../public/bgimg/sports-1.png';
// import politics from '../../../../public/bgimg/politics.png';
// import tech from '../../../../public/bgimg/tech.png';
// import sm from '../../../../public/bgimg/sharemarket.png';
// import movie from '../../../../public/bgimg/movie.png';
// import general from '../../../../public/bgimg/general.png';


// const SectionCard = ({ children, title, icon: Icon, color = "#a855f7" }: { children: React.ReactNode, title: string, icon: any, color?: string }) => (
//   <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group transition-all hover:shadow-md" style={{ borderLeft: `4px solid ${color}` }}>
//     <div className="flex items-center gap-3 mb-6">
//       <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
//         <Icon size={18} style={{ color: color }} />
//       </div>
//       <h3 className="text-[15px] font-black text-[#111111] uppercase tracking-wider">{title}</h3>
//     </div>
//     {children}
//   </div>
// );

// const SectionHeading = ({ children }: { children: React.ReactNode }) => (
//   <h4 className="text-[12px] font-black text-[#667781] uppercase tracking-[0.2em] mb-4 mt-2 px-1 opacity-70">
//     {children}
//   </h4>
// );


// const categoryColors: Record<string, string> = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
//   technology: '#06b6d4',
//   sharemarket: '#fbbf24',
//   'share market': '#fbbf24',
//   'movies/entertainment': '#ec4899',
// };

// const cardPalettes = [
//   { border: '#a855f7', bg: 'rgba(168,85,247,0.03)', iconBg: 'rgba(168,85,247,0.08)' },
//   { border: '#ec4899', bg: 'rgba(236,72,153,0.03)', iconBg: 'rgba(236,72,153,0.08)' },
//   { border: '#06b6d4', bg: 'rgba(6,182,212,0.03)', iconBg: 'rgba(6,182,212,0.08)' },
//   { border: '#10b981', bg: 'rgba(16,185,129,0.03)', iconBg: 'rgba(16,185,129,0.08)' },
//   { border: '#f59e0b', bg: 'rgba(245,158,11,0.03)', iconBg: 'rgba(245,158,11,0.08)' },
//   { border: '#3b82f6', bg: 'rgba(59,130,246,0.03)', iconBg: 'rgba(59,130,246,0.08)' },
// ];

// function getResultLabel(totalVotes: number, agreeP: number, disagreeP: number, vagueP: number): string {
//   if (totalVotes === 0) return 'No votes yet';
//   const margin = Math.abs(agreeP - disagreeP);
//   if (vagueP > agreeP && vagueP > disagreeP) {
//     return `Vague`;
//   }
//   if (margin <= 5 && vagueP < 40) return `Too close to call`;
//   if (margin <= 3) return 'Highly uncertain (votes are split)';
//   if (agreeP > disagreeP && agreeP > vagueP) {
//     return `Successful`;
//   } 
//   if (disagreeP > agreeP && disagreeP > vagueP) {
//     return `Failure`;
//   }
//   return `Too close to call`;
// }

// function getOutcomeFromLabel(label: string): 'yes' | 'no' | 'vague' {
//   const l = label.toLowerCase();
//   if (l.includes('successful') || l.includes('yes')) return 'yes';
//   if (l.includes('failure') || l.includes('no')) return 'no';
//   return 'vague';
// }

// export function PredictionDetailScreen() {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const [prediction, setPrediction] = useState<any>(null);
//   const [selectedAnswer, setSelectedAnswer] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Edit State
//   const [editOpen, setEditOpen] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [editForm, setEditForm] = useState({
//     questions: '',
//     description: '',
//     field_id: '',
//     visibility: 'public',
//     end_date: '',
//     voting_end_date: ''
//   });

//   const { user: currentUser } = useAppSelector((state) => state.auth);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await getAuth('/api/fields');
//         if (res.status) setCategories(res.fields);
//       } catch (err) { console.error('Failed to fetch categories', err); }
//     };
//     fetchCategories();
//   }, []);

//   const handleOpenEdit = () => {
//     setEditForm({
//       questions: prediction.questions || '',
//       description: prediction.description || '',
//       field_id: prediction.field_id?.toString() || '',
//       visibility: prediction.visibility || 'public',
//       end_date: prediction.end_date?.split(' ')[0] || '',
//       voting_end_date: prediction.voting_end_date?.split(' ')[0] || ''
//     });
//     setEditOpen(true);
//   };

//   const handleUpdateQuestion = async () => {
//     if (!editForm.questions.trim()) { toast.error('Question is required'); return; }
//     setIsUpdating(true);
//     try {
//       const res = await putAuth(`/api/predictions/${id}`, editForm);
//       if (res.status) {
//         toast.success('Prediction updated successfully');
//         setEditOpen(false);
//         const refreshed = await getAuth(`/api/predictions/${id}`);
//         setPrediction(refreshed);
//       } else {
//         toast.error(res.message || 'Update failed');
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'An error occurred');
//     } finally {
//       setIsUpdating(false);
//     }
//   };


//   const formatDateCompact = (dateStr?: string | null) => {
//     if (!dateStr) return 'TBD';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return 'TBD';
//     return format(date, 'dd MMM');
//   };

//   useEffect(() => {
//     if (!id) { setFetchError('No prediction ID provided'); setLoading(false); return; }
//     const fetchPrediction = async () => {
//       try {
//         setLoading(true);
//         setFetchError(null);
//         const data = await getAuth(`/api/predictions/${id}`);
//         setPrediction(data);
//       } catch (err: any) {
//         setFetchError(err.message || 'Failed to load prediction');
//         toast.error('Could not load prediction');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPrediction();
//   }, [id]);

//   const handleVote = async () => {
//     if (!selectedAnswer) { toast.error('Please select an answer'); return; }
//     setSubmitting(true);

//     // Map the UI label (e.g. 'YES') to the casing stored in the DB (e.g. 'Yes')
//     let finalAnswer = selectedAnswer.trim();
//     if (prediction?.options && Array.isArray(prediction.options)) {
//       const match = prediction.options.find(
//         (opt: string) => opt.toLowerCase() === selectedAnswer.toLowerCase()
//       );
//       if (match) {
//         finalAnswer = match;
//       } else {
//         finalAnswer = selectedAnswer.charAt(0).toUpperCase() + selectedAnswer.slice(1).toLowerCase();
//       }
//     } else {
//       finalAnswer = selectedAnswer.charAt(0).toUpperCase() + selectedAnswer.slice(1).toLowerCase();
//     }

//     try {
//       await postAuth('/api/answers', { question_id: id, answer: finalAnswer });
//       toast.success('Vote submitted successfully!');
//       setSelectedAnswer('');
//       const refreshed = await getAuth(`/api/predictions/${id}`);
//       if (refreshed) setPrediction(refreshed);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to submit vote');
//     } finally {
//       setSubmitting(false);
//     }
//   };


//   // const [isExpanded, setIsExpanded] = useState(false);
// const [needsExpansion, setNeedsExpansion] = useState(false);
// const questionRef = useRef<HTMLHeadingElement>(null);

//   // Detect if question needs "Show more" button
// useEffect(() => {
//   if (!questionRef.current || !prediction?.questions) return;

//   const element = questionRef.current;
  
//   // Reset expansion when prediction changes
//   setIsExpanded(false);

//   // Small delay to let browser apply line-clamp
//   const timer = setTimeout(() => {
//     const isOverflowing = element.scrollHeight > element.clientHeight + 2; // +2 for tolerance
//     setNeedsExpansion(isOverflowing);
//   }, 100);

//   return () => clearTimeout(timer);
// }, [prediction?.questions]);



//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
//         <p className="text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">Loading...</p>
//       </div>
//     );
//   }

//   if (fetchError || !prediction) {
//     return (
//       <div className="min-h-screen bg-[#f8f8f6] flex flex-col items-center justify-center gap-4 p-6">
//         <h2 className="text-lg font-black text-red-500 uppercase">Error</h2>
//         <p className="text-muted-foreground text-sm text-center font-bold uppercase">{fetchError || 'Not found'}</p>
//         <Button onClick={() => navigate(-1)} variant="outline" className="h-10 px-6 rounded-xl text-xs font-bold uppercase">Back</Button>
//       </div>
//     );
//   }

//   const answers = Array.isArray(prediction?.answers) ? prediction.answers : [];
//   const yesCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
//   const noCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
//   const vagueCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'vague').length;
//   const totalValidVotes = yesCount + noCount + vagueCount;

//   const agreePercentage = totalValidVotes > 0 ? Math.round((yesCount / totalValidVotes) * 100) : 0;
//   const disagreePercentage = totalValidVotes > 0 ? Math.round((noCount / totalValidVotes) * 100) : 0;
//   const vaguePercentage = totalValidVotes > 0 ? Math.round((vagueCount / totalValidVotes) * 100) : 0;

//   const isClosed = prediction?.end_date ? new Date(prediction.end_date) < new Date() : false;
//   const isVotingClosed = prediction?.voting_end_date 
//     ? new Date(prediction.voting_end_date) < new Date() 
//     : isClosed; // fallback to end_date if no voting_end_date
//   const canVote = !isVotingClosed;
//   const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);
//   const userVote = answers.find((a: any) => a.user_id === currentUser?.id)?.answer?.toUpperCase();

//   const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';
//   const resultLabel = getResultLabel(totalValidVotes, agreePercentage, disagreePercentage, vaguePercentage);
//   const outcome = getOutcomeFromLabel(resultLabel);

//   const pillConfig = {
//     yes: { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-500', icon: <CheckCircle2 size={10} />, label: 'YES' },
//     no: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-500', icon: <XCircle size={10} />, label: 'NO' },
//     vague: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-500', icon: <HelpCircle size={10} />, label: 'VAGUE' },
//   }[outcome];

//   const showResultPill = isClosed || isVotingClosed || hasVoted;

//   // const categoryImages: Record<string, string> = {
//   //   'SHAREMARKET': 'https://cdn3d.iconscout.com/3d/premium/thumb/stock-market-growth-5561706-4654302.png',
//   //   'MOVIES/ENTERTAINMENT': 'https://cdn3d.iconscout.com/3d/premium/thumb/popcorn-and-film-strip-4290317-3563914.png',
//   //   'POLITICS': 'https://cdn3d.iconscout.com/3d/premium/thumb/election-campaign-5696144-4749372.png',
//   //   'SPORTS': sports,
//   //   'TECHNOLOGY': 'https://cdn3d.iconscout.com/3d/premium/thumb/artificial-intelligence-5374431-4493392.png',
//   //   'GENERAL': 'https://cdn3d.iconscout.com/3d/premium/thumb/prediction-5696141-4749369.png'
//   // };

//   const categoryImages: Record<string, string> = {
//   "SHAREMARKET": sm,
//   "SHARE MARKET": sm,
//    // 'https://cdn3d.iconscout.com/3d/premium/thumb/stock-market-growth-5561706-4654302.png',

//   'MOVIES/ENTERTAINMENT': movie,
//    // 'https://cdn3d.iconscout.com/3d/premium/thumb/popcorn-and-film-strip-4290317-3563914.png',

//   POLITICS: politics,
//     // 'https://cdn3d.iconscout.com/3d/premium/thumb/election-campaign-5696144-4749372.png',

//   SPORTS: sports,

//   TECHNOLOGY: tech,
//    // 'https://cdn3d.iconscout.com/3d/premium/thumb/artificial-intelligence-5374431-4493392.png',

//   GENERAL:general,
//     // 'https://cdn3d.iconscout.com/3d/premium/thumb/prediction-5696141-4749369.png',
// };

//   const currentCat = prediction?.field?.fields?.toUpperCase() || 'GENERAL';
//   const bannerImage = categoryImages[currentCat] || categoryImages['GENERAL'];

//   const handleShare = async (platform: string) => {
//     const url = window.location.href;
//     const text = `🤔 Predict now on iSaidSo!\n\nQuestion: ${prediction?.questions}\n\nCast your vote and see what others think 👇`;
//     const encodedUrl = encodeURIComponent(url);
//     const encodedText = encodeURIComponent(text);

//     if (platform === 'native') {
//       if (navigator.share) {
//         try {
//           await navigator.share({
//             title: 'iSaidSo Prediction',
//             text: text,
//             url: url
//           });
//         } catch (err) {
//           console.error('Error sharing:', err);
//         }
//       } else {
//         try {
//           await navigator.clipboard.writeText(`${text} ${url}`);
//           toast.success('Link copied to clipboard!');
//         } catch (err) {
//           toast.error('Failed to copy link');
//         }
//       }
//       return;
//     }

//     let shareUrl = '';
//     switch (platform) {
//       case 'twitter':
//         shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
//         break;
//       case 'whatsapp':
//         shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
//         break;
//       case 'telegram':
//         shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
//         break;
//       case 'sms':
//         shareUrl = `sms:?&body=${encodedText}%20${encodedUrl}`;
//         break;
//     }
    
//     if (shareUrl) {
//       window.open(shareUrl, '_blank');
//     }
//   };

//   return (
//     <div className="h-screen bg-[#f8f8f6] flex flex-col overflow-hidden text-[#111111] font-roboto">
//       <TopNav />

//       <div className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-10 pt-4 custom-scrollbar">
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-7xl mx-auto w-full flex flex-col gap-4 md:gap-6 pb-20"
//         >
//           {/* Header Badges */}
//           <div className="flex items-center gap-2 md:gap-3 flex-wrap px-1">
//             <button onClick={() => navigate(-1)} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-90">
//               <ArrowLeft size={18} />
//             </button>

//             <span
//               className="px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-widest border flex items-center gap-1.5 md:gap-2 shadow-sm"
//               style={{ backgroundColor: `${catColor}10`, color: catColor, borderColor: `${catColor}20` }}
//             >
//               <Zap size={14} fill={catColor} className="opacity-50" />
//               {prediction?.field?.fields || 'GENERAL'}
//             </span>

//             <span className={`px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-widest border flex items-center gap-1.5 md:gap-2 shadow-sm ${isClosed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
//               <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse ${isClosed ? 'bg-red-500' : 'bg-emerald-500'}`} />
//               {isClosed ? 'CLOSED' : 'OPEN'}
//             </span>

//             {isVotingClosed && !isClosed && (
//               <span className="px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-widest border flex items-center gap-1.5 md:gap-2 shadow-sm bg-amber-50 text-amber-600 border-amber-100">
//                 <Clock size={14} />
//                 VOTING CLOSED
//               </span>
//             )}

//             {prediction?.visibility === 'private' && (
//               <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-widest border shadow-sm bg-amber-50 text-amber-600 border-amber-100">
//                 <Lock size={14} />
//                 PRIVATE
//               </div>
//             )}

//             {currentUser?.id === prediction?.user_id && (
//               <Dialog open={editOpen} onOpenChange={setEditOpen}>
//                 <DialogTrigger asChild>
//                   {/* <button onClick={handleOpenEdit} className="px-3 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-widest border bg-white border-gray-100 hover:bg-gray-50 flex items-center gap-1.5 md:gap-2 shadow-sm transition-all active:scale-95">
//                     <Edit2 size={14} className="text-purple-500" />
//                     EDIT
//                   </button> */}
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[600px] bg-[#f8f8f6] border-none p-0 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
//                   <div className="p-5 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
//                     <div className="flex items-center gap-3 mb-6 md:mb-8">
//                       <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-200">
//                         <Edit2 size={20} className="text-white" />
//                       </div>
//                       <div>
//                         <h2 className="text-lg md:text-xl font-black text-[#111111] uppercase tracking-tighter">Edit Prediction</h2>
//                         <p className="text-[10px] md:text-[12px] text-[#667781] font-bold uppercase tracking-widest">Update details</p>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <SectionCard title="Core Details" icon={Zap} color="#a855f7">
//                         <div className="space-y-4">
//                           <div className="space-y-2">
//                             <SectionHeading>The Question</SectionHeading>
//                             <Input
//                               value={editForm.questions}
//                               onChange={(e) => setEditForm({ ...editForm, questions: e.target.value })}
//                               className="h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:ring-purple-500 text-sm"
//                               placeholder="What will happen?"
//                             />
//                           </div>

//                           <div className="space-y-2">
//                             <SectionHeading>Context / Description</SectionHeading>
//                             <Textarea
//                               value={editForm.description}
//                               onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
//                               className="min-h-[80px] md:min-h-[100px] rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:ring-purple-500 text-sm"
//                               placeholder="Add more details..."
//                             />
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                               <SectionHeading>Category</SectionHeading>
//                               <Select
//                                 value={editForm.field_id}
//                                 onValueChange={(val) => setEditForm({ ...editForm, field_id: val })}
//                               >
//                                 <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-sm">
//                                   <SelectValue placeholder="Select Category" />
//                                 </SelectTrigger>
//                                 <SelectContent className="rounded-xl md:rounded-2xl border-none shadow-xl">
//                                   {categories.map((cat) => (
//                                     <SelectItem key={cat.id} value={cat.id.toString()} className="font-bold">
//                                       {cat.fields.toUpperCase()}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                             <div className="space-y-2">
//                               <SectionHeading>Visibility</SectionHeading>
//                               <Select
//                                 value={editForm.visibility}
//                                 onValueChange={(val) => setEditForm({ ...editForm, visibility: val })}
//                               >
//                                 <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-sm">
//                                   <SelectValue placeholder="Select Visibility" />
//                                 </SelectTrigger>
//                                 <SelectContent className="rounded-xl md:rounded-2xl border-none shadow-xl">
//                                   <SelectItem value="public" className="font-bold uppercase">Public</SelectItem>
//                                   <SelectItem value="private" className="font-bold uppercase">Private</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </div>
//                         </div>
//                       </SectionCard>

//                       <SectionCard title="Deadlines" icon={Clock} color="#ec4899">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <SectionHeading>Validation Ends</SectionHeading>
//                             <Input
//                               type="date"
//                               value={editForm.voting_end_date}
//                               onChange={(e) => setEditForm({ ...editForm, voting_end_date: e.target.value })}
//                               className="h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-sm"
//                             />
//                           </div>
//                           <div className="space-y-2">
//                             <SectionHeading>Prediction Due</SectionHeading>
//                             <Input
//                               type="date"
//                               value={editForm.end_date}
//                               onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
//                               className="h-12 md:h-14 rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-sm"
//                             />
//                           </div>
//                         </div>
//                       </SectionCard>
//                     </div>

//                     <div className="mt-6 md:mt-8 flex gap-3">
//                       <Button
//                         variant="outline"
//                         onClick={() => setEditOpen(false)}
//                         className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest border-2"
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         onClick={handleUpdateQuestion}
//                         disabled={isUpdating}
//                         className="flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-100"
//                         style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
//                       >
//                         {isUpdating ? 'Saving...' : 'Update'}
//                       </Button>
//                     </div>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
//             {/* Left Column */}
//             <div className="lg:col-span-8 space-y-4 md:space-y-6">
//               {/* Banner Card */}
//               <div className="relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border bg-white min-h-[220px] md:min-h-[300px] flex items-center" style={{ borderLeft: `6px solid ${catColor}`, borderColor: `${catColor}20` }}>
//                 {/* Background Image from Online */}
//                 <div className="absolute inset-0 z-0">
//                   <img 
//                     src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
//                     className="w-full h-full object-cover opacity-10" 
//                     alt="Background"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
//                 </div>

//                 <div className="relative z-10 flex items-center justify-between p-6 md:p-12 w-full gap-4">
//                   <div className="space-y-4 md:space-y-6 flex-1 text-left">
//                     {/* <div className="space-y-1 md:space-y-2">
//                       <p className="text-[10px] md:text-[12px] font-black text-[#667781] uppercase tracking-[0.3em] opacity-80">Prediction</p>
//                       <div>
//                         <h1 className={`text-[16px] md:text-[18px] font-medium leading-relaxed text-[#111111] normal-case transition-all ${!isExpanded ? 'line-clamp-4' : ''}`}>
//                           {prediction.questions || 'Prediction'}
//                         </h1>
//                         <button 
//                           onClick={() => setIsExpanded(!isExpanded)}
//                           className="text-purple-600 text-sm font-bold mt-1 hover:underline flex items-center"
//                         >
//                           {isExpanded ? 'Show less' : '...'}
//                         </button>
//                       </div>
//                     </div> */}

//                     <div className="space-y-1 md:space-y-2">
//   <p className="text-[10px] md:text-[12px] font-black text-[#667781] uppercase tracking-[0.3em] opacity-80">Prediction</p>
  
//   <div>
//     {/* Question Text */}
//     <h1 
//       ref={questionRef}
//       className={`text-[16px] md:text-[18px] font-medium leading-relaxed text-[#111111] normal-case transition-all ${!isExpanded ? 'line-clamp-4' : ''}`}
//     >
//       {prediction.questions || 'Prediction'}
//     </h1>

//     {/* Show "..." only if text is longer than 4 lines */}
//     {needsExpansion && (
//       <button 
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="text-purple-600 text-sm font-bold mt-1 hover:underline flex items-center"
//       >
//         {isExpanded ? 'Show less' : '...'}
//       </button>
//     )}
//   </div>
// </div>
                    
//                     <div className="flex items-center gap-2.5">
//                       <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-white shadow-md">
//                         <AvatarImage src={prediction.user?.avatar_url} />
//                         <AvatarFallback className="text-[12px] font-black bg-gray-100">P</AvatarFallback>
//                       </Avatar>
//                       <span className="text-[14px] md:text-[16px] font-black text-[#667781] uppercase tracking-wider">@{prediction.user?.username || 'user'}</span>
//                     </div>
//                   </div>
//                   <div className="relative shrink-0 flex items-center justify-center">
//                     <img src={bannerImage} alt="Category Icon" className="w-24 h-24 md:w-36 md:h-36 object-contain drop-shadow-2xl animate-in zoom-in duration-1000" />
//                   </div>
//                   {showResultPill && (
//                     <div className={`absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-xl border font-black text-[10px] md:text-[12px] shadow-sm ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text} animate-in slide-in-from-top-4 duration-500 uppercase tracking-widest`}>
//                       {pillConfig.label} 
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Live Journey */}
//               <div className="relative rounded-[2rem] md:rounded-[2.5rem] px-5 py-6 md:px-8 md:py-10 border border-gray-100 bg-white shadow-lg overflow-hidden">
//                 <div className="absolute bottom-0 left-0 w-full h-40 opacity-[0.04] pointer-events-none" style={{
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ec4899' fill-opacity='1' d='M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,202.7C1200,181,1320,139,1380,117.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
//                   backgroundSize: 'cover'
//                 }}></div>

//                 <div className="relative z-10">
//                   <div className="flex items-center gap-2 mb-8 md:mb-10">
//                     <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-pink-50 flex items-center justify-center">
//                       <TrendingUp size={16} className="text-pink-500" />
//                     </div>
//                     <p className="text-[12px] md:text-[14px] font-black text-[#111111] uppercase tracking-[0.2em]">Live Journey</p>
//                   </div>

//                   <div className="relative px-4 md:px-6">
//                     <div className="absolute top-[18px] md:top-[20px] left-0 right-0 h-1 md:h-1.5 bg-gray-100 rounded-full" />
//                     <div
//                       className="absolute top-[18px] md:top-[20px] left-0 h-1 md:h-1.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
//                       style={{
//                         width: isClosed ? '100%' : (new Date() > new Date(prediction.voting_end_date) ? '66%' : '33%')
//                       }}
//                     />

//                     <div className="relative flex justify-between">
//                       {[
//                         { label: "Created", date: prediction.created_at, done: true },
//                         { label: "Prediction Due", date: prediction.end_date, done: isClosed },
//                         { label: "Validation Ends", date: prediction.voting_end_date, done: new Date() >= new Date(prediction.voting_end_date) },
//                       ].map((step, i) => (
//                         <div key={i} className="flex flex-col items-center text-center w-[30%] group">
//                           <div className={`w-9 h-9 md:w-10 md:h-10 z-10 flex items-center justify-center rounded-full text-[12px] md:text-[14px] transition-all duration-500 ring-4 md:ring-8 ring-white shadow-md ${step.done ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}>
//                             {step.done ? "✓" : i + 1}
//                           </div>
//                           <p className={`text-[10px] md:text-[12px] mt-3 md:mt-4 font-black uppercase tracking-tight ${step.done ? "text-[#111111]" : "text-[#667781]"}`}>{step.label}</p>
//                           <p className="text-[9px] md:text-[10px] text-[#667781] font-black uppercase tracking-widest mt-1 opacity-60">{formatDateCompact(step.date)}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Cast Forecast */}
//               <div className="relative rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 border border-gray-100 bg-white shadow-lg overflow-hidden">
//                 <div className="absolute bottom-0 left-0 w-full h-40 opacity-[0.05] pointer-events-none" style={{
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233b82f6' fill-opacity='1' d='M0,192L48,213.3C96,235,192,277,288,266.7C384,256,480,192,576,149.3C672,107,768,85,864,117.3C960,149,1056,235,1152,240C1248,245,1344,171,1392,133.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
//                   backgroundSize: 'cover'
//                 }}></div>

//                 <div className="relative z-10">
//                   <div className="flex items-center gap-2 mb-6 md:mb-8">
//                     <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 flex items-center justify-center">
//                       <Target size={16} className="text-blue-500" />
//                     </div>
//                     <h3 className="text-[12px] md:text-[14px] font-black text-[#111111] uppercase tracking-[0.2em]">{isClosed ? 'Official Verdict' : isVotingClosed ? 'Voting Ended' : 'Validate'}</h3>
//                   </div>

//                   {(!canVote) ? (
//                     <div className="text-center space-y-6 md:space-y-8">
//                       {isVotingClosed && !isClosed && (
//                         <div className="px-6 py-3 rounded-2xl border border-amber-200 bg-amber-50/50 text-amber-700 text-[12px] md:text-[13px] font-bold uppercase tracking-widest mb-4 inline-block">
//                           Voting period has ended — Result will be declared on {prediction.end_date ? format(new Date(prediction.end_date), 'dd MMM yyyy') : 'TBD'}
//                         </div>
//                       )}
//                       <div className={`px-8 py-3 md:px-10 md:py-4 rounded-2xl md:rounded-[2rem] border-2 font-black text-[16px] md:text-[20px] inline-block shadow-lg ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text} uppercase tracking-[0.3em]`}>
//                         {resultLabel}
//                       </div>
//                       {totalValidVotes > 0 && (
//                         <div className="max-w-xl mx-auto space-y-4 md:space-y-6">
//                           <div className="h-4 md:h-5 rounded-full overflow-hidden flex bg-gray-50 border border-gray-100 shadow-inner">
//                             <div style={{ width: `${agreePercentage}%` }} className="bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
//                             <div style={{ width: `${disagreePercentage}%` }} className="bg-rose-500 transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
//                             <div style={{ width: `${vaguePercentage}%` }} className="bg-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
//                           </div>
//                           <div className="flex justify-between text-[11px] md:text-[13px] font-black text-[#111111] tracking-[0.1em] px-1 uppercase">
//                             <span className="flex items-center gap-1.5 md:gap-3"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500 shadow-sm" /> YES {agreePercentage}%</span>
//                             <span className="flex items-center gap-1.5 md:gap-3"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-rose-500 shadow-sm" /> NO {disagreePercentage}%</span>
//                             <span className="flex items-center gap-1.5 md:gap-3"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500 shadow-sm" /> VAGUE {vaguePercentage}%</span>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ) : (
//                     <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
//                       <div className="flex-1 flex flex-col gap-3">
//                         <div className="grid grid-cols-3 gap-3 md:gap-4">
//                           {[
//                             { label: 'YES', icon: <CheckCircle2 className="text-emerald-500" />, color: 'text-emerald-500', bg: 'bg-emerald-50', tooltip: 'What was predicted has happened.' },
//                             { label: 'NO', icon: <XCircle className="text-rose-500" />, color: 'text-rose-500', bg: 'bg-rose-50', tooltip: 'What was predicted didnt happened.' },
//                             { label: 'VAGUE', icon: <HelpCircle className="text-amber-500" />, color: 'text-amber-500', bg: 'bg-amber-50', tooltip: ' What was predicted cannot be assessed or generic or cant be confirmed as success or failure.' }
//                           ].map((opt) => (
//                             <button
//                               key={opt.label}
//                               onClick={() => setSelectedAnswer(opt.label)}
//                               className={`flex flex-col items-center justify-center gap-3 md:gap-5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all shadow-md group active:scale-95 ${selectedAnswer === opt.label
//                                   ? "bg-[#111111] text-white border-[#111111] scale-[1.05] z-10"
//                                   : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg"
//                                 }`}
//                             >
//                               <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center transition-all ${selectedAnswer === opt.label ? 'bg-white/10 rotate-12' : opt.bg + ' group-hover:scale-110'}`}>
//                                 <div className="scale-75 md:scale-100">
//                                   {opt.icon}
//                                 </div>
//                               </div>
//                               <span className={`text-[12px] md:text-[14px] font-black tracking-[0.3em] ${selectedAnswer === opt.label ? 'text-white' : opt.color}`}>{opt.label}</span>
//                             </button>
//                           ))}
//                         </div>
//                         {selectedAnswer && (
//                           <div className="text-center w-full animate-in fade-in slide-in-from-top-2">
//                             <span className="text-[12px] font-bold text-[#667781] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 inline-block shadow-sm">
//                               {selectedAnswer === 'YES' ? 'What was predicted has happened.' : selectedAnswer === 'NO' ? 'What was predicted didnt happened.' : ' What was predicted cannot be assessed or generic or cant be confirmed as success or failure.'}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                       <Button
//                         className="h-16 md:h-auto md:w-56 rounded-[1.5rem] md:rounded-[2.5rem] text-[16px] md:text-[18px] font-black tracking-[0.3em] shadow-2xl flex flex-row md:flex-col items-center justify-center gap-3 p-4 md:p-8 transition-all hover:scale-[1.05] active:scale-[0.98] border-none group"
//                         onClick={handleVote}
//                         disabled={submitting || !selectedAnswer || hasVoted}
//                         style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
//                       >
//                         <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-all">
//                           <Send size={20} className="md:w-8 md:h-8 text-white" />
//                         </div>
//                         {submitting ? '...' : 'SUBMIT'}
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column (Sidebar) */}
//             <div className="lg:col-span-4 space-y-4 md:space-y-6">
//               {/* Analytics */}
//               <div className="rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 border border-gray-100 bg-white shadow-xl overflow-hidden relative">
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
//                 <div className="flex items-center gap-2 mb-6 md:mb-8">
//                   <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 flex items-center justify-center">
//                     <BarChart3 size={16} className="text-blue-500" />
//                   </div>
//                   <p className="text-[14px] md:text-[16px] font-black text-[#111111] uppercase tracking-widest">Analytics</p>
//                 </div>
                
//                 <div className="space-y-3 md:space-y-4">
//                   <div className="flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] bg-blue-50/40 border border-blue-50 group hover:bg-blue-50 transition-all">
//                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-blue-100">
//                       <Calendar size={22} className="md:w-6 md:h-6 text-blue-500" />
//                     </div>
//                     <div>
//                       <p className="text-[#667781] text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Timeline</p>
//                       <p className="text-[14px] md:text-[16px] font-black text-[#111111] tracking-tight">
//                         {formatDateCompact(prediction.voting_end_date)} | {formatDateCompact(prediction.end_date)}
//                       </p>
//                       <p className="text-[9px] md:text-[10px] text-[#667781] font-black uppercase tracking-tight opacity-50 mt-1">Ends | Due</p>
//                     </div>
//                   </div>

//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <button className="w-full flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] bg-purple-50/40 border border-purple-50 group hover:bg-purple-50 transition-all cursor-pointer">
//                         <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-purple-100">
//                           <Users size={22} className="md:w-6 md:h-6 text-purple-500" />
//                         </div>
//                         <div className="flex-1 flex justify-between items-center text-left">
//                           <p className="text-[13px] md:text-[14px] font-black text-[#111111] uppercase tracking-wide">Validated By</p>
//                           <p className="text-[20px] md:text-[26px] font-black text-[#111111]">{totalValidVotes}</p>
//                         </div>
//                       </button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[400px] bg-white border-none p-0 overflow-hidden rounded-[2rem] shadow-2xl">
//                       <div className="p-6">
//                         <DialogHeader>
//                           <DialogTitle className="text-lg font-black text-[#111111] uppercase tracking-tighter mb-4">
//                             Validated By
//                           </DialogTitle>
//                         </DialogHeader>
//                         <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
//                           {answers.length > 0 ? (
//                             answers.map((answer: any, idx: number) => (
//                               <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
//                                 <Avatar className="w-10 h-10 border border-gray-100">
//                                   <AvatarImage src={answer.user?.avatar_url} />
//                                   <AvatarFallback className="font-bold bg-purple-50 text-purple-600">
//                                     {answer.user?.username?.charAt(0)?.toUpperCase() || 'U'}
//                                   </AvatarFallback>
//                                 </Avatar>
//                                 <div className="flex-1">
//                                   <p className="text-sm font-bold text-[#111111]">@{answer.user?.username || 'user'}</p>
//                                   <p className="text-xs font-semibold text-gray-500">{answer.user?.name || ''}</p>
//                                 </div>
//                                 <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${
//                                   answer.answer?.toLowerCase() === 'yes' ? 'bg-emerald-50 text-emerald-600' :
//                                   answer.answer?.toLowerCase() === 'no' ? 'bg-rose-50 text-rose-600' :
//                                   'bg-amber-50 text-amber-600'
//                                 }`}>
//                                   {answer.answer}
//                                 </span>
//                               </div>
//                             ))
//                           ) : (
//                             <p className="text-center text-sm font-bold text-gray-400 py-4">No voters yet</p>
//                           )}
//                         </div>
//                       </div>
//                     </DialogContent>
//                   </Dialog>

//                   <div className="flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] bg-emerald-50/40 border border-emerald-50 group hover:bg-emerald-50 transition-all">
//                     <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-emerald-100">
//                       <ShieldCheck size={22} className="md:w-6 md:h-6 text-emerald-500" />
//                     </div>
//                     <div className="flex-1 flex justify-between items-center">
//                       <p className="text-[13px] md:text-[14px] font-black text-[#111111] uppercase tracking-wide">Status</p>
//                       <p className={`text-[14px] md:text-[16px] font-black uppercase tracking-widest ${isClosed ? 'text-rose-600' : 'text-emerald-600'}`}>
//                         {isClosed ? 'Closed' : 'Active'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Creator Card */}
//               <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-white group">
//                 <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
//                 <div className="relative z-10 p-6 md:p-8">
//                   <div className="flex items-center gap-4 md:gap-5 mb-8 md:mb-10">
//                     <Avatar className="w-14 h-14 md:w-16 md:h-16 ring-4 ring-gray-50 shadow-xl">
//                       <AvatarImage src={prediction.user?.avatar_url} />
//                       <AvatarFallback className="text-xl md:text-2xl font-black bg-gray-100 text-gray-400">P</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <div className="flex items-center gap-1.5">
//                         <p className="text-[16px] md:text-[18px] font-black text-[#111111]">@{prediction.user?.username || 'user'}</p>
//                         <ShieldCheck size={14} className="text-purple-500 fill-purple-500/10" />
//                       </div>
//                       <p className="text-[9px] md:text-[10px] mt-1 font-black uppercase tracking-widest text-[#667781]">Verified Creator</p>
//                     </div>
//                   </div>

//                     <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
//                       <div className="space-y-2 md:space-y-3">
//                         <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center mx-auto shadow-sm">
//                           <BarChart3 size={16} className="text-blue-500" />
//                         </div>
//                         <div>
//                           <p className="text-[16px] md:text-[18px] font-black text-[#111111]">{prediction.user?.total_forecasts ?? 0}</p>
//                           <p className="text-[9px] md:text-[10px] text-[#667781] font-black uppercase tracking-widest opacity-60">Forecasts</p>
//                         </div>
//                       </div>
//                       <div className="space-y-2 md:space-y-3">
//                         <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto shadow-sm">
//                           <Target size={16} className="text-emerald-500" />
//                         </div>
//                         <div>
//                           <p className="text-[16px] md:text-[18px] font-black text-emerald-600">{prediction.user?.accuracy ?? 0}%</p>
//                           <p className="text-[9px] md:text-[10px] text-[#667781] font-black uppercase tracking-widest opacity-60">Accuracy</p>
//                         </div>
//                       </div>
//                       <div className="space-y-2 md:space-y-3">
//                         <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-amber-50 flex items-center justify-center mx-auto shadow-sm">
//                           <Trophy size={16} className="text-amber-500" />
//                         </div>
//                         <div>
//                           <p className="text-[16px] md:text-[18px] font-black text-amber-600">{prediction.user?.total_points ?? 0}</p>
//                           <p className="text-[9px] md:text-[10px] text-[#667781] font-black uppercase tracking-widest opacity-60">Points</p>
//                         </div>
//                       </div>
//                     </div>
//                 </div>
//               </div>

//               {/* Broadcast */}
//               <div className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 bg-white shadow-xl overflow-hidden relative group" style={{ borderLeft: `6px solid #f59e0b` }}>
//                 <div className="flex items-center gap-3 mb-6 md:mb-8">
//                   <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-50 flex items-center justify-center">
//                     <Send size={16} className="text-amber-600" />
//                   </div>
//                   <p className="text-[14px] md:text-[16px] font-black text-[#111111] uppercase tracking-widest">Broadcast</p>
//                 </div>
                
//                 <div className="flex justify-between gap-3 md:gap-4">
//                   {[
//                     { icon: <Twitter size={20} />, color: 'text-blue-400', platform: 'twitter' },
//                     { icon: <MessageCircle size={20} />, color: 'text-emerald-500', platform: 'whatsapp' },
//                     { icon: <Send size={20} />, color: 'text-blue-500', platform: 'telegram' },
//                     { icon: <MessageSquare size={20} />, color: 'text-purple-500', platform: 'sms' },
//                     { icon: <Link2 size={20} />, color: 'text-amber-600', platform: 'native' }
//                   ].map((btn, i) => (
//                     <button 
//                       key={i} 
//                       onClick={() => handleShare(btn.platform)}
//                       className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-md transition-all border border-gray-100 flex items-center justify-center hover:-translate-y-1"
//                     >
//                       <div className={btn.color}>{btn.icon}</div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }










import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import { Twitter, Send, MessageCircle, Link2, BarChart3, Calendar, Zap, ShieldCheck, TrendingUp, Trophy, ArrowLeft, Clock, Target, Users, Lock, CheckCircle2, XCircle, HelpCircle, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';
import { getAuth, postAuth, putAuth } from '@/util/api';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Edit2 } from 'lucide-react';
import sports from '../../../../public/bgimg/sports-1.png';
import politics from '../../../../public/bgimg/politics.png';
import tech from '../../../../public/bgimg/tech.png';
import sm from '../../../../public/bgimg/sharemarket.png';
import movie from '../../../../public/bgimg/movie.png';
import general from '../../../../public/bgimg/general.png';

const SectionCard = ({ children, title, icon: Icon, color = "#a855f7" }: { children: React.ReactNode, title: string, icon: any, color?: string }) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden" style={{ borderLeft: `3px solid ${color}` }}>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-1">{children}</p>
);

const categoryColors: Record<string, string> = {
  trending: '#a855f7', politics: '#ef4444', sports: '#10b981', finance: '#fbbf24',
  education: '#06b6d4', entertainment: '#ec4899', technology: '#06b6d4',
  sharemarket: '#fbbf24', 'share market': '#fbbf24', 'movies/entertainment': '#ec4899',
};

function getResultLabel(totalVotes: number, agreeP: number, disagreeP: number, vagueP: number): string {
  if (totalVotes === 0) return 'No votes yet';
  const margin = Math.abs(agreeP - disagreeP);
  if (vagueP > agreeP && vagueP > disagreeP) return 'Vague';
  if (margin <= 5 && vagueP < 40) return 'Too close to call';
  if (agreeP > disagreeP && agreeP > vagueP) return 'Successful';
  if (disagreeP > agreeP && disagreeP > vagueP) return 'Failure';
  return 'Too close to call';
}

function getOutcomeFromLabel(label: string): 'yes' | 'no' | 'vague' {
  const l = label.toLowerCase();
  if (l.includes('successful') || l.includes('yes')) return 'yes';
  if (l.includes('failure') || l.includes('no')) return 'no';
  return 'vague';
}

export function PredictionDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    questions: '', description: '', field_id: '', visibility: 'public', end_date: '', voting_end_date: ''
  });

  const { user: currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAuth('/api/fields');
        if (res.status) setCategories(res.fields);
      } catch (err) { console.error('Failed to fetch categories', err); }
    };
    fetchCategories();
  }, []);

  const handleOpenEdit = () => {
    setEditForm({
      questions: prediction.questions || '', description: prediction.description || '',
      field_id: prediction.field_id?.toString() || '', visibility: prediction.visibility || 'public',
      end_date: prediction.end_date?.split(' ')[0] || '', voting_end_date: prediction.voting_end_date?.split(' ')[0] || ''
    });
    setEditOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editForm.questions.trim()) { toast.error('Question is required'); return; }
    setIsUpdating(true);
    try {
      const res = await putAuth(`/api/predictions/${id}`, editForm);
      if (res.status) {
        toast.success('Prediction updated successfully');
        setEditOpen(false);
        const refreshed = await getAuth(`/api/predictions/${id}`);
        setPrediction(refreshed);
      } else { toast.error(res.message || 'Update failed'); }
    } catch (err: any) { toast.error(err.message || 'An error occurred'); }
    finally { setIsUpdating(false); }
  };

  const formatDateCompact = (dateStr?: string | null) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBD';
    return format(date, 'dd MMM');
  };

  useEffect(() => {
    if (!id) { setFetchError('No prediction ID provided'); setLoading(false); return; }
    const fetchPrediction = async () => {
      try {
        setLoading(true); setFetchError(null);
        const data = await getAuth(`/api/predictions/${id}`);
        setPrediction(data);
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load prediction');
        toast.error('Could not load prediction');
      } finally { setLoading(false); }
    };
    fetchPrediction();
  }, [id]);

  useEffect(() => {
    if (!questionRef.current || !prediction?.questions) return;
    setIsExpanded(false);
    const timer = setTimeout(() => {
      const element = questionRef.current!;
      setNeedsExpansion(element.scrollHeight > element.clientHeight + 2);
    }, 100);
    return () => clearTimeout(timer);
  }, [prediction?.questions]);

  const handleVote = async () => {
    if (!selectedAnswer) { toast.error('Please select an answer'); return; }
    setSubmitting(true);
    let finalAnswer = selectedAnswer.trim();
    if (prediction?.options && Array.isArray(prediction.options)) {
      const match = prediction.options.find((opt: string) => opt.toLowerCase() === selectedAnswer.toLowerCase());
      finalAnswer = match || selectedAnswer.charAt(0).toUpperCase() + selectedAnswer.slice(1).toLowerCase();
    } else {
      finalAnswer = selectedAnswer.charAt(0).toUpperCase() + selectedAnswer.slice(1).toLowerCase();
    }
    try {
      await postAuth('/api/answers', { question_id: id, answer: finalAnswer });
      toast.success('Vote submitted successfully!');
      setSelectedAnswer('');
      const refreshed = await getAuth(`/api/predictions/${id}`);
      if (refreshed) setPrediction(refreshed);
    } catch (err: any) { toast.error(err.message || 'Failed to submit vote'); }
    finally { setSubmitting(false); }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `🤔 Predict now on iSaidSo!\n\nQuestion: ${prediction?.questions}\n\nCast your vote and see what others think 👇`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    if (platform === 'native') {
      if (navigator.share) {
        try { await navigator.share({ title: 'iSaidSo Prediction', text, url }); }
        catch (err) { console.error('Error sharing:', err); }
      } else {
        try { await navigator.clipboard.writeText(`${text} ${url}`); toast.success('Link copied to clipboard!'); }
        catch (err) { toast.error('Failed to copy link'); }
      }
      return;
    }
    let shareUrl = '';
    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`; break;
      case 'telegram': shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`; break;
      case 'sms': shareUrl = `sms:?&body=${encodedText}%20${encodedUrl}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-xs font-bold uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (fetchError || !prediction) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex flex-col items-center justify-center gap-3 p-6">
        <h2 className="text-base font-bold text-red-500 uppercase">Error</h2>
        <p className="text-gray-500 text-xs text-center font-semibold">{fetchError || 'Not found'}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="h-9 px-5 rounded-xl text-xs font-bold">Back</Button>
      </div>
    );
  }

  const answers = Array.isArray(prediction?.answers) ? prediction.answers : [];
  const yesCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
  const noCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
  const vagueCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'vague').length;
  const totalValidVotes = yesCount + noCount + vagueCount;

  const agreePercentage = totalValidVotes > 0 ? Math.round((yesCount / totalValidVotes) * 100) : 0;
  const disagreePercentage = totalValidVotes > 0 ? Math.round((noCount / totalValidVotes) * 100) : 0;
  const vaguePercentage = totalValidVotes > 0 ? Math.round((vagueCount / totalValidVotes) * 100) : 0;

  const isClosed = prediction?.end_date ? new Date(prediction.end_date) < new Date() : false;
  const isVotingClosed = prediction?.voting_end_date ? new Date(prediction.voting_end_date) < new Date() : isClosed;
  const canVote = !isVotingClosed;
  const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);

  const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';
  const resultLabel = getResultLabel(totalValidVotes, agreePercentage, disagreePercentage, vaguePercentage);
  const outcome = getOutcomeFromLabel(resultLabel);

  const pillConfig = {
    yes: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: <CheckCircle2 size={15} /> },
    no: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: <XCircle size={15} /> },
    vague: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: <span className="text-[13px] font-black leading-none">—</span> },
  }[outcome];

  const showResultPill = isClosed || isVotingClosed || hasVoted;

  const categoryImages: Record<string, string> = {
    "SHAREMARKET": sm, "SHARE MARKET": sm, 'MOVIES/ENTERTAINMENT': movie,
    POLITICS: politics, SPORTS: sports, TECHNOLOGY: tech, GENERAL: general,
  };
  const currentCat = prediction?.field?.fields?.toUpperCase() || 'GENERAL';
  const bannerImage = categoryImages[currentCat] || categoryImages['GENERAL'];

  // Share buttons config (used in question card bottom-right)
  const shareButtons = [
    { icon: <Twitter size={14} />, color: 'text-blue-400', platform: 'twitter' },
    { icon: <MessageCircle size={14} />, color: 'text-emerald-500', platform: 'whatsapp' },
    { icon: <Send size={14} />, color: 'text-blue-500', platform: 'telegram' },
    { icon: <MessageSquare size={14} />, color: 'text-purple-500', platform: 'sms' },
    { icon: <Link2 size={14} />, color: 'text-amber-600', platform: 'native' },
  ];

  return (
    <div className="h-screen bg-[#f8f8f6] flex flex-col overflow-hidden text-gray-900">
      <TopNav />

      <div className="flex-1 overflow-y-auto px-3 md:px-6 lg:px-10 pt-3 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto w-full flex flex-col gap-3 md:gap-4 pb-20"
        >

          {/* ── Header Badges ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-90"
            >
              <ArrowLeft size={15} />
            </button>

            <span
              className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 shadow-sm"
              style={{ backgroundColor: `${catColor}10`, color: catColor, borderColor: `${catColor}25` }}
            >
              <Zap size={11} fill={catColor} className="opacity-60" />
              {prediction?.field?.fields || 'GENERAL'}
            </span>

            <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 shadow-sm ${isClosed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              {isClosed ? 'CLOSED' : 'OPEN'}
            </span>

            {isVotingClosed && !isClosed && (
              <span className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 shadow-sm bg-amber-50 text-amber-600 border-amber-100">
                <Clock size={11} />VOTING CLOSED
              </span>
            )}

            {prediction?.visibility === 'private' && (
              <span className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1">
                <Lock size={11} />PRIVATE
              </span>
            )}

            {currentUser?.id === prediction?.user_id && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  {/* <button onClick={handleOpenEdit} className="px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border bg-white border-gray-200 hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-all active:scale-95">
                    <Edit2 size={11} className="text-purple-500" />EDIT
                  </button> */}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px] bg-[#f8f8f6] border-none p-0 overflow-hidden rounded-3xl shadow-2xl">
                  <div className="p-5 md:p-7 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
                        <Edit2 size={16} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">Edit Prediction</h2>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Update details</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <SectionCard title="Core Details" icon={Zap} color="#a855f7">
                        <div className="space-y-3">
                          <div><SectionHeading>The Question</SectionHeading>
                            <Input value={editForm.questions} onChange={(e) => setEditForm({ ...editForm, questions: e.target.value })} className="h-10 rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold" placeholder="What will happen?" />
                          </div>
                          <div><SectionHeading>Context / Description</SectionHeading>
                            <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="min-h-[72px] rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold" placeholder="Add more details..." />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><SectionHeading>Category</SectionHeading>
                              <Select value={editForm.field_id} onValueChange={(val) => setEditForm({ ...editForm, field_id: val })}>
                                <SelectTrigger className="h-10 rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold"><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                  {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()} className="font-semibold">{cat.fields.toUpperCase()}</SelectItem>))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div><SectionHeading>Visibility</SectionHeading>
                              <Select value={editForm.visibility} onValueChange={(val) => setEditForm({ ...editForm, visibility: val })}>
                                <SelectTrigger className="h-10 rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold"><SelectValue placeholder="Visibility" /></SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                  <SelectItem value="public" className="font-semibold">Public</SelectItem>
                                  <SelectItem value="private" className="font-semibold">Private</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </SectionCard>
                      <SectionCard title="Deadlines" icon={Clock} color="#ec4899">
                        <div className="grid grid-cols-2 gap-3">
                          <div><SectionHeading>Validation Ends</SectionHeading>
                            <Input type="date" value={editForm.voting_end_date} onChange={(e) => setEditForm({ ...editForm, voting_end_date: e.target.value })} className="h-10 rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold" />
                          </div>
                          <div><SectionHeading>Prediction Due</SectionHeading>
                            <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} className="h-10 rounded-xl border-gray-100 bg-gray-50 text-sm font-semibold" />
                          </div>
                        </div>
                      </SectionCard>
                    </div>
                    <div className="mt-5 flex gap-2.5">
                      <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 h-10 rounded-xl font-bold uppercase tracking-widest text-xs border-2">Cancel</Button>
                      <Button onClick={handleUpdateQuestion} disabled={isUpdating} className="flex-[2] h-10 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-purple-100" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                        {isUpdating ? 'Saving...' : 'Update'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-start">

            {/* ── Left Column ── */}
            <div className="lg:col-span-8 space-y-3 md:space-y-4">

              {/* ── Banner / Question Card ── category image as faint background ── */}
              <div
                className="relative w-full rounded-2xl overflow-hidden border bg-white"
                style={{ borderLeft: `4px solid ${catColor}`, borderColor: `${catColor}20` }}
              >
                {/* Category image — faint background, right-aligned */}
                <div className="absolute inset-0 z-0 flex items-center justify-end pointer-events-none">
                  <img
                    src={bannerImage}
                    alt=""
                    className="h-full w-auto object-contain opacity-[0.07] translate-x-6"
                    style={{ maxWidth: '55%' }}
                  />
                  {/* left-to-right fade so text stays readable */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 py-4 md:px-5 md:py-5">
                  {/* Top row: question text + result pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prediction</p>
                      <h1
                        ref={questionRef}
                        className={`text-[14px] md:text-[15px] font-semibold leading-snug text-gray-900 ${!isExpanded ? 'line-clamp-3' : ''}`}
                      >
                        {prediction.questions || 'Prediction'}
                      </h1>
                      {needsExpansion && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-purple-600 text-[11px] font-bold mt-1 hover:underline">
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                    {showResultPill && (
                      <span className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center shadow-sm ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text}`}>
                        {pillConfig.icon}
                      </span>
                    )}
                  </div>

                  {/* Creator row */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6 border border-white shadow-sm">
                      <AvatarImage src={prediction.user?.avatar_url} />
                      <AvatarFallback className="text-[10px] font-bold bg-gray-100">P</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-bold text-gray-500">@{prediction.user?.username || 'user'}</span>
                  </div>

                  {/* Bottom row: share buttons pinned to bottom-right */}
                  <div className="flex items-center justify-between">
                    {/* left spacer / optional tag */}
                    <div />
                    {/* Share icons */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mr-1">Share</span>
                      {shareButtons.map((btn, i) => (
                        <button
                          key={i}
                          onClick={() => handleShare(btn.platform)}
                          className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
                        >
                          <span className={btn.color}>{btn.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Live Journey — medium size ── */}
              <div className="relative rounded-2xl px-4 py-4 md:px-5 md:py-5 border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center">
                    <TrendingUp size={13} className="text-pink-500" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Live Journey</p>
                </div>

                <div className="relative px-4">
                  {/* track */}
                  <div className="absolute top-[17px] left-4 right-4 h-[3px] bg-gray-100 rounded-full" />
                  {/* progress */}
                  <div
                    className="absolute top-[17px] left-4 h-[3px] bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: isClosed ? 'calc(100% - 2rem)' : (new Date() > new Date(prediction.voting_end_date) ? 'calc(66% - 1.3rem)' : 'calc(33% - 1.3rem)') }}
                  />
                  <div className="relative flex justify-between">
                    {[
                      { label: "Created", date: prediction.created_at, done: true },
                      { label: "Prediction Due", date: prediction.end_date, done: isClosed },
                      { label: "Validation Ends", date: prediction.voting_end_date, done: new Date() >= new Date(prediction.voting_end_date) },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center w-[30%]">
                        <div className={`w-[34px] h-[34px] z-10 flex items-center justify-center rounded-full text-[11px] font-bold ring-[3px] ring-white shadow-sm transition-all ${step.done ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <p className={`text-[10px] mt-2 font-bold uppercase tracking-tight leading-tight ${step.done ? "text-gray-800" : "text-gray-400"}`}>{step.label}</p>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">{formatDateCompact(step.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Cast Forecast ── */}
              <div className="relative rounded-2xl p-4 md:p-5 border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <Target size={13} className="text-blue-500" />
                  </div>
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                    {isClosed ? 'Official Verdict' : isVotingClosed ? 'Voting Ended' : 'Validate'}
                  </h3>
                </div>

                {!canVote ? (
                  <div className="text-center space-y-4">
                    {isVotingClosed && !isClosed && (
                      <div className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-widest inline-block">
                        Voting ended — Result declared on {prediction.end_date ? format(new Date(prediction.end_date), 'dd MMM yyyy') : 'TBD'}
                      </div>
                    )}
                    <div className={`px-5 py-2.5 rounded-xl border-2 font-bold text-sm inline-flex items-center gap-2 shadow-sm ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text} uppercase tracking-widest`}>
                      {pillConfig.icon}
                      {resultLabel}
                    </div>
                    {totalValidVotes > 0 && (
                      <div className="max-w-xl mx-auto space-y-3">
                        <div className="h-3 rounded-full overflow-hidden flex bg-gray-50 border border-gray-100">
                          <div style={{ width: `${agreePercentage}%` }} className="bg-emerald-500 transition-all duration-1000" />
                          <div style={{ width: `${disagreePercentage}%` }} className="bg-rose-500 transition-all duration-1000" />
                          <div style={{ width: `${vaguePercentage}%` }} className="bg-amber-400 transition-all duration-1000" />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" />YES {agreePercentage}%</span>
                          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" />NO {disagreePercentage}%</span>
                          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" />VAGUE {vaguePercentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'YES', icon: <CheckCircle2 size={16} className="text-emerald-500" />, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Prediction happened.' },
                          { label: 'NO', icon: <XCircle size={16} className="text-rose-500" />, color: 'text-rose-600', bg: 'bg-rose-50', desc: "Prediction didn't happen." },
                          { label: 'VAGUE', icon: <HelpCircle size={16} className="text-amber-500" />, color: 'text-amber-600', bg: 'bg-amber-50', desc: "Can't be confirmed." }
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => setSelectedAnswer(opt.label)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-2xl border-2 transition-all shadow-sm active:scale-95 ${selectedAnswer === opt.label
                              ? "bg-gray-900 text-white border-gray-900 scale-[1.03]"
                              : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedAnswer === opt.label ? 'bg-white/15' : opt.bg}`}>
                              {opt.icon}
                            </div>
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${selectedAnswer === opt.label ? 'text-white' : opt.color}`}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                      {selectedAnswer && (
                        <div className="text-center animate-in fade-in slide-in-from-top-1">
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">
                            {selectedAnswer === 'YES' ? 'Prediction happened.' : selectedAnswer === 'NO' ? "Prediction didn't happen." : "Can't be confirmed as success or failure."}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="h-12 md:h-auto md:w-40 rounded-2xl text-sm font-bold tracking-widest shadow-xl flex flex-row md:flex-col items-center justify-center gap-2 p-3 md:p-5 transition-all hover:scale-[1.03] active:scale-[0.97] border-none"
                      onClick={handleVote}
                      disabled={submitting || !selectedAnswer || hasVoted}
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                    >
                      <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                        <Send size={14} className="text-white" />
                      </div>
                      {submitting ? '...' : 'SUBMIT'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="lg:col-span-4 space-y-3 md:space-y-4">

              {/* Analytics */}
              <div className="rounded-2xl p-4 md:p-5 border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <BarChart3 size={13} className="text-blue-500" />
                  </div>
                  <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">Analytics</p>
                </div>

                <div className="space-y-2">
                  {/* Timeline */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-50 hover:bg-blue-50 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-blue-100">
                      <Calendar size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Timeline</p>
                      <p className="text-[12px] font-bold text-gray-900">{formatDateCompact(prediction.voting_end_date)} | {formatDateCompact(prediction.end_date)}</p>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Ends | Due</p>
                    </div>
                  </div>

                  {/* Validated By */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-50 hover:bg-purple-50 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-purple-100">
                          <Users size={14} className="text-purple-500" />
                        </div>
                        <div className="flex-1 flex justify-between items-center text-left">
                          <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">Validated By</p>
                          <p className="text-[17px] font-bold text-gray-900">{totalValidVotes}</p>
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[380px] bg-white border-none p-0 overflow-hidden rounded-3xl shadow-2xl">
                      <div className="p-5">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-3">Validated By</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
                          {answers.length > 0 ? answers.map((answer: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                              <Avatar className="w-8 h-8 border border-gray-100">
                                <AvatarImage src={answer.user?.avatar_url} />
                                <AvatarFallback className="text-[10px] font-bold bg-purple-50 text-purple-600">{answer.user?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">@{answer.user?.username || 'user'}</p>
                                <p className="text-[10px] font-medium text-gray-400 truncate">{answer.user?.name || ''}</p>
                              </div>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${answer.answer?.toLowerCase() === 'yes' ? 'bg-emerald-50 text-emerald-600' : answer.answer?.toLowerCase() === 'no' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                {answer.answer}
                              </span>
                            </div>
                          )) : (
                            <p className="text-center text-xs font-semibold text-gray-400 py-4">No voters yet</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Status */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-50 hover:bg-emerald-50 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-emerald-100">
                      <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <p className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">Status</p>
                      <p className={`text-[11px] font-bold uppercase tracking-widest ${isClosed ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isClosed ? 'Closed' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="p-4 pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 ring-2 ring-gray-50 shadow-md">
                      <AvatarImage src={prediction.user?.avatar_url} />
                      <AvatarFallback className="text-base font-bold bg-gray-100 text-gray-400">P</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[13px] font-bold text-gray-900">@{prediction.user?.username || 'user'}</p>
                        <ShieldCheck size={11} className="text-purple-500" />
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Verified Creator</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: <BarChart3 size={13} className="text-blue-500" />, bg: 'bg-blue-50', value: prediction.user?.total_forecasts ?? 0, label: 'Forecasts', color: 'text-gray-900' },
                      { icon: <Target size={13} className="text-emerald-500" />, bg: 'bg-emerald-50', value: `${prediction.user?.accuracy ?? 0}%`, label: 'Accuracy', color: 'text-emerald-600' },
                      { icon: <Trophy size={13} className="text-amber-500" />, bg: 'bg-amber-50', value: prediction.user?.total_points ?? 0, label: 'Points', color: 'text-amber-600' },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className={`w-7 h-7 rounded-xl ${stat.bg} flex items-center justify-center mx-auto`}>{stat.icon}</div>
                        <p className={`text-[13px] font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}