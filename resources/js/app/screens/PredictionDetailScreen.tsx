// import { useState } from 'react';
// import { useNavigate, useParams } from 'react-router';
// import { motion } from 'motion/react';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { Progress } from '@/app/components/ui/progress';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import { mockPredictions } from '@/app/data/mockData';
// import { 
//   ArrowLeft, 
//   Share2, 
//   Clock, 
//   Calendar,
//   ThumbsUp,
//   ThumbsDown,
//   Target
// } from 'lucide-react';
// import { formatDistanceToNow, format } from 'date-fns';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Label } from '@/app/components/ui/label';
// import { toast } from 'sonner';

// const categoryColors = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };

// const riskColors = {
//   low: '#10b981',
//   medium: '#fbbf24',
//   high: '#ef4444',
// };

// export function PredictionDetailScreen() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [selectedAnswer, setSelectedAnswer] = useState<string>('');

//   const prediction = mockPredictions.find((p) => p.id === id);

//   if (!prediction) {
//     return (
//       <div className="min-h-screen bg-background">
//         <TopNav />
//         <div className="flex items-center justify-center py-20">
//           <p className="text-muted-foreground">Prediction not found</p>
//         </div>
//         <MobileNav />
//       </div>
//     );
//   }

//   const categoryColor = categoryColors[prediction.category];
//   const riskColor = riskColors[prediction.riskLevel];

//   const handleVote = () => {
//     if (prediction.answerType === 'yes-no' && !selectedAnswer) {
//       toast.error('Please select an answer');
//       return;
//     }
//     if (prediction.answerType === 'mcq' && !selectedAnswer) {
//       toast.error('Please select an option');
//       return;
//     }

//     toast.success('Vote submitted successfully!');
//     setTimeout(() => navigate('/home'), 1000);
//   };

//   const handleShare = () => {
//     toast.success('Link copied to clipboard!');
//   };

//   return (
//     <div className="min-h-screen bg-background pb-6">
//       {/* Header */}
//       <div className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
//         <div className="max-w-2xl mx-auto flex items-center justify-between">
//           <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//             <ArrowLeft size={20} />
//           </Button>
//           <Button variant="ghost" size="icon" onClick={handleShare}>
//             <Share2 size={20} />
//           </Button>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-2xl mx-auto px-4 py-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-6"
//         >
//           {/* Category & Risk Badge */}
//           <div className="flex items-center gap-2">
//             <span
//               className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
//               style={{
//                 backgroundColor: `${categoryColor}22`,
//                 color: categoryColor,
//               }}
//             >
//               {prediction.category}
//             </span>
//             <span
//               className="px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1"
//               style={{
//                 backgroundColor: `${riskColor}22`,
//                 color: riskColor,
//               }}
//             >
//               <Target size={12} />
//               {prediction.riskLevel}
//             </span>
//             <span
//               className="px-3 py-1 rounded-full text-xs font-bold"
//               style={{
//                 backgroundColor: '#fbbf2422',
//                 color: '#fbbf24',
//               }}
//             >
//               {prediction.rewardMultiplier}x Reward
//             </span>
//           </div>

//           {/* Prediction Text */}
//           <div className="glass-card rounded-2xl p-6">
//             <h1 className="text-2xl font-bold leading-relaxed">{prediction.text}</h1>
//           </div>

//           {/* Creator Card */}
//           <div className="glass-card rounded-2xl p-4">
//             <div className="flex items-center gap-3 mb-3">
//               <Avatar className="w-12 h-12">
//                 <AvatarImage src={prediction.creator.avatar} alt={prediction.creator.username} />
//                 <AvatarFallback>{prediction.creator.username[0]}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1">
//                 <p className="font-medium">{prediction.creator.username}</p>
//                 <LevelBadge level={prediction.creator.level} size="sm" />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
//                 <p className="text-lg font-bold text-[#10b981]">
//                   {prediction.creator.accuracy.toFixed(1)}%
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">Predictions</p>
//                 <p className="text-lg font-bold">{prediction.creator.predictionsResolved}</p>
//               </div>
//             </div>
//           </div>

