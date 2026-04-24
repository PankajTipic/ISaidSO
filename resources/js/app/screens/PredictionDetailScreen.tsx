// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import {
//   ArrowLeft,
//   Clock,
//   ThumbsUp,
//   ThumbsDown,
//   Target,
//   CheckCircle2,
//   Users,
//   Globe,
//   Lock,
//   Share2,
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { useAppSelector } from '@/app/store/hooks';
// import { getAuth, postAuth } from '@/util/api';

// const categoryColors: Record<string, string> = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };

// function computeOutcome(agreeP: number, disagreeP: number, vagueP: number): 'yes' | 'no' | 'vague' {
//   // Vague wins if it is the dominant option
//   if (vagueP > agreeP && vagueP > disagreeP) return 'vague';
//   const margin = Math.abs(agreeP - disagreeP);
//   if (margin < 10) return 'vague'; // too close
//   return agreeP > disagreeP ? 'yes' : 'no';
// }

// function getResultLabel(
//   totalVotes: number,
//   agreeP: number,
//   disagreeP: number,
//   vagueP: number,
// ): string {
//   if (totalVotes === 0) return 'No votes yet';

//   const leading = Math.max(agreeP, disagreeP, vagueP);
//   const margin = Math.abs(agreeP - disagreeP);

//   // --- Vague / Unclear dominant ---
//   if (vagueP > agreeP && vagueP > disagreeP) {
//     if (vagueP >= 85) return `Overwhelmingly unclear (${vagueP}%)`;
//     if (vagueP >= 60) return `Clearly unclear (${vagueP}% unclear)`;
//     if (vagueP >= 45) return `Leaning unclear (${vagueP}% unclear)`;
//   }

//   // --- Too close between YES and NO ---
//   if (margin <= 5 && vagueP < 40) {
//     return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
//   }

//   // --- Highly split (both YES and NO roughly equal, vague not dominant) ---
//   if (margin <= 3) return 'Highly uncertain (votes are split)';

//   // --- YES leaning ---
//   if (agreeP > disagreeP && agreeP > vagueP) {
//     if (agreeP >= 85) return `Overwhelming YES (${agreeP}%)`;
//     if (agreeP >= 60) return `Clear YES (${agreeP}% vs ${disagreeP}%)`;
//     return `Leaning YES (${agreeP}% vs ${disagreeP}%)`;
//   }

//   // --- NO leaning ---
//   if (disagreeP > agreeP && disagreeP > vagueP) {
//     if (disagreeP >= 85) return `Overwhelming NO (${disagreeP}%)`;
//     if (disagreeP >= 60) return `Clear NO (${disagreeP}% vs ${agreeP}%)`;
//     return `Leaning NO (${disagreeP}% vs ${agreeP}%)`;
//   }

//   return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
// }

// function getOutcomeFromLabel(label: string): 'yes' | 'no' | 'vague' {
//   const l = label.toLowerCase();
//   if (l.includes('yes')) return 'yes';
//   if (l.includes('no')) return 'no';
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

//   const { user: currentUser } = useAppSelector((state) => state.auth);

//   const formatDateCompact = (dateStr?: string | null) => {
//     if (!dateStr) return 'TBD';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return 'TBD';
//     return format(date, 'dd MMM');
//   };

//   useEffect(() => {
//     if (!id) {
//       setFetchError('No prediction ID provided');
//       setLoading(false);
//       return;
//     }
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
//     if (!selectedAnswer) {
//       toast.error('Please select an answer');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await postAuth('/api/answers', {
//         question_id: id,
//         user_id: currentUser?.id,
//         answer: selectedAnswer.trim(),
//       });
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

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p className="text-muted-foreground animate-pulse">Loading prediction...</p>
//       </div>
//     );
//   }

//   if (fetchError || !prediction) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
//         <h2 className="text-xl font-bold text-red-400">Error</h2>
//         <p className="text-muted-foreground text-center">{fetchError || 'Prediction not found'}</p>
//         <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
//       </div>
//     );
//   }

//   // Stats
//   const answers = Array.isArray(prediction?.answers) ? prediction.answers : [];
//   const yesCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
//   const noCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
//   const vagueCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'vague').length;
//   const totalValidVotes = yesCount + noCount + vagueCount;

//   const agreePercentage = totalValidVotes > 0 ? Math.round((yesCount / totalValidVotes) * 100) : 0;
//   const disagreePercentage = totalValidVotes > 0 ? Math.round((noCount / totalValidVotes) * 100) : 0;
//   const vaguePercentage = totalValidVotes > 0 ? Math.round((vagueCount / totalValidVotes) * 100) : 0;

//   const isClosed = prediction?.end_date ? new Date(prediction.end_date) < new Date() : false;
//   const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);
//   const userVote = answers.find((a: any) => a.user_id === currentUser?.id)?.answer?.toUpperCase();

