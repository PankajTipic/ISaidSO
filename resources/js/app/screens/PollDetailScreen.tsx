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
//     ArrowLeft,
//     Share2,
//     Clock,
//     Calendar,
//     Users,
//     Target,
//     ThumbsUp
// } from 'lucide-react';
// import { formatDistanceToNow, format } from 'date-fns';
// import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
// import { Label } from '@/app/components/ui/label';
// import { toast } from 'sonner';
// import { useAppSelector } from '@/app/store/hooks';
// import { getAuth, postAuth, patchAuth } from '@/util/api';

// export function PollDetailScreen() {
//     const navigate = useNavigate();
//     const { id } = useParams<{ id: string }>();
//     const [poll, setPoll] = useState<any>(null);
//     const [selectedAnswer, setSelectedAnswer] = useState<string>('');
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [fetchError, setFetchError] = useState<string | null>(null);

//     const { user: currentUser } = useAppSelector((state) => state.auth);

//     // Safe date helpers
//     const getTimeRemaining = (dateStr?: string | null) => {
//         if (!dateStr) return 'TBD';
//         const date = new Date(dateStr);
//         if (isNaN(date.getTime())) return 'TBD';
//         try {
//             return formatDistanceToNow(date, { addSuffix: true });
//         } catch {
//             return 'TBD';
//         }
//     };

//     const getFormattedDate = (dateStr?: string | null, fallback = 'TBD') => {
//         if (!dateStr) return fallback;
//         const date = new Date(dateStr);
//         if (isNaN(date.getTime())) return fallback;
//         try {
//             return format(date, 'MMM dd, yyyy HH:mm');
//         } catch {
//             return fallback;
//         }
//     };

//     useEffect(() => {
//         if (!id) {
//             setFetchError('No poll ID provided');
//             setLoading(false);
//             return;
//         }

//         const fetchPoll = async () => {
//             try {
//                 setLoading(true);
//                 setFetchError(null);

//                 const data = await getAuth(`/api/polls/${id}`);
//                 setPoll(data);
//             } catch (err: any) {
//                 console.error('Fetch error:', err);
//                 setFetchError(err.message || 'Failed to load poll');
//                 toast.error('Could not load poll');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPoll();
//     }, [id]);

//     const handleVote = async () => {
//         if (!selectedAnswer) {
//             toast.error('Please select an option');
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const payload = {
//                 answer: selectedAnswer.trim(),
//             };

//             await postAuth(`/api/polls/${id}/vote`, payload);

//             toast.success('Vote recorded successfully!');
//             setSelectedAnswer('');
//             // Refresh poll data
//             const refreshed = await getAuth(`/api/polls/${id}`);
//             if (refreshed) setPoll(refreshed);
//         } catch (err: any) {
//             toast.error(err.message || 'Failed to submit vote');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-background flex items-center justify-center">
//                 <p className="text-muted-foreground animate-pulse">Loading poll...</p>
//             </div>
//         );
//     }

//     if (fetchError || !poll) {
//         return (
//             <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
//                 <h2 className="text-2xl font-bold text-red-400">Error</h2>
//                 <p className="text-muted-foreground max-w-md">{fetchError || 'Poll not found'}</p>
//                 <Button onClick={() => navigate(-1)} variant="outline">
//                     Go Back
//                 </Button>
//             </div>
//         );
//     }

//     // Calculate percentages based on answers
//     const options = poll.options || [];
//     const totalVotes = poll.answers_count || 0;

//     const voteCounts = options.reduce((acc: any, option: string) => {
//         const count = poll.answers?.filter((a: any) => a.answer === option).length || 0;
//         acc[option] = count;
//         return acc;
//     }, {});

//     const hasVoted = poll.answers?.some((a: any) => a.user_id === currentUser?.id);
//     const userVote = poll.answers?.find((a: any) => a.user_id === currentUser?.id)?.answer;

//     return (
//         <div className="min-h-screen bg-background pb-6">
//             <TopNav />

//             <div className="max-w-2xl mx-auto px-4 py-6">
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-6"
//                 >
//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                         <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//                             <ArrowLeft size={20} />
//                         </Button>
//                         <h1 className="text-xl font-bold">Poll Details</h1>
//                         <Button variant="ghost" size="icon" onClick={() => toast.success('Link copied!')}>
//                             <Share2 size={20} />
//                         </Button>
//                     </div>

//                     {/* Question */}
//                     <div className="glass-card rounded-2xl p-6">
//                         <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 mb-3 inline-block">
//                             Poll
//                         </span>
//                         <h2 className="text-2xl font-bold leading-relaxed">
//                             {poll.questions}
//                         </h2>
//                     </div>

//                     {/* Stats Info */}
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
//                             <div className="p-2 rounded-lg bg-blue-500/10">
//                                 <Users size={20} className="text-blue-400" />
//                             </div>
//                             <div>
//                                 <p className="text-xs text-muted-foreground">Total Votes</p>
//                                 <p className="font-bold">{totalVotes}</p>
//                             </div>
//                         </div>
//                         <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
//                             <div className="p-2 rounded-lg bg-purple-500/10">
//                                 <Clock size={20} className="text-purple-400" />
//                             </div>
//                             <div>
//                                 <p className="text-xs text-muted-foreground">
//                                     {poll.status === 'closed' ? 'Status' : 'Ends In'}
//                                 </p>
//                                 <p className="font-bold">
//                                     {poll.status === 'closed' ? 'Closed' : getTimeRemaining(poll.end_date)}
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Voting / Results Section */}
//                     <div className="glass-card rounded-2xl p-6">
//                         <div className="flex items-center gap-2 mb-4">
//                             <ThumbsUp size={18} className="text-blue-400" />
//                             <h3 className="font-bold">
//                                 {hasVoted ? 'Current Standings' : 'Your Choice'}
//                             </h3>
//                         </div>
//                         {!hasVoted && poll?.status === 'active' && (
//                             <p className="text-xs text-muted-foreground mb-6">Cast your vote to see real-time results.</p>
//                         )}