//           {/* Time Info */}
//           <div className="glass-card rounded-2xl p-4 space-y-3">
//             <div className="flex items-center gap-3">
//               <Clock size={18} className="text-[#a855f7]" />
//               <div className="flex-1">
//                 <p className="text-xs text-muted-foreground">Voting Ends</p>
//                 <p className="font-medium">{formatDistanceToNow(prediction.votingEndTime, { addSuffix: true })}</p>
//                 <p className="text-xs text-muted-foreground">{format(prediction.votingEndTime, 'PPpp')}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Calendar size={18} className="text-[#06b6d4]" />
//               <div className="flex-1">
//                 <p className="text-xs text-muted-foreground">Result Published</p>
//                 <p className="font-medium">{format(prediction.resultPublishTime, 'PPP')}</p>
//               </div>
//             </div>
//           </div>

//           {/* Current Results (for yes-no) */}
//           {prediction.answerType === 'yes-no' && (
//             <div className="glass-card rounded-2xl p-4">
//               <p className="text-sm text-muted-foreground mb-4">Current Voting Distribution</p>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="flex items-center gap-2 text-[#10b981]">
//                       <ThumbsUp size={16} />
//                       Agree
//                     </span>
//                     <span className="font-bold text-[#10b981]">{prediction.agreePercentage}%</span>
//                   </div>
//                   <Progress value={prediction.agreePercentage} className="h-2" />
//                 </div>
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="flex items-center gap-2 text-[#ef4444]">
//                       <ThumbsDown size={16} />
//                       Disagree
//                     </span>
//                     <span className="font-bold text-[#ef4444]">{prediction.disagreePercentage}%</span>
//                   </div>
//                   <Progress value={prediction.disagreePercentage} className="h-2" />
//                 </div>
//               </div>
//               <p className="text-xs text-muted-foreground text-center mt-4">
//                 {prediction.totalVotes.toLocaleString()} total votes
//               </p>
//             </div>
//           )}

//           {/* Voting Section */}
//           <div className="glass-card rounded-2xl p-6">
//             <h3 className="font-bold mb-4">Cast Your Vote</h3>

//             {prediction.answerType === 'yes-no' && (
//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <button
//                   onClick={() => setSelectedAnswer('yes')}
//                   className={`p-4 rounded-xl transition-all ${
//                     selectedAnswer === 'yes'
//                       ? 'ring-2 ring-[#10b981]'
//                       : 'opacity-70 hover:opacity-100'
//                   }`}
//                   style={{
//                     background:
//                       selectedAnswer === 'yes'
//                         ? 'linear-gradient(135deg, #10b98133 0%, #10b98122 100%)'
//                         : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
//                   }}
//                 >
//                   <ThumbsUp size={24} className="mx-auto mb-2 text-[#10b981]" />
//                   <p className="font-medium">Agree</p>
//                 </button>

//                 <button
//                   onClick={() => setSelectedAnswer('no')}
//                   className={`p-4 rounded-xl transition-all ${
//                     selectedAnswer === 'no'
//                       ? 'ring-2 ring-[#ef4444]'
//                       : 'opacity-70 hover:opacity-100'
//                   }`}
//                   style={{
//                     background:
//                       selectedAnswer === 'no'
//                         ? 'linear-gradient(135deg, #ef444433 0%, #ef444422 100%)'
//                         : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
//                   }}
//                 >
//                   <ThumbsDown size={24} className="mx-auto mb-2 text-[#ef4444]" />
//                   <p className="font-medium">Disagree</p>
//                 </button>
//               </div>
//             )}