//   const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';

//   const resultLabel = getResultLabel(totalValidVotes, agreePercentage, disagreePercentage, vaguePercentage);
//   const outcome = getOutcomeFromLabel(resultLabel);

//   const outcomeStyle = {
//     yes: { chip: 'bg-green-500/10 border-green-500/30 text-green-400', icon: <CheckCircle2 size={14} /> },
//     no: { chip: 'bg-red-500/10 border-red-500/30 text-red-400', icon: <CheckCircle2 size={14} /> },
//     vague: { chip: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: <Users size={14} /> },
//   }[outcome];

//   return (
//     <div className="h-screen bg-background flex flex-col overflow-hidden">
//       <TopNav />

//       <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-lg mx-auto flex flex-col gap-3"
//         >
//           {/* Top Header Row with Category + Status + Public/Private */}
//           <div className="flex items-center justify-between flex-wrap gap-2">
//             <button onClick={() => navigate(-1)} className="p-1 -ml-1">
//               <ArrowLeft size={22} />
//             </button>

//             <div className="flex items-center gap-2">
//               {/* Category Badge */}
//               <span
//                 className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
//                 style={{ backgroundColor: `${catColor}22`, color: catColor }}
//               >
//                 {prediction?.field?.fields || 'SPORTS'}
//               </span>

//               {/* Status Badge - Now on top row, next to Public/Private */}
//               <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
//                 isClosed ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
//               }`}>
//                 {isClosed ? 'CLOSED' : 'OPEN'}
//               </span>

//               {/* Public / Private Badge */}
//               <div className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
//                 prediction?.visibility === 'private'
//                   ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
//                   : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
//               }`}>
//                 {prediction?.visibility === 'private' ? <Lock size={13} /> : <Globe size={13} />}
//                 {prediction?.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}
//               </div>
//             </div>

//             {/* <Share2 size={20} className="text-muted-foreground" /> */}
//           </div>

//           {/* Question Card */}
//           <div className="glass-card rounded-2xl p-4">
//             <h1 className="text-lg font-semibold leading-tight">
//               {prediction.questions || 'Ronaldo can win the FIFA ?'}
//             </h1>
//             <div className="flex items-center gap-2 mt-3">
//               <Avatar className="w-5 h-5">
//                 <AvatarImage src={prediction.user?.avatar_url} />
//                 <AvatarFallback className="text-xs">@P</AvatarFallback>
//               </Avatar>
//               <span className="text-sm text-muted-foreground">
//                 @{prediction.user?.username || 'Pankaj7777'}
//               </span>
//             </div>
//           </div>

//           {/* Timeline Card */}
//           {/* <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Clock size={18} className="text-muted-foreground" />
//               <div>
//                 <p className="text-xs text-muted-foreground font-medium">TIMELINE</p>
//                 <p className="text-sm font-medium">
//                   DUE: {formatDateCompact(prediction.end_date)} • VOTING: {formatDateCompact(prediction.end_date)}
//                 </p>
//               </div>
//             </div>
//           </div> */}

//           {/* Timeline Card - Clean & Proper */}
// <div className="glass-card rounded-2xl p-4">
//   <div className="flex items-center gap-3">
//     <Clock size={18} className="text-muted-foreground flex-shrink-0" />
//     <div className="flex-1">
//       <p className="text-xs text-muted-foreground font-medium mb-1">TIMELINE</p>
      
//       <div className="space-y-1 text-sm">
//         <div className="flex justify-between">
//           <span className="text-muted-foreground">Prediction Due Date :</span>
//           <span className="font-medium">{formatDateCompact(prediction.start_date)}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-muted-foreground">Voting Ends Date :</span>
//           <span className="font-medium">{formatDateCompact(prediction.end_date)}</span>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>

//           {/* Main Voting / Result Card */}
//           <div className="glass-card rounded-2xl p-5">
//             <div className="flex items-center gap-2 mb-4">
//               <Target size={18} className="text-blue-400" />
//               <h3 className="font-semibold">{isClosed ? 'Result' : 'Your Prediction'}</h3>
//             </div>

//             {isClosed ? (
//               <div className="space-y-5">
//                 {/* Verified Outcome */}
//                 {/* <div className="flex items-center gap-3">
//                   <div className="px-5 py-2 rounded-xl bg-green-500/10 text-green-400 font-bold text-xl border border-green-500/30">
//                     Yes 
//                   </div>
//                   <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
//                     OUTCOME VERIFIED
//                   </p>
//                 </div> */}