//                         <div className="space-y-4">
//                             {poll.status === 'closed' && (
//                                 <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-4 flex items-center justify-between">
//                                     <span className="text-xs font-bold text-green-400 uppercase">Poll Resolved</span>
//                                     <span className="text-sm font-medium">Winner: {poll.correct_answer}</span>
//                                 </div>
//                             )}
//                             {options.map((option: string, index: number) => {
//                                 const count = voteCounts[option] || 0;
//                                 const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
//                                 const isSelected = selectedAnswer === option;
//                                 const isUserVote = userVote === option;
//                                 const isWinner = poll.status === 'closed' && poll.correct_answer === option;

//                                 return (
//                                     <div key={index} className="space-y-2">
//                                         <div
//                                             onClick={() => !hasVoted && setSelectedAnswer(option)}
//                                             className={`relative p-4 rounded-xl cursor-pointer transition-all border-2 flex items-center justify-between ${hasVoted || poll.status === 'closed'
//                                                 ? (isUserVote || isWinner ? 'border-purple-500 bg-purple-500/5' : 'border-transparent')
//                                                 : (isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-transparent hover:bg-white/5')
//                                                 } glass-card`}
//                                         >
//                                             <div className="flex items-center gap-2">
//                                                 <span className="font-medium relative z-10">{option}</span>
//                                                 {isWinner && <Target size={14} className="text-green-400" />}
//                                             </div>
//                                             {(hasVoted || poll.status === 'closed') && (
//                                                 <span className="text-sm font-bold relative z-10">{percentage}%</span>
//                                             )}
//                                         </div>
//                                         {hasVoted && (
//                                             <Progress value={percentage} className="h-2" />
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         <Button
//                             className="w-full h-12 mt-8 text-lg font-bold"
//                             onClick={handleVote}
//                             disabled={submitting || !selectedAnswer || hasVoted || poll.status === 'closed'}
//                             style={{
//                                 background: poll.status === 'closed'
//                                     ? 'gray'
//                                     : hasVoted
//                                         ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
//                                         : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//                             }}
//                         >
//                             {poll.status === 'closed' ? 'Poll Closed' : hasVoted ? 'Vote Recorded' : submitting ? 'Submitting...' : 'Submit Choice'}
//                         </Button>
//                     </div>

//                     {/* Author Card */}
//                     <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
//                         <Avatar>
//                             <AvatarImage src={poll.user?.avatar_url} />
//                             <AvatarFallback>{poll.user?.name?.[0]}</AvatarFallback>
//                         </Avatar>
//                         <div className="flex-1">
//                             <p className="text-sm font-medium">{poll.user?.name}</p>
//                             <p className="text-xs text-muted-foreground">Poll Creator</p>
//                         </div>
//                         <Calendar size={16} className="text-muted-foreground" />
//                         <span className="text-xs text-muted-foreground">{getFormattedDate(poll.created_at)}</span>
//                     </div>
//                 </motion.div>
//             </div>

//             <MobileNav />
//         </div>
//     );
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
  Users,
  Target,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/store/hooks';
import { getAuth, postAuth } from '@/util/api';

