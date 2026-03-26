
// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { Progress } from '@/app/components/ui/progress';
// import { TopNav } from '@/app/components/TopNav';
// import { MobileNav } from '@/app/components/MobileNav';
// import {
//   ArrowLeft,
//   Share2,
//   Clock,
//   Calendar,
//   ThumbsUp,
//   ThumbsDown,
//   Target,
// } from 'lucide-react';
// import { formatDistanceToNow, format } from 'date-fns';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Label } from '@/app/components/ui/label';
// import { toast } from 'sonner';
// import { useAppSelector } from '@/app/store/hooks';
// import { getAuth, postAuth, patchAuth } from '@/util/api';

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
//   const { id } = useParams<{ id: string }>();
//   const [prediction, setPrediction] = useState<any>(null);
//   const [selectedAnswer, setSelectedAnswer] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   const { user: currentUser } = useAppSelector((state) => state.auth);
  

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
//       return format(date, 'MMM dd, yyyy HH:mm');
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

//         const data = await getAuth(`/api/predictions/${id}`);
//         setPrediction(data);
//       } catch (err: any) {
//         console.error('Fetch error:', err);
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
//       const payload = {
//         question_id: id,
//         user_id: currentUser?.id,
//         answer: selectedAnswer.trim(),
//       };

//       await postAuth('/api/answers', payload);

//       toast.success('Vote submitted successfully!');
//       setSelectedAnswer('');
//       // Refresh prediction data
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
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
//         <h2 className="text-2xl font-bold text-red-400">Error</h2>
//         <p className="text-muted-foreground max-w-md text-center">
//           {fetchError || 'Prediction not found'}
//         </p>
//         <Button onClick={() => navigate(-1)} variant="outline">
//           Go Back
//         </Button>
//       </div>
//     );
//   }

//   const categoryColor = [prediction?.field?.fields?.toLowerCase() || 'trending'];
//   const riskColor = riskColors.medium; // placeholder — add real riskLevel if you have it
//   const rewardMultiplier = 2.5; // placeholder — add real value if available

//   // Predictions are now strictly binary (Yes/No)
//   const isYesNo = true;
//   const isMCQ = false;

//   // Calculate dynamic voting stats (for Yes/No)
//   let agreePercentage = 0;
//   let disagreePercentage = 0;
//   let totalValidVotes = 0;

//   if (prediction?.answers && Array.isArray(prediction.answers)) {
//     const agreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
//     const disagreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
//     totalValidVotes = agreeCount + disagreeCount;
//     if (totalValidVotes > 0) {
//       agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
//       disagreePercentage = 100 - agreePercentage;
//     }
//   }

//   // Check if current user already voted to show selection state cleanly
//   const hasVoted = prediction?.answers?.some((a: any) => a.user_id === currentUser?.id);
//   const userVote = prediction?.answers?.find((a: any) => a.user_id === currentUser?.id)?.answer;

//   return (
//     <div className="min-h-screen bg-background pb-6">
//       {/* Sticky Header */}
//       <div className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
//         <div className="max-w-2xl mx-auto flex items-center justify-between">
//           <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//             <ArrowLeft size={20} />
//           </Button>
//           {/* <Button variant="ghost" size="icon" onClick={() => toast.success('Link copied!')}>
//             <Share2 size={20} />
//           </Button> */}
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
//           <div className="flex items-center gap-2 flex-wrap">
//             <span
//               className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
//               style={{
//                 backgroundColor: `${categoryColor}22`,

//               }}
//             >
//               {prediction?.field?.fields || 'Unknown'}
//             </span>
//             {/* <span
//               className="px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1"
//               style={{
//                 backgroundColor: `${riskColor}22`,
//                 color: riskColor,
//               }}
//             >
//               <Target size={12} />
//               Medium Risk
//             </span>
//             <span
//               className="px-3 py-1 rounded-full text-xs font-bold"
//               style={{
//                 backgroundColor: '#fbbf2422',
//                 color: '#fbbf24',
//               }}
//             >
//               {rewardMultiplier}x Reward
//             </span> */}
//           </div>

//           {/* Prediction Text */}
//           <div className="glass-card rounded-2xl p-6">
//             <h1 className="text-2xl font-bold leading-relaxed">
//               {prediction.questions || 'No question text'}
//             </h1>
//           </div>