//                 {isClosed && prediction.correct_answer && (
//   <div className="flex items-center gap-3">
//     <div className={`px-5 py-2 rounded-xl font-bold text-xl border ${
//       prediction.correct_answer === 'Yes' 
//         ? 'bg-green-500/10 text-green-400 border-green-500/30'
//         : prediction.correct_answer === 'No'
//         ? 'bg-red-500/10 text-red-400 border-red-500/30'
//         : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
//     }`}>
//       {prediction.correct_answer}
//     </div>
//     <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
//       OFFICIAL OUTCOME
//     </p>
//   </div>
// )}

//                 {/* Community Vote Bar */}
//                 {totalValidVotes > 0 && (
//                   <div className="space-y-3">
//                     <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium ${outcomeStyle.chip}`}>
//                       {outcomeStyle.icon}
//                       <span>{resultLabel}</span>
//                     </div>

//                     <div className="h-2.5 bg-muted rounded-full overflow-hidden flex">
//                       <div className="h-full bg-green-500" style={{ width: `${agreePercentage}%` }} />
//                       <div className="h-full bg-red-500" style={{ width: `${disagreePercentage}%` }} />
//                       <div className="h-full bg-amber-500" style={{ width: `${vaguePercentage}%` }} />
//                     </div>

//                     <div className="flex justify-between text-xs text-muted-foreground">
//                       <span>Yes {agreePercentage}%</span>
//                       <span>No {disagreePercentage}%</span>
//                       <span>Vague {vaguePercentage}%</span>
//                     </div>

//                     <p className="text-center text-xs text-muted-foreground">
//                       Based on {totalValidVotes} votes
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-5">
//                 {/* Live community sentiment */}
//                 {totalValidVotes > 0 && (
//                   <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium ${outcomeStyle.chip}`}>
//                     {outcomeStyle.icon}
//                     <span>{resultLabel}</span>
//                   </div>
//                 )}

//                 <p className="text-sm text-muted-foreground text-center">
//                   Do you think this will happen?
//                 </p>

//                 <div className="grid grid-cols-3 gap-3">
//                   {['Yes', 'No', 'Vague'].map((option) => (
//                     <button
//                       key={option}
//                       onClick={() => setSelectedAnswer(option)}
//                       disabled={hasVoted}
//                       className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center h-24 transition-all ${
//                         selectedAnswer === option || userVote === option
//                           ? option === 'Yes' ? 'border-green-500 bg-green-500/10'
//                             : option === 'No' ? 'border-red-500 bg-red-500/10'
//                             : 'border-amber-500 bg-amber-500/10'
//                           : 'border-transparent bg-muted/60 hover:bg-muted'
//                       } ${hasVoted ? 'opacity-70' : ''}`}
//                     >
//                       {option === 'Yes' && <ThumbsUp size={28} className="text-green-400 mb-1" />}
//                       {option === 'No' && <ThumbsDown size={28} className="text-red-400 mb-1" />}
//                       {option === 'Vague' && <Users size={28} className="text-amber-400 mb-1" />}
//                       <p className="font-semibold text-sm">{option}</p>
//                     </button>
//                   ))}
//                 </div>

//                 <Button
//                   className="w-full h-12 text-base font-semibold"
//                   onClick={handleVote}
//                   disabled={submitting || !selectedAnswer || hasVoted}
//                   style={{
//                     background: hasVoted
//                       ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
//                       : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//                   }}
//                 >
//                   {hasVoted ? `You Voted: ${userVote}` : submitting ? 'Submitting...' : 'Submit Vote'}
//                 </Button>

//                 <p className="text-xs text-center text-muted-foreground">
//                   {hasVoted ? 'Your vote has been recorded!' : 'Voting does not affect your rank'}
//                 </p>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }













// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import {
//   ArrowLeft,
//   Clock,
//   ThumbsUp,
//   ThumbsDown,
//   Target,
//   CheckCircle2,
//   Users,
//   Globe,
//   Lock,
// } from 'lucide-react';
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { useAppSelector } from '@/app/store/hooks';
// import { getAuth, postAuth } from '@/util/api';

// const categoryColors: Record<string, string> = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };




// function computeOutcome(agreeP: number, disagreeP: number, vagueP: number): 'yes' | 'no' | 'vague' {
//   if (vagueP > agreeP && vagueP > disagreeP) return 'vague';
//   const margin = Math.abs(agreeP - disagreeP);
//   if (margin < 10) return 'vague';
//   return agreeP > disagreeP ? 'yes' : 'no';
// }

// function getResultLabel(
//   totalVotes: number,
//   agreeP: number,
//   disagreeP: number,
//   vagueP: number,
// ): string {
//   if (totalVotes === 0) return 'No votes yet';

//   const margin = Math.abs(agreeP - disagreeP);

//   if (vagueP > agreeP && vagueP > disagreeP) {
//     if (vagueP >= 85) return `Overwhelmingly unclear (${vagueP}%)`;
//     if (vagueP >= 60) return `Clearly unclear (${vagueP}% unclear)`;
//     if (vagueP >= 45) return `Leaning unclear (${vagueP}% unclear)`;
//   }