export function PollDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Safe date helpers
  const getTimeRemaining = (dateStr?: string | null) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBD';
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'TBD';
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
      setFetchError('No poll ID provided');
      setLoading(false);
      return;
    }

    const fetchPoll = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const data = await getAuth(`/api/polls/${id}`);
        setPoll(data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setFetchError(err.message || 'Failed to load poll');
        toast.error('Could not load poll');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  const handleVote = async () => {
    if (!selectedAnswer) {
      toast.error('Please select an option');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        answer: selectedAnswer.trim(),
      };

      await postAuth(`/api/polls/${id}/vote`, payload);

      toast.success('Vote recorded successfully!');
      setSelectedAnswer('');
      // Refresh poll data
      const refreshed = await getAuth(`/api/polls/${id}`);
      if (refreshed) setPoll(refreshed);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading poll...</p>
      </div>
    );
  }

  if (fetchError || !poll) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-muted-foreground max-w-md">{fetchError || 'Poll not found'}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  // Check if poll has ended
  const isClosed = poll?.end_date
    ? new Date(poll.end_date) < new Date()
    : poll?.status === 'closed';

  // Calculate vote stats
  const options = poll.options || [];
  const totalVotes = poll.answers_count || 0;

  const voteCounts = options.reduce((acc: any, option: string) => {
    const count = poll.answers?.filter((a: any) => a.answer === option).length || 0;
    acc[option] = count;
    return acc;
  }, {});

  const hasVoted = poll.answers?.some((a: any) => a.user_id === currentUser?.id);
  const userVote = poll.answers?.find((a: any) => a.user_id === currentUser?.id)?.answer;

  // Winner = correct_answer if set, else most voted (optional fallback)
  const winner = poll.correct_answer || 
    (totalVotes > 0 ? Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b) : null);

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Poll Details</h1>
            <Button variant="ghost" size="icon" onClick={() => toast.success('Link copied!')}>
              {/* <Share2 size={20} /> */}
            </Button>
          </div>

          {/* Question */}
          <div className="glass-card rounded-2xl p-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 mb-3 inline-block">
              Poll
            </span>
            <h2 className="text-2xl font-bold leading-relaxed">
              {poll.questions}
            </h2>
          </div>

          {/* Stats Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Votes</p>
                <p className="font-bold">{totalVotes}</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isClosed ? 'Status' : 'Ends In'}
                </p>
                <p className="font-bold">
                  {isClosed ? 'Closed' : getTimeRemaining(poll.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Voting / Results Section */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp size={18} className="text-blue-400" />
              <h3 className="font-bold">
                {isClosed ? 'Final Results' : hasVoted ? 'Current Standings' : 'Your Choice'}
              </h3>
            </div>

            {isClosed ? (
              // ── POLL IS CLOSED ──
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-black/50 border border-purple-500/30 text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 size={28} className="text-purple-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Poll Has Ended
                  </h4>
                  {winner && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Correct / Winning Option</p>
                      <div className="inline-block px-6 py-3 rounded-full bg-green-600/20 text-green-400 border border-green-500/40 text-xl font-bold">
                        {winner}
                      </div>
                    </div>
                  )}
                </div>

                {/* Final percentages */}
                <div className="space-y-5">
                  {options.map((option: string, index: number) => {
                    const count = voteCounts[option] || 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isWinner = option === winner;

                    return (
                      <div key={index} className="space-y-2">
                        <div className={`p-4 rounded-xl flex items-center justify-between border-2 ${
                          isWinner ? 'border-green-500 bg-green-500/10' : 'border-transparent bg-white/5'
                        }`}>
                          <span className="font-medium">{option}</span>
                          <span className="font-bold text-lg">{percentage}% ({count})</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // ── POLL STILL OPEN ──
              <>
                {!hasVoted && (
                  <p className="text-xs text-muted-foreground mb-6">
                    Select your answer and submit your vote
                  </p>
                )}

                <div className="space-y-4">
                  {options.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === option;
                    const isUserVote = userVote === option;

                    return (
                      <div
                        key={index}
                        onClick={() => !hasVoted && setSelectedAnswer(option)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                          hasVoted || isClosed
                            ? (isUserVote ? 'border-purple-500 bg-purple-500/10' : 'border-transparent bg-white/5')
                            : (isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-transparent hover:border-purple-500/40 hover:bg-purple-500/5')
                        } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className="font-medium">{option}</span>
                        {hasVoted && (
                          <span className="text-sm font-bold">
                            {Math.round((voteCounts[option] / totalVotes) * 100)}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!hasVoted && (
                  <Button
                    className="w-full h-14 mt-8 text-lg font-bold"
                    onClick={handleVote}
                    disabled={submitting || !selectedAnswer}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Choice'}
                  </Button>
                )}

                {hasVoted && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                    <p className="font-medium text-purple-300">Your vote has been recorded!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You voted: <strong>{userVote}</strong>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Author Card */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src={poll.user?.avatar_url} />
              <AvatarFallback>{poll.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{poll.user?.name}</p>
              <p className="text-xs text-muted-foreground">Poll Creator</p>
            </div>
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getFormattedDate(poll.created_at)}
            </span>
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}