//           {/* Creator Card */}
//           <div className="glass-card rounded-2xl p-4">
//             <div className="flex items-center gap-3 mb-3">
//               <Avatar className="w-12 h-12">
//                 <AvatarImage src={prediction?.user?.avatar_url} />
//                 <AvatarFallback>{prediction?.user?.name?.[0] || '?'}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1">
//                 <p className="font-medium">{prediction?.user?.name || 'Anonymous'}</p>
//                 <LevelBadge level={1} size="sm" />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
//                 <p className="text-lg font-bold text-[#10b981]">78.4%</p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground mb-1">Predictions</p>
//                 <p className="text-lg font-bold">142</p>
//               </div>
//             </div>
//           </div>

//           {/* Time Info */}
//           <div className="glass-card rounded-2xl p-4 space-y-3">
//             <div className="flex items-center gap-3">
//               <Clock size={18} className="text-[#a855f7]" />
//               <div className="flex-1">
//                 <p className="text-xs text-muted-foreground">Voting Ends</p>
//                 <p className="font-medium">{getTimeAgo(prediction.end_date)}</p>
//                 <p className="text-xs text-muted-foreground">
//                   {getFormattedDate(prediction.end_date)}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Calendar size={18} className="text-[#06b6d4]" />
//               <div className="flex-1">
//                 <p className="text-xs text-muted-foreground">Result Published</p>
//                 <p className="font-medium">After voting ends</p>
//               </div>
//             </div>
//           </div>

//           {/* Current Results — shown for Yes/No only when there are votes */}
//           {isYesNo && (totalValidVotes > 0 || prediction?.status === 'closed') && (
//             <div className="glass-card rounded-2xl p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <p className="text-sm text-muted-foreground">Voting Distribution</p>
//                 {prediction?.status === 'closed' && (
//                   <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold uppercase">
//                     Resolved: {prediction.result === 'pass' ? 'Yes' : 'No'}
//                   </span>
//                 )}
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="flex items-center gap-2 text-[#10b981]">
//                       <ThumbsUp size={16} />
//                       Agree
//                     </span>
//                     <span className="font-bold text-[#10b981]">{agreePercentage}%</span>
//                   </div>
//                   <Progress value={agreePercentage} className="h-2" />
//                 </div>
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="flex items-center gap-2 text-[#ef4444]">
//                       <ThumbsDown size={16} />
//                       Disagree
//                     </span>
//                     <span className="font-bold text-[#ef4444]">{disagreePercentage}%</span>
//                   </div>
//                   <Progress value={disagreePercentage} className="h-2" />
//                 </div>
//               </div>
//               <p className="text-xs text-muted-foreground text-center mt-4">
//                 {totalValidVotes || prediction?.answers_count || 0} total votes
//               </p>
//             </div>
//           )}

//           {/* Voting Section */}
//           <div className="glass-card rounded-2xl p-6">
//             <h3 className="font-bold mb-4 flex items-center gap-2">
//               <ThumbsUp size={18} className="text-blue-400" />
//               Your Prediction
//             </h3>
//             <p className="text-xs text-muted-foreground mb-4">Do you think this will happen? Cast your vote below.</p>

//             {/* Yes/No Vote Buttons */}
//             {isYesNo && (
//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <button
//                   onClick={() => setSelectedAnswer('Yes')}
//                   disabled={hasVoted}
//                   className={`p-4 rounded-xl transition-all ${selectedAnswer === 'Yes' || userVote === 'Yes'
//                     ? 'ring-2 ring-[#10b981] bg-green-500/10'
//                     : 'opacity-70 hover:opacity-100 bg-gradient-to-br from-white/5 to-white/2'
//                     } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
//                 >
//                   <ThumbsUp size={24} className="mx-auto mb-2 text-[#10b981]" />
//                   <p className="font-medium">Agree</p>
//                 </button>

//                 <button
//                   onClick={() => setSelectedAnswer('No')}
//                   disabled={hasVoted}
//                   className={`p-4 rounded-xl transition-all ${selectedAnswer === 'No' || userVote === 'No'
//                     ? 'ring-2 ring-[#ef4444] bg-red-500/10'
//                     : 'opacity-70 hover:opacity-100 bg-gradient-to-br from-white/5 to-white/2'
//                     } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
//                 >
//                   <ThumbsDown size={24} className="mx-auto mb-2 text-[#ef4444]" />
//                   <p className="font-medium">Disagree</p>
//                 </button>
//               </div>
//             )}