//   if (margin <= 5 && vagueP < 40) {
//     return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
//   }

//   if (margin <= 3) return 'Highly uncertain (votes are split)';

//   if (agreeP > disagreeP && agreeP > vagueP) {
//     if (agreeP >= 85) return `Overwhelming YES (${agreeP}%)`;
//     if (agreeP >= 60) return `Clear YES (${agreeP}% vs ${disagreeP}%)`;
//     return `Leaning YES (${agreeP}% vs ${disagreeP}%)`;
//   }

//   if (disagreeP > agreeP && disagreeP > vagueP) {
//     if (disagreeP >= 85) return `Overwhelming NO (${disagreeP}%)`;
//     if (disagreeP >= 60) return `Clear NO (${disagreeP}% vs ${agreeP}%)`;
//     return `Leaning NO (${disagreeP}% vs ${agreeP}%)`;
//   }

//   return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
// }

// function getOutcomeFromLabel(label: string): 'yes' | 'no' | 'vague' {
//   const l = label.toLowerCase();
//   if (l.includes('yes')) return 'yes';
//   if (l.includes('no')) return 'no';
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

//   const { user: currentUser } = useAppSelector((state) => state.auth);

//   const formatDateCompact = (dateStr?: string | null) => {
//     if (!dateStr) return 'TBD';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return 'TBD';
//     return format(date, 'dd MMM');
//   };

//   useEffect(() => {
//     if (!id) {
//       setFetchError('No prediction ID provided');
//       setLoading(false);
//       return;
//     }
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
//     if (!selectedAnswer) {
//       toast.error('Please select an answer');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await postAuth('/api/answers', {
//         question_id: id,
//         answer: selectedAnswer.trim(),
//       });
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

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p className="text-muted-foreground animate-pulse">Loading prediction...</p>
//       </div>
//     );
//   }

//   if (fetchError || !prediction) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
//         <h2 className="text-xl font-bold text-red-400">Error</h2>
//         <p className="text-muted-foreground text-center">{fetchError || 'Prediction not found'}</p>
//         <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
//       </div>
//     );
//   }

//   // Voting Stats
//   const answers = Array.isArray(prediction?.answers) ? prediction.answers : [];
//   const yesCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
//   const noCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
//   const vagueCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'vague').length;
//   const totalValidVotes = yesCount + noCount + vagueCount;

//   const agreePercentage = totalValidVotes > 0 ? Math.round((yesCount / totalValidVotes) * 100) : 0;
//   const disagreePercentage = totalValidVotes > 0 ? Math.round((noCount / totalValidVotes) * 100) : 0;
//   const vaguePercentage = totalValidVotes > 0 ? Math.round((vagueCount / totalValidVotes) * 100) : 0;

//   const isClosed = prediction?.end_date ? new Date(prediction.end_date) < new Date() : false;
//   const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);
//   const userVote = answers.find((a: any) => a.user_id === currentUser?.id)?.answer?.toUpperCase();

//   const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';

//   // Final Result: Use official backend result if available, else calculate
//   // const finalResult = prediction.correct_answer || 
//   //   (agreePercentage >= 60 ? 'Yes' : 
//   //    disagreePercentage >= 60 ? 'No' : 'Vague');

//   const resultLabel = getResultLabel(
//   totalValidVotes,
//   agreePercentage,
//   disagreePercentage,
//   vaguePercentage
// );

// const outcome = getOutcomeFromLabel(resultLabel);

// const finalResult = prediction.correct_answer || outcome.toUpperCase();

//   return (
//     <div className="h-screen bg-background flex flex-col overflow-hidden">
//       <TopNav />

//       <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-lg mx-auto flex flex-col gap-3"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between flex-wrap gap-2">
//             <button onClick={() => navigate(-1)} className="p-1 -ml-1">
//               <ArrowLeft size={22} />
//             </button>

//             <div className="flex items-center gap-2">
//               <span
//                 className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
//                 style={{ backgroundColor: `${catColor}22`, color: catColor }}
//               >
//                 {prediction?.field?.fields || 'General'}
//               </span>

//               <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
//                 isClosed ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
//               }`}>
//                 {isClosed ? 'CLOSED' : 'OPEN'}
//               </span>

//               <div className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
//                 prediction?.visibility === 'private'
//                   ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
//                   : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
//               }`}>
//                 {prediction?.visibility === 'private' ? <Lock size={13} /> : <Globe size={13} />}
//                 {prediction?.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}
//               </div>
//             </div>
//           </div>

//           {/* Question Card */}
//           <div className="glass-card rounded-2xl p-4">
//             <h1 className="text-lg font-semibold leading-tight">
//               {prediction.questions || 'No question text'} 