//             {prediction.answerType === 'mcq' && prediction.options && (
//               <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3 mb-4">
//                 {prediction.options.map((option) => (
//                   <label
//                     key={option.id}
//                     className={`glass-card p-4 rounded-xl cursor-pointer transition-all block ${
//                       selectedAnswer === option.id ? 'ring-2 ring-[#a855f7]' : ''
//                     }`}
//                     style={{
//                       background:
//                         selectedAnswer === option.id
//                           ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)'
//                           : undefined,
//                     }}
//                   >
//                     <div className="flex items-center gap-3">
//                       <RadioGroupItem value={option.id} id={option.id} />
//                       <Label htmlFor={option.id} className="cursor-pointer flex-1 font-normal">
//                         {option.text}
//                       </Label>
//                     </div>
//                   </label>
//                 ))}
//               </RadioGroup>
//             )}

//             <Button
//               className="w-full h-12"
//               onClick={handleVote}
//               style={{
//                 background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//               }}
//             >
//               Submit Vote
//             </Button>

//             <p className="text-xs text-muted-foreground text-center mt-3">
//               Note: Voting does not affect your rank. Only your own predictions count!
//             </p>
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
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import {
//   ArrowLeft,
//   Share2,
//   Clock,
//   Calendar,
//   ThumbsUp,
//   ThumbsDown,
// } from 'lucide-react';
// import { formatDistanceToNow, format } from 'date-fns';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Label } from '@/app/components/ui/label';
// import { toast } from 'sonner';

// const categoryColors: Record<string, string> = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };

// export function PredictionDetailScreen() {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const [prediction, setPrediction] = useState<any>(null);
//   const [selectedAnswer, setSelectedAnswer] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   // Safe date helpers
//   const getTimeAgo = (dateStr?: string | null) => {
//     if (!dateStr) return 'Just now';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return '—';
//     try {
//       return formatDistanceToNow(date, { addSuffix: true });
//     } catch {
//       return '—';
//     }
//   };

//   const getFormattedDate = (dateStr?: string | null, fallback = 'TBD') => {
//     if (!dateStr) return fallback;
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return fallback;
//     try {
//       return format(date, 'MMM dd, yyyy');
//     } catch {
//       return fallback;
//     }
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

//         const res = await fetch(`/api/questions/${id}/for-answer`, {
//           headers: { Accept: 'application/json' },
//         });

//         if (!res.ok) {
//           const text = await res.text();
//           throw new Error(`Failed: ${res.status} - ${text.substring(0, 120)}`);
//         }

//         const data = await res.json();
//         console.log('[Detail] Full prediction data:', data);
//         setPrediction(data);
//       } catch (err: any) {
//         console.error('[Detail] Fetch error:', err);
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
//       toast.error('Please select an option first');
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const payload = {
//         question_id: id,
//         user_id: 1, // ← REPLACE with real authenticated user ID !!!
//         answer: selectedAnswer.trim(),
//       };

//       const res = await fetch('/api/answers', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(errData.message || errData.error || 'Failed to submit vote');
//       }

//       toast.success('Your vote has been submitted!');

//       // Optional: refresh prediction data
//       const refreshRes = await fetch(`/api/questions/${id}/for-answer`);
//       if (refreshRes.ok) {
//         const refreshed = await refreshRes.json();
//         setPrediction(refreshed);
//         setSelectedAnswer(''); // reset selection
//       }
//     } catch (err: any) {
//       console.error('[Vote] Error:', err);
//       toast.error(err.message || 'Failed to submit your vote');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-muted-foreground animate-pulse text-lg">Loading prediction...</p>
//       </div>
//     );
//   }

//   if (fetchError || !prediction) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
//         <h2 className="text-2xl font-bold text-red-400">Error</h2>
//         <p className="text-muted-foreground max-w-md">{fetchError || 'Prediction not found'}</p>
//         <Button onClick={() => navigate(-1)} variant="outline">
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   const category = prediction?.field?.fields?.toLowerCase() || 'trending';
//   const categoryColor = categoryColors[category] || '#a855f7';

//   const ansType = (prediction?.answer_type?.ans_type || '').trim();

//   // Debug log to confirm structure
//   console.log('[UI] Answer type detected:', ansType);
//   console.log('[UI] Available options:', prediction?.options);

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       <div className="max-w-3xl mx-auto px-4 py-8">
//         <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//           {/* Header */}
//           <div className="flex items-center gap-4 mb-6">
//             <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//               <ArrowLeft size={24} />
//             </Button>
//             <h1 className="text-3xl font-bold flex-1">Prediction Details</h1>
//             <Button variant="ghost" size="icon">
//               <Share2 size={24} />
//             </Button>
//           </div>

//           {/* Prediction Info */}
//           <div className="glass-card rounded-2xl p-6 space-y-4">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-12 w-12">
//                 <AvatarImage src={prediction?.user?.avatar_url} />
//                 <AvatarFallback>{prediction?.user?.name?.[0] || '?'}</AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="font-medium text-lg">{prediction?.user?.name || 'Anonymous'}</p>
//                 <LevelBadge level={1} size="sm" />
//               </div>
//             </div>

//             <p className="text-2xl font-bold leading-tight">
//               {prediction.questions || 'No question text available'}
//             </p>

//             <div className="flex flex-wrap gap-3">
//               <span
//                 className="px-4 py-1.5 rounded-full text-sm font-medium"
//                 style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
//               >
//                 {prediction?.field?.fields || 'Uncategorized'}
//               </span>
//             </div>

//             <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
//               <div className="flex items-center gap-2">
//                 <Clock size={16} />
//                 <span>Created {getTimeAgo(prediction.created_at)}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Calendar size={16} />
//                 <span>Ends {getFormattedDate(prediction.end_date, 'Not set')}</span>
//               </div>
//             </div>
//           </div>

//           {/* Voting Section */}
//           <div className="glass-card rounded-2xl p-6 space-y-6">
//             <h2 className="text-xl font-bold">Your Prediction</h2>

//             {/* Multiple Choice – matches your backend response */}
//             {ansType === 'Multiple Choice' && prediction?.options?.length > 0 && (
//               <RadioGroup
//                 value={selectedAnswer}
//                 onValueChange={setSelectedAnswer}
//                 className="space-y-3"
//               >
//                 {prediction.options.map((option: string, index: number) => (
//                   <Label
//                     key={index}
//                     htmlFor={`opt-${index}`}
//                     className={`glass-card p-5 rounded-xl cursor-pointer transition-all flex items-center gap-4 border-2 ${
//                       selectedAnswer === option
//                         ? 'border-purple-500 bg-purple-500/10'
//                         : 'border-transparent hover:bg-accent/50'
//                     }`}
//                   >
//                     <RadioGroupItem value={option} id={`opt-${index}`} />
//                     <span className="flex-1 font-medium text-base">{option}</span>
//                   </Label>
//                 ))}
//               </RadioGroup>
//             )}

//             {/* Yes/No fallback – in case some questions use it */}
//             {ansType.toLowerCase().includes('yes/no') && (
//               <RadioGroup
//                 value={selectedAnswer}
//                 onValueChange={setSelectedAnswer}
//                 className="grid grid-cols-2 gap-4"
//               >
//                 <Label
//                   htmlFor="yes"
//                   className={`glass-card p-6 rounded-xl cursor-pointer text-center transition-all border-2 ${
//                     selectedAnswer === 'Yes'
//                       ? 'border-green-500 bg-green-500/10'
//                       : 'border-transparent hover:bg-accent/50'
//                   }`}
//                 >
//                   <RadioGroupItem value="Yes" id="yes" className="sr-only" />
//                   <ThumbsUp size={32} className="mx-auto mb-3 text-green-500" />
//                   <p className="text-lg font-medium">Yes</p>
//                 </Label>

//                 <Label
//                   htmlFor="no"
//                   className={`glass-card p-6 rounded-xl cursor-pointer text-center transition-all border-2 ${
//                     selectedAnswer === 'No'
//                       ? 'border-red-500 bg-red-500/10'
//                       : 'border-transparent hover:bg-accent/50'
//                   }`}
//                 >
//                   <RadioGroupItem value="No" id="no" className="sr-only" />
//                   <ThumbsDown size={32} className="mx-auto mb-3 text-red-500" />
//                   <p className="text-lg font-medium">No</p>
//                 </Label>
//               </RadioGroup>
//             )}

//             {/* Fallback when no recognizable type */}
//             {ansType !== 'Multiple Choice' && !ansType.toLowerCase().includes('yes/no') && (
//               <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
//                 <p className="text-lg font-medium">Voting not available</p>
//                 <p className="text-sm mt-2">
//                   Answer type: <strong>{ansType || 'unknown'}</strong>
//                 </p>
//               </div>
//             )}

//             {/* Submit Button */}
//             <Button
//               className="w-full h-14 text-lg font-medium mt-4"
//               onClick={handleVote}
//               disabled={submitting || !selectedAnswer}
//               style={{
//                 background: submitting
//                   ? 'gray'
//                   : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//               }}
//             >
//               {submitting ? 'Submitting...' : 'Submit Vote'}
//             </Button>

//             <p className="text-xs text-center text-muted-foreground mt-4">
//               Your vote is anonymous • Only correct answers earn points
//             </p>
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
import { LevelBadge } from '@/app/components/LevelBadge';
import { Progress } from '@/app/components/ui/progress';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import {
  ArrowLeft,
  Share2,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Target,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';

const categoryColors = {
  trending: '#a855f7',
  politics: '#ef4444',
  sports: '#10b981',
  finance: '#fbbf24',
  education: '#06b6d4',
  entertainment: '#ec4899',
};

const riskColors = {
  low: '#10b981',
  medium: '#fbbf24',
  high: '#ef4444',
};

export function PredictionDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Safe date helpers
  const getTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '—';
    }
  };

  const getFormattedDate = (dateStr?: string | null, fallback = 'TBD') => {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;
    try {
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    if (!id) {
      setFetchError('No prediction ID provided');
      setLoading(false);
      return;
    }

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const res = await fetch(`/api/questions/${id}/for-answer`, {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed: ${res.status} - ${text.substring(0, 120)}`);
        }

        const data = await res.json();
        setPrediction(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setFetchError(err.message || 'Failed to load prediction');
        toast.error('Could not load prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [id]);

  const handleVote = async () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        question_id: id,
        user_id: currentUser?.id,
        answer: selectedAnswer.trim(),
      };

      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Vote failed');
      }

      toast.success('Vote submitted successfully!');
      setSelectedAnswer('');
      // Optional: refresh data
      const refresh = await fetch(`/api/questions/${id}/for-answer`);
      if (refresh.ok) setPrediction(await refresh.json());
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-muted-foreground max-w-md text-center">
          {fetchError || 'Prediction not found'}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const categoryColor = [prediction?.field?.fields?.toLowerCase() || 'trending'];
  const riskColor = riskColors.medium; // placeholder — add real riskLevel if you have it
  const rewardMultiplier = 2.5; // placeholder — add real value if available

  // Calculate dynamic voting stats
  let agreePercentage = 0;
  let disagreePercentage = 0;
  let totalValidVotes = 0;

  if (prediction?.answer_type?.ans_type?.toLowerCase().includes('yes/no')) {
    if (prediction?.answers && Array.isArray(prediction.answers)) {
      const agreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
      const disagreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
      totalValidVotes = agreeCount + disagreeCount;

      if (totalValidVotes > 0) {
        agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
        disagreePercentage = 100 - agreePercentage;
      }
    }
  }

  // Check if current user already voted to show selection state cleanly
  const hasVoted = prediction?.answers?.some((a: any) => a.user_id === currentUser?.id);
  const userVote = prediction?.answers?.find((a: any) => a.user_id === currentUser?.id)?.answer;

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast.success('Link copied!')}>
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Category & Risk Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
              style={{
                backgroundColor: `${categoryColor}22`,

              }}
            >
              {prediction?.field?.fields || 'Unknown'}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1"
              style={{
                backgroundColor: `${riskColor}22`,
                color: riskColor,
              }}
            >
              <Target size={12} />
              Medium Risk
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: '#fbbf2422',
                color: '#fbbf24',
              }}
            >
              {rewardMultiplier}x Reward
            </span>
          </div>

          {/* Prediction Text */}
          <div className="glass-card rounded-2xl p-6">
            <h1 className="text-2xl font-bold leading-relaxed">
              {prediction.questions || 'No question text'}
            </h1>
          </div>

          {/* Creator Card */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={prediction?.user?.avatar_url} />
                <AvatarFallback>{prediction?.user?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{prediction?.user?.name || 'Anonymous'}</p>
                <LevelBadge level={1} size="sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                <p className="text-lg font-bold text-[#10b981]">78.4%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Predictions</p>
                <p className="text-lg font-bold">142</p>
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#a855f7]" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Voting Ends</p>
                <p className="font-medium">{getTimeAgo(prediction.end_date)}</p>
                <p className="text-xs text-muted-foreground">
                  {getFormattedDate(prediction.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-[#06b6d4]" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Result Published</p>
                <p className="font-medium">After voting ends</p>
              </div>
            </div>
          </div>

          {/* Current Results */}
          {prediction.answer_type?.ans_type?.toLowerCase().includes('yes/no') && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm text-muted-foreground mb-4">Current Voting Distribution</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-[#10b981]">
                      <ThumbsUp size={16} />
                      Agree
                    </span>
                    <span className="font-bold text-[#10b981]">{agreePercentage}%</span>
                  </div>
                  <Progress value={agreePercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-[#ef4444]">
                      <ThumbsDown size={16} />
                      Disagree
                    </span>
                    <span className="font-bold text-[#ef4444]">{disagreePercentage}%</span>
                  </div>
                  <Progress value={disagreePercentage} className="h-2" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                {totalValidVotes || prediction?.answers_count || 0} total votes
              </p>
            </div>
          )}

          {/* Voting Section */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Cast Your Vote</h3>

            {/* Yes/No */}
            {prediction.answer_type?.ans_type?.toLowerCase().includes('yes/no') && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setSelectedAnswer('Yes')}
                  className={`p-4 rounded-xl transition-all ${selectedAnswer === 'Yes'
                      ? 'ring-2 ring-[#10b981] bg-green-500/10'
                      : 'opacity-70 hover:opacity-100 bg-gradient-to-br from-white/5 to-white/2'
                    }`}
                >
                  <ThumbsUp size={24} className="mx-auto mb-2 text-[#10b981]" />
                  <p className="font-medium">Agree</p>
                </button>

                <button
                  onClick={() => setSelectedAnswer('No')}
                  className={`p-4 rounded-xl transition-all ${selectedAnswer === 'No'
                      ? 'ring-2 ring-[#ef4444] bg-red-500/10'
                      : 'opacity-70 hover:opacity-100 bg-gradient-to-br from-white/5 to-white/2'
                    }`}
                >
                  <ThumbsDown size={24} className="mx-auto mb-2 text-[#ef4444]" />
                  <p className="font-medium">Disagree</p>
                </button>
              </div>
            )}

            {/* Multiple Choice */}
            {prediction.answer_type?.ans_type === 'Multiple Choice' && prediction.options?.length > 0 && (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3 mb-4">
                {prediction.options.map((option: string, index: number) => (
                  <Label
                    key={index}
                    htmlFor={`opt-${index}`}
                    className={`glass-card p-4 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${selectedAnswer === option
                        ? 'ring-2 ring-[#a855f7] bg-purple-500/10'
                        : 'hover:bg-accent/50'
                      }`}
                  >
                    <RadioGroupItem value={option} id={`opt-${index}`} />
                    <span className="flex-1 font-normal">{option}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            <Button
              className="w-full h-12"
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

            <p className="text-xs text-muted-foreground text-center mt-3">
              {hasVoted
                ? 'Your vote has been recorded!'
                : 'Note: Voting does not affect your rank. Only your own predictions count!'}
            </p>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}