//             <Button
//               className="w-full h-12"
//               onClick={handleVote}
//               disabled={submitting || !selectedAnswer || hasVoted}
//               style={{
//                 background: hasVoted
//                   ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
//                   : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//               }}
//             >
//               {hasVoted ? `You Voted: ${userVote}` : submitting ? 'Submitting...' : 'Submit Vote'}
//             </Button>

//             <p className="text-xs text-muted-foreground text-center mt-3">
//               {hasVoted
//                 ? 'Your vote has been recorded!'
//                 : 'Note: Voting does not affect your rank. Only your own predictions count!'}
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
  CheckCircle2,
  XCircle,
  Users,
  Globe,
  Lock,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';
import { getAuth, postAuth } from '@/util/api';

const categoryColors = {
  trending: '#a855f7',
  politics: '#ef4444',
  sports: '#10b981',
  finance: '#fbbf24',
  education: '#06b6d4',
  entertainment: '#ec4899',
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

        const data = await getAuth(`/api/predictions/${id}`);
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

      await postAuth('/api/answers', payload);

      toast.success('Vote submitted successfully!');
      setSelectedAnswer('');
      // Refresh prediction data
      const refreshed = await getAuth(`/api/predictions/${id}`);
      if (refreshed) setPrediction(refreshed);
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      setSubmitting(true);
      const res = await patchAuth(`/api/predictions/${id}/toggle-visibility`);
      if (res.data) {
        setPrediction((prev: any) => ({ ...prev, visibility: res.data.visibility }));
        toast.success(`Prediction is now ${res.data.visibility}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to change visibility');
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

  // Check if voting has ended
  const isClosed = prediction?.end_date
    ? new Date(prediction.end_date) < new Date()
    : false;

  // Correct answer (assuming backend sends it when resolved)
  const correctAnswer = prediction?.correct_answer || null; // 'Yes' or 'No'

  // Calculate voting stats for Yes/No
  let agreePercentage = 0;
  let disagreePercentage = 0;
  let vaguePercentage = 0;
  let totalValidVotes = 0;

  if (prediction?.answers && Array.isArray(prediction.answers)) {
    const agreeCount = prediction.answers.filter(
      (a: any) => a.answer?.toLowerCase() === 'yes'
    ).length;
    const disagreeCount = prediction.answers.filter(
      (a: any) => a.answer?.toLowerCase() === 'no'
    ).length;
    const vagueCount = prediction.answers.filter(
      (a: any) => a.answer?.toLowerCase() === 'vague'
    ).length;

    totalValidVotes = agreeCount + disagreeCount + vagueCount;
    if (totalValidVotes > 0) {
      agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
      disagreePercentage = Math.round((disagreeCount / totalValidVotes) * 100);
      vaguePercentage = 100 - (agreePercentage + disagreePercentage);
    }
  }

  const hasVoted = prediction?.answers?.some(
    (a: any) => a.user_id === currentUser?.id
  );
  const userVote = prediction?.answers?.find(
    (a: any) => a.user_id === currentUser?.id
  )?.answer;
  return (
    <div className="min-h-screen bg-background pb-6">
      <TopNav />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Category & Visibility Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: `${(categoryColors as any)[prediction?.field?.fields?.toLowerCase()] || categoryColors.trending}22`,
                color: (categoryColors as any)[prediction?.field?.fields?.toLowerCase()] || categoryColors.trending,
              }}
            >
              {prediction?.field?.fields || 'General'}
            </span>

            {/* Visibility Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight transition-colors ${
              prediction?.visibility === 'private'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
            }`}>
              {prediction?.visibility === 'private' ? (
                <>
                  <Lock size={12} className="shrink-0" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe size={12} className="shrink-0" />
                  <span>Public</span>
                </>
              )}
            </div>
          </div>

          {/* Prediction Text */}
          <div className="glass-card rounded-2xl p-6">
            <h1 className="text-2xl font-bold leading-relaxed">
              {prediction.questions || 'No question text'}
            </h1>
          </div>

          {/* Time Info */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#a855f7]" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Prediction Over</p>
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

          {/* Voting / Result Section */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target size={18} className="text-blue-400" />
              {isClosed ? 'Result' : 'Your Prediction'}
            </h3>

            {isClosed ? (
              <div className="space-y-6">
                <div className="text-center p-8 bg-muted rounded-xl border border-border">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">
                    This prediction has ended
                  </h4>

                  {correctAnswer ? (
                    <div className="flex flex-col items-center gap-4 mt-4">
                      <div
                        className={`px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg ${
                          correctAnswer.toLowerCase() === 'yes'
                            ? 'bg-green-600/20 text-green-400 border-2 border-green-500/40'
                            : correctAnswer.toLowerCase() === 'no'
                            ? 'bg-red-600/20 text-red-400 border-2 border-red-500/40'
                            : 'bg-amber-600/20 text-amber-400 border-2 border-amber-500/40'
                        }`}
                      >
                        Result: {correctAnswer}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Outcome verified on {getFormattedDate(prediction.end_date)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-4">Result not yet finalized</p>
                  )}
                </div>

                {totalValidVotes > 0 && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-[#10b981]">
                        <ThumbsUp size={16} /> Agree
                      </span>
                      <span className="font-bold text-[#10b981]">{agreePercentage}%</span>
                    </div>
                    <Progress value={agreePercentage} className="h-3" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-[#ef4444]">
                        <XCircle size={16} /> No
                      </span>
                      <span className="font-bold text-[#ef4444]">{disagreePercentage}%</span>
                    </div>
                    <Progress value={disagreePercentage} className="h-3" />

                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-amber-500">
                        <Users size={16} /> Vague / Tie
                      </span>
                      <span className="font-bold text-amber-500">{vaguePercentage}%</span>
                    </div>
                    <Progress value={vaguePercentage} className="h-3" />

                    <p className="text-xs text-center text-muted-foreground mt-6">
                      Based on {totalValidVotes} total votes
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-6">
                  Do you think this will happen? Cast your vote below.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={() => setSelectedAnswer('Yes')}
                    disabled={hasVoted}
                    className={`p-4 rounded-2xl transition-all border-2 text-center flex flex-col items-center justify-center ${
                      selectedAnswer === 'Yes' || userVote === 'Yes'
                        ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                        : 'border-transparent bg-muted/50 hover:border-green-500/40'
                    } ${hasVoted ? 'opacity-70 cursor-default' : 'hover:scale-[1.02] cursor-pointer'}`}
                  >
                    <ThumbsUp size={24} className="mb-2 text-green-400" />
                    <p className="font-bold text-sm">Yes</p>
                  </button>

                  <button
                    onClick={() => setSelectedAnswer('No')}
                    disabled={hasVoted}
                    className={`p-4 rounded-2xl transition-all border-2 text-center flex flex-col items-center justify-center ${
                      selectedAnswer === 'No' || userVote === 'No'
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                        : 'border-transparent bg-muted/50 hover:border-red-500/40'
                    } ${hasVoted ? 'opacity-70 cursor-default' : 'hover:scale-[1.02] cursor-pointer'}`}
                  >
                    <ThumbsDown size={24} className="mb-2 text-red-400" />
                    <p className="font-bold text-sm">No</p>
                  </button>

                  <button
                    onClick={() => setSelectedAnswer('Vague')}
                    disabled={hasVoted}
                    className={`p-4 rounded-2xl transition-all border-2 text-center flex flex-col items-center justify-center ${
                      selectedAnswer === 'Vague' || userVote === 'Vague'
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                        : 'border-transparent bg-muted/50 hover:border-amber-500/40'
                    } ${hasVoted ? 'opacity-70 cursor-default' : 'hover:scale-[1.02] cursor-pointer'}`}
                  >
                    <Users size={24} className="mb-2 text-amber-400" />
                    <p className="font-bold text-sm">Vague</p>
                  </button>
                </div>

                <Button
                  className="w-full h-14 text-lg font-semibold"
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

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {hasVoted ? 'Your vote has been recorded!' : 'Note: Voting does not affect your rank. Only your own predictions count!'}
                </p>
              </>
            )}
          </div>

          {/* Author Card */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={prediction.user?.avatar_url} />
              <AvatarFallback>{prediction.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{prediction.user?.name}</p>
              <p className="text-xs text-muted-foreground">Prediction Creator</p>
            </div>
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getFormattedDate(prediction.created_at)}
            </span>
          </div>
        </motion.div>
      </div>
      <MobileNav />
    </div>
  );
}