//  <div className={`inline-flex items-center justify-center px-1 py-2 rounded-xl text-2xl font-bold border-2 shadow-inner ${
//   finalResult === 'Yes' 
//     ? 'border-green-100 text-green-400 bg-green-500/10' 
//     : finalResult === 'No' 
//     ? 'border-red-500 text-red-400 bg-red-500/10' 
//     : 'border-amber-100 text-amber-400 bg-amber-500/10'
// }`}>
//   {finalResult}
// </div>

//             </h1>
//             <div className="flex items-center gap-2 mt-3">
//               <Avatar className="w-5 h-5">
//                 <AvatarImage src={prediction.user?.avatar_url} />
//                 <AvatarFallback className="text-xs">@P</AvatarFallback>
//               </Avatar>
//               <span className="text-sm text-muted-foreground">
//                 @{prediction.user?.username || 'anonymous'}
//               </span>
//             </div>
//           </div>

//           {/* Timeline Card */}
//           <div className="glass-card rounded-2xl p-4">
//             <div className="flex items-center gap-3">
//               <Clock size={18} className="text-muted-foreground flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="text-xs text-muted-foreground font-medium mb-2">TIMELINE</p>
//                 <p className="text-sm font-medium">
//                   Prediction Due : {formatDateCompact(prediction.end_date)} | 
//                   Voting End : {formatDateCompact(prediction.end_date)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Main Card - Voting or Result */}
//           <div className="glass-card rounded-2xl p-5 ">
//             <div className="flex items-center gap-2 mb-4">
//               <Target size={18} className="text-blue-400" />
//               <h3 className="font-semibold">
//                 {isClosed ? 'Final Result' : 'Your Prediction'}
//               </h3>
//             </div>

//             {isClosed ? (
//               /* ==================== CLOSED RESULT UI ==================== */
//               <div className="space-y-6 text-center ">
//                 {/* Big Result Box */}
//                 {/* <div className={`inline-flex items-center justify-center px-10 py-6 rounded-3xl text-5xl font-bold border-4 shadow-inner ${
//                   finalResult === 'Yes' 
//                     ? 'border-green-500 text-green-400 bg-green-500/10' 
//                     : finalResult === 'No' 
//                     ? 'border-red-500 text-red-400 bg-red-500/10' 
//                     : 'border-amber-500 text-amber-400 bg-amber-500/10'
//                 }`}>
//                   {finalResult}
//                 </div> */}
//                 {/* <div className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-2xl font-bold border-2 shadow-inner ${
//   finalResult === 'Yes' 
//     ? 'border-green-500 text-green-400 bg-green-500/10' 
//     : finalResult === 'No' 
//     ? 'border-red-500 text-red-400 bg-red-500/10' 
//     : 'border-amber-500 text-amber-400 bg-amber-500/10'
// }`}>
//   {finalResult}
// </div> */}

//                 <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium
// ${outcome === 'yes'
//   ? 'bg-green-500/10 border-green-500/30 text-green-400'
//   : outcome === 'no'
//   ? 'bg-red-500/10 border-red-500/30 text-red-400'
//   : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
// }`}>
//   {resultLabel}
// </div>

//                 <p className="text-sm text-muted-foreground font-medium">
//                   {prediction.correct_answer ? 'Official Result' : 'Based on Community Votes'}
//                 </p>

//                 {/* Vote Distribution Bar */}
//                 {totalValidVotes > 0 && (
//                   <div className="space-y-3 ">
//                     <div className="h-3 bg-muted rounded-full overflow-hidden flex">
//                       <div 
//                         className="h-full bg-green-500 transition-all" 
//                         style={{ width: `${agreePercentage}%` }} 
//                       />
//                       <div 
//                         className="h-full bg-red-500 transition-all" 
//                         style={{ width: `${disagreePercentage}%` }} 
//                       />
//                       <div 
//                         className="h-full bg-amber-500 transition-all" 
//                         style={{ width: `${vaguePercentage}%` }} 
//                       />
//                     </div>

//                     <div className="flex justify-between text-xs text-muted-foreground">
//                       <span>Yes {agreePercentage}%</span>
//                       <span>No {disagreePercentage}%</span>
//                       <span>Vague {vaguePercentage}%</span>
//                     </div>

//                     <p className="text-center text-xs text-muted-foreground">
//                       Based on {totalValidVotes} votes
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               /* ==================== OPEN VOTING UI ==================== */
//               <div className="space-y-5">
//                 <p className="text-sm text-muted-foreground text-center">
//                   Do you think this will happen?
//                 </p>

//                 <div className="grid grid-cols-3 gap-3">
//                   {['Yes', 'No', 'Vague'].map((option) => (
//                     <button
//                       key={option}
//                       onClick={() => setSelectedAnswer(option)}
//                       disabled={hasVoted}
//                       className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center h-28 transition-all ${
//                         selectedAnswer === option || userVote === option
//                           ? option === 'Yes' 
//                             ? 'border-green-500 bg-green-500/10' 
//                             : option === 'No' 
//                             ? 'border-red-500 bg-red-500/10' 
//                             : 'border-amber-500 bg-amber-500/10'
//                           : 'border-transparent bg-muted/60 hover:bg-muted'
//                       } ${hasVoted ? 'opacity-70 cursor-default' : 'active:scale-95'}`}
//                     >
//                       {option === 'Yes' && <ThumbsUp size={32} className="text-green-400 mb-2" />}
//                       {option === 'No' && <ThumbsDown size={32} className="text-red-400 mb-2" />}
//                       {option === 'Vague' && <Users size={32} className="text-amber-400 mb-2" />}
//                       <p className="font-semibold text-base">{option}</p>
//                     </button>
//                   ))}
//                 </div>

//                 <Button
//                   className="w-full h-14 text-base font-semibold rounded-2xl"
//                   onClick={handleVote}
//                   disabled={submitting || !selectedAnswer || hasVoted}
//                   style={{
//                     background: hasVoted
//                       ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
//                       : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//                   }}
//                 >
//                   {hasVoted ? `You Voted: ${userVote}` : submitting ? 'Submitting...' : 'Submit Vote'}
//                 </Button>

//                 <p className="text-xs text-center text-muted-foreground">
//                   {hasVoted ? 'Your vote has been recorded!' : 'Voting does not affect your rank'}
//                 </p>
//               </div>
//             )}
//           </div>
//         </motion.div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }










import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import {
  ArrowLeft,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Target,
  Users,
  Globe,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';
import { getAuth, postAuth } from '@/util/api';

const categoryColors: Record<string, string> = {
  trending: '#a855f7',
  politics: '#ef4444',
  sports: '#10b981',
  finance: '#fbbf24',
  education: '#06b6d4',
  entertainment: '#ec4899',
  technology: '#06b6d4',
};

function getResultLabel(totalVotes: number, agreeP: number, disagreeP: number, vagueP: number): string {
  if (totalVotes === 0) return 'No votes yet';
  const margin = Math.abs(agreeP - disagreeP);
  if (vagueP > agreeP && vagueP > disagreeP) {
    if (vagueP >= 85) return `Overwhelmingly unclear (${vagueP}%)`;
    if (vagueP >= 60) return `Clearly unclear (${vagueP}% unclear)`;
    if (vagueP >= 45) return `Leaning unclear (${vagueP}% unclear)`;
  }
  if (margin <= 5 && vagueP < 40) return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
  if (margin <= 3) return 'Highly uncertain (votes are split)';
  if (agreeP > disagreeP && agreeP > vagueP) {
    if (agreeP >= 85) return `Overwhelming YES (${agreeP}%)`;
    if (agreeP >= 60) return `Clear YES (${agreeP}% vs ${disagreeP}%)`;
    return `Leaning YES (${agreeP}% vs ${disagreeP}%)`;
  }
  if (disagreeP > agreeP && disagreeP > vagueP) {
    if (disagreeP >= 85) return `Overwhelming NO (${disagreeP}%)`;
    if (disagreeP >= 60) return `Clear NO (${disagreeP}% vs ${agreeP}%)`;
    return `Leaning NO (${disagreeP}% vs ${agreeP}%)`;
  }
  return `Too close to call (${agreeP}% vs ${disagreeP}%)`;
}

function getOutcomeFromLabel(label: string): 'yes' | 'no' | 'vague' {
  const l = label.toLowerCase();
  if (l.includes('yes')) return 'yes';
  if (l.includes('no')) return 'no';
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

  const { user: currentUser } = useAppSelector((state) => state.auth);

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
        setLoading(true);
        setFetchError(null);
        const data = await getAuth(`/api/predictions/${id}`);
        setPrediction(data);
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load prediction');
        toast.error('Could not load prediction');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  const handleVote = async () => {
    if (!selectedAnswer) { toast.error('Please select an answer'); return; }
    setSubmitting(true);
    try {
      await postAuth('/api/answers', { question_id: id, answer: selectedAnswer.trim() });
      toast.success('Vote submitted successfully!');
      setSelectedAnswer('');
      const refreshed = await getAuth(`/api/predictions/${id}`);
      if (refreshed) setPrediction(refreshed);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading prediction...</p>
      </div>
    );
  }

  if (fetchError || !prediction) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-muted-foreground text-center">{fetchError || 'Prediction not found'}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const answers = Array.isArray(prediction?.answers) ? prediction.answers : [];
  const yesCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
  const noCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
  const vagueCount = answers.filter((a: any) => a.answer?.toLowerCase() === 'vague').length;
  const totalValidVotes = yesCount + noCount + vagueCount;

  const agreePercentage = totalValidVotes > 0 ? Math.round((yesCount / totalValidVotes) * 100) : 0;
  const disagreePercentage = totalValidVotes > 0 ? Math.round((noCount / totalValidVotes) * 100) : 0;
  const vaguePercentage = totalValidVotes > 0 ? Math.round((vagueCount / totalValidVotes) * 100) : 0;

  const isClosed = prediction?.end_date ? new Date(prediction.end_date) < new Date() : false;
  const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);
  const userVote = answers.find((a: any) => a.user_id === currentUser?.id)?.answer?.toUpperCase();

  const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';

  const resultLabel = getResultLabel(totalValidVotes, agreePercentage, disagreePercentage, vaguePercentage);
  const outcome = getOutcomeFromLabel(resultLabel);
  const finalResult = prediction.correct_answer || outcome.toUpperCase();

  const pillConfig = {
    yes:   { bg: 'bg-green-500/15',  border: 'border-green-500/40',  text: 'text-green-400',  icon: <CheckCircle2 size={10} />, label: 'YES'   },
    no:    { bg: 'bg-red-500/15',    border: 'border-red-500/40',    text: 'text-red-400',    icon: <XCircle size={10} />,      label: 'NO'    },
    vague: { bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  text: 'text-amber-400',  icon: <HelpCircle size={10} />,   label: 'VAGUE' },
  }[outcome];

  const showResultPill = isClosed || hasVoted;

  return (
    /**
     * Layout strategy:
     *  - Root: h-screen flex-col overflow-hidden  → locks to viewport
     *  - TopNav: fixed height, shrink-0
     *  - Scroll area: flex-1 overflow-y-auto      → only THIS scrolls
     *  - MobileNav: fixed height, shrink-0        → always visible above content
     *
     * The scroll area has padding-bottom equal to the MobileNav height so
     * the last card never hides behind the nav bar.
     */
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <TopNav />

      {/*
        KEY FIX:
        - flex-1        → takes all space between TopNav and MobileNav
        - overflow-y-auto → scrolls when content is taller than available space
        - MobileNav is OUTSIDE this div so it always stays at the bottom
      */}
      <div className="flex-1 overflow-y-auto px-4 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto flex flex-col gap-3 pb-6"
        >
          {/* ── Header badges ──────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 shrink-0">
              <ArrowLeft size={22} />
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${catColor}22`, color: catColor }}
              >
                {prediction?.field?.fields || 'General'}
              </span>

              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                isClosed ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
              }`}>
                {isClosed ? 'CLOSED' : 'OPEN'}
              </span>

              <div className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border ${
                prediction?.visibility === 'private'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
              }`}>
                {prediction?.visibility === 'private' ? <Lock size={13} /> : <Globe size={13} />}
                <span className="ml-0.5">
                  {prediction?.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Question Card ─────────────────────────────────────── */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-medium">
                {prediction.questions || 'No question text'}
              </p>

              {/* Inline result pill — top-right of question */}
              {showResultPill && (
                <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold
                  ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text}`}>
                  {pillConfig.icon}
                  <span>{pillConfig.label}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Avatar className="w-5 h-5">
                <AvatarImage src={prediction.user?.avatar_url} />
                <AvatarFallback className="text-xs">P</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                @{prediction.user?.username || 'anonymous'}
              </span>
            </div>
          </div>

          {/* ── Timeline Card ─────────────────────────────────────── */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">TIMELINE</p>
                <p className="text-sm font-medium">
                  Prediction Due : {formatDateCompact(prediction.end_date)}
                  {' | '}
                  Voting End : {formatDateCompact(prediction.voting_end_date || prediction.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Main Card ─────────────────────────────────────────── */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={18} className="text-blue-400" />
              <h3 className="font-semibold">
                {isClosed ? 'Final Result' : 'Your Prediction'}
              </h3>
            </div>

            {isClosed ? (
              /* ════ CLOSED RESULT UI ════ */
              <div className="space-y-4 text-center">
                {/* Result label chip */}
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium ${
                  outcome === 'yes'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : outcome === 'no'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {resultLabel}
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                  {prediction.correct_answer ? 'Official Result' : 'Based on Community Votes'}
                </p>

                {/* Single segmented bar */}
                {totalValidVotes > 0 && (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full overflow-hidden flex bg-muted/40">
                      {agreePercentage > 0 && (
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${agreePercentage}%`, background: '#10b981' }} />
                      )}
                      {disagreePercentage > 0 && (
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${disagreePercentage}%`, background: '#ef4444' }} />
                      )}
                      {vaguePercentage > 0 && (
                        <div className="h-full transition-all duration-700"
                          style={{ width: `${vaguePercentage}%`, background: '#f59e0b' }} />
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} />
                        Yes {agreePercentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#ef4444' }} />
                        No {disagreePercentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f59e0b' }} />
                        Vague {vaguePercentage}%
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-colors group">
                          <span className="text-xs font-medium">
                            Based on {totalValidVotes} vote{totalValidVotes !== 1 ? 's' : ''}
                          </span>
                          <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold">Community Voting Details</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
                          {answers.map((v: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/20">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10 border border-border/50">
                                  <AvatarImage src={v.user?.avatar_url} />
                                  <AvatarFallback className="bg-muted text-xs font-bold">
                                    {v.user?.username?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-bold">@{v.user?.username || 'anonymous'}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{v.user?.name || 'Voter'}</p>
                                </div>
                              </div>
                              <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border-2 shadow-sm ${
                                v.answer?.toLowerCase() === 'yes' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                v.answer?.toLowerCase() === 'no' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {v.answer?.toUpperCase()}
                              </div>
                            </div>
                          ))}
                          {answers.length === 0 && (
                            <div className="text-center py-8">
                              <Users size={40} className="mx-auto text-muted-foreground/20 mb-2" />
                              <p className="text-muted-foreground text-sm font-medium">No votes yet</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

            ) : (
              /* ════ OPEN VOTING UI ════ */
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Do you think this will happen?
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(['Yes', 'No', 'Vague'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={hasVoted}
                      className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center h-28 transition-all ${
                        selectedAnswer === option || userVote === option
                          ? option === 'Yes'
                            ? 'border-green-500 bg-green-500/10'
                            : option === 'No'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-amber-500 bg-amber-500/10'
                          : 'border-transparent bg-muted/60 hover:bg-muted'
                      } ${hasVoted ? 'opacity-70 cursor-default' : 'active:scale-95'}`}
                    >
                      {option === 'Yes'   && <ThumbsUp   size={32} className="text-green-400 mb-2" />}
                      {option === 'No'    && <ThumbsDown  size={32} className="text-red-400 mb-2" />}
                      {option === 'Vague' && <Users       size={32} className="text-amber-400 mb-2" />}
                      <p className="font-semibold text-base">{option}</p>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-base font-semibold rounded-2xl"
                  onClick={handleVote}
                  disabled={submitting || !selectedAnswer || hasVoted}
                  style={{
                    background: hasVoted
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  }}
                >
                  {hasVoted ? `You Voted: ${userVote}` : submitting ? 'Submitting...' : 'Submit Vote'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {hasVoted ? 'Your vote has been recorded!' : 'Voting does not affect your rank'}
                </p>

                {/* Community bar — visible after voting */}
                {hasVoted && totalValidVotes > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border/30">
                    <div className="h-2.5 rounded-full overflow-hidden flex bg-muted/40">
                      {agreePercentage > 0 && (
                        <div className="h-full" style={{ width: `${agreePercentage}%`, background: '#10b981' }} />
                      )}
                      {disagreePercentage > 0 && (
                        <div className="h-full" style={{ width: `${disagreePercentage}%`, background: '#ef4444' }} />
                      )}
                      {vaguePercentage > 0 && (
                        <div className="h-full" style={{ width: `${vaguePercentage}%`, background: '#f59e0b' }} />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} />
                        Yes {agreePercentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#ef4444' }} />
                        No {disagreePercentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f59e0b' }} />
                        Vague {vaguePercentage}%
                      </span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-colors group">
                          <span className="text-xs font-medium">
                            Based on {totalValidVotes} vote{totalValidVotes !== 1 ? 's' : ''}
                          </span>
                          <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-border sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold">Community Voting Details</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                          {answers.map((v: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/10">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9 border border-border/50">
                                  <AvatarImage src={v.user?.avatar_url} />
                                  <AvatarFallback className="bg-muted text-xs">
                                    {v.user?.username?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold">@{v.user?.username || 'anonymous'}</p>
                                  <p className="text-[10px] text-muted-foreground">{v.user?.name || 'Voter'}</p>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider border ${
                                v.answer?.toLowerCase() === 'yes' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                v.answer?.toLowerCase() === 'no' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              }`}>
                                {v.answer?.toUpperCase()}
                              </div>
                            </div>
                          ))}
                          {answers.length === 0 && (
                            <div className="text-center py-8">
                              <Users size={40} className="mx-auto text-muted-foreground/20 mb-2" />
                              <p className="text-muted-foreground text-sm font-medium">No votes yet</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            )}
          </div>

        </motion.div>
      </div>

      {/* MobileNav is OUTSIDE the scroll area — always pinned at bottom */}
      <MobileNav />
    </div>
  );
}