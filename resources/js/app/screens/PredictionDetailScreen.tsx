import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { TopNav } from '@/app/components/TopNav';
import { MobileNav } from '@/app/components/MobileNav';
import { Twitter, Send, MessageCircle, Link2 } from "lucide-react";
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
  ShieldCheck,
  TrendingUp,
  Trophy,
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

const cardPalettes = [
  { border: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
  { border: '#ec4899', bg: 'rgba(236,72,153,0.06)' },
  { border: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
  { border: '#10b981', bg: 'rgba(16,185,129,0.06)' },
  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
];

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
      <div className="min-h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse font-bold text-xs uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (fetchError || !prediction) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-lg font-black text-red-500 uppercase">Error</h2>
        <p className="text-muted-foreground text-sm text-center font-bold uppercase">{fetchError || 'Not found'}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="h-10 px-6 rounded-xl text-xs font-bold uppercase">Back</Button>
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
  const hasVoted = answers.some((a: any) => a.user_id === currentUser?.id);
  const userVote = answers.find((a: any) => a.user_id === currentUser?.id)?.answer?.toUpperCase();

  const catColor = categoryColors[prediction?.field?.fields?.toLowerCase() || 'trending'] || '#a855f7';
  const resultLabel = getResultLabel(totalValidVotes, agreePercentage, disagreePercentage, vaguePercentage);
  const outcome = getOutcomeFromLabel(resultLabel);

  const pillConfig = {
    yes: { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-500', icon: <CheckCircle2 size={10} />, label: 'YES' },
    no: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-500', icon: <XCircle size={10} />, label: 'NO' },
    vague: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-500', icon: <HelpCircle size={10} />, label: 'VAGUE' },
  }[outcome];

  const showResultPill = isClosed || hasVoted;

  const categoryImages: Record<string, string> = {
    'SHAREMARKET': 'https://images.unsplash.com/photo-1611974717482-9828d2824246?q=80&w=1000&auto=format&fit=crop',
    'MOVIES/ENTERTAINMENT': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop',
    'POLITICS': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000&auto=format&fit=crop',
    'SPORTS': 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000&auto=format&fit=crop',
    'TECHNOLOGY': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    'GENERAL': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
  };

  const currentCat = prediction?.field?.fields?.toUpperCase() || 'GENERAL';
  const bannerImage = categoryImages[currentCat] || categoryImages['GENERAL'];

  return (
    <div className="h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] flex flex-col overflow-hidden text-[#111111] font-roboto">
      <TopNav />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-6 pt-2 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto w-full flex flex-col gap-1 pb-16"
        >
          {/* ── Header Badges ── */}
          <div className="flex items-center gap-1.5 flex-wrap px-0.5">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all active:scale-90">
              <ArrowLeft size={18} />
            </button>

            <span
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight border border-transparent"
              style={{ backgroundColor: `${catColor}15`, color: catColor, borderColor: `${catColor}25` }}
            >
              {prediction?.field?.fields || 'GENERAL'}
            </span>

            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight border ${isClosed ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
              }`}>
              {isClosed ? 'CLOSED' : 'OPEN'}
            </span>

            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight border ${prediction?.visibility === 'private' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
              {prediction?.visibility === 'private' ? <Lock size={11} /> : <Globe size={11} />}
              {prediction?.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}
            </div>
          </div>

          {/* ── Main Layout Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">

            {/* LEFT COLUMN (2/3) */}
            <div className="lg:col-span-8 space-y-1">

              {/* Banner Card - Fresh Color */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border" style={{ borderLeft: `3px solid ${cardPalettes[0].border}`, background: cardPalettes[0].bg, borderColor: `${cardPalettes[0].border}30` }}>
                <div className="absolute top-0 right-0 w-3/4 h-full opacity-[0.04] pointer-events-none" style={{
                  backgroundImage: `url('${bannerImage}')`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  maskImage: 'linear-gradient(to left, black, transparent)',
                  WebkitMaskImage: 'linear-gradient(to left, black, transparent)'
                }}></div>
                <div className="relative z-10 flex items-center justify-between p-4 md:p-5">
                  <div className="space-y-3">
                    <h1 className="text-[15px] md:text-[18px] font-bold leading-tight max-w-2xl text-[#111111]">
                      {prediction.questions || 'Prediction Question'}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-gray-200">
                        <AvatarImage src={prediction.user?.avatar_url} />
                        <AvatarFallback className="text-[10px] bg-gray-100">P</AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-medium text-[#667781]">@{prediction.user?.username || 'user'}</span>
                    </div>
                  </div>
                  {showResultPill && (
                    <div className={`shrink-0 px-3 py-1 rounded-xl border font-bold text-[11px] ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text} animate-in zoom-in duration-500`}>
                      {pillConfig.label} WON
                    </div>
                  )}
                </div>
              </div>

              {/* Live Journey - Proper Design */}
              <div className="rounded-2xl px-5 py-5 border border-gray-100 dark:border-white/5 shadow-sm" style={{ borderLeft: `3px solid ${cardPalettes[1].border}`, background: cardPalettes[1].bg }}>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={15} className="text-[#111111]" />
                  <p className="text-[14px] font-bold text-[#111111]">Live Journey</p>
                </div>

                <div className="relative px-2">
                  {/* Background Track */}
                  <div className="absolute top-[12px] left-0 right-0 h-[3px] bg-gray-100 dark:bg-white/10 rounded-full" />

                  {/* Dynamic Progress Track */}
                  <div
                    className="absolute top-[12px] left-0 h-[3px] bg-gradient-to-r from-[#111111] to-[#444444] rounded-full transition-all duration-1000"
                    style={{
                      width: isClosed ? '100%' : (new Date() > new Date(prediction.voting_end_date) ? '66%' : '33%')
                    }}
                  />

                  <div className="relative flex justify-between">
                    {[
                      { label: "Created", date: prediction.created_at, done: true },
                      { label: "Voting Ends", date: prediction.voting_end_date, done: new Date() >= new Date(prediction.voting_end_date) },
                      { label: "Prediction Due", date: prediction.end_date, done: isClosed },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center w-[33%]">
                        <div className={`w-6 h-6 z-10 flex items-center justify-center rounded-full text-[10px] transition-all duration-500 ring-4 ring-white dark:ring-[#0f0f0f] ${step.done ? "bg-[#111111] text-white shadow-md" : "bg-gray-100 text-gray-400"
                          }`}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <p className={`text-[12px] mt-2 font-bold ${step.done ? "text-[#111111]" : "text-[#667781]"}`}>{step.label}</p>
                        <p className="text-[11px] text-[#667781] font-medium mt-0.5">{formatDateCompact(step.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outcome / Interaction Card - Leaderboard Style */}
              <div className="rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-white/5 shadow-sm" style={{ borderLeft: `3px solid ${cardPalettes[2].border}`, background: cardPalettes[2].bg }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-[#667781]" />
                  <h3 className="text-[12px] font-bold text-[#667781] uppercase tracking-wide">{isClosed ? 'Official Verdict' : 'Cast Forecast'}</h3>
                </div>

                {isClosed ? (
                  <div className="text-center">
                    <div className={`px-6 py-2 rounded-xl border-2 font-bold text-[15px] inline-block mb-4 shadow-sm ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text}`}>
                      {resultLabel}
                    </div>
                    {totalValidVotes > 0 && (
                      <div className="max-w-md mx-auto space-y-2.5">
                        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100 dark:bg-white/5">
                          <div style={{ width: `${agreePercentage}%` }} className="bg-emerald-500 transition-all duration-1000" />
                          <div style={{ width: `${disagreePercentage}%` }} className="bg-rose-500 transition-all duration-1000" />
                          <div style={{ width: `${vaguePercentage}%` }} className="bg-amber-500 transition-all duration-1000" />
                        </div>
                        <div className="flex justify-between text-[12px] font-bold text-[#111111] tracking-tight px-1">
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yes {agreePercentage}%</span>
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> No {disagreePercentage}%</span>
                          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Vague {vaguePercentage}%</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-10 px-8 rounded-xl text-[13px] font-medium bg-white dark:bg-white/5 border-gray-200 mt-6 hover:bg-gray-50 transition-all">
                              View Details ({totalValidVotes})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border-slate-200 dark:border-white/10 sm:max-w-md p-4">
                            <DialogHeader className="mb-4">
                              <DialogTitle className="text-[14px] font-bold text-[#111111] uppercase tracking-wide">Community Insights</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                              {answers.map((v: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all hover:border-purple-500/20 group">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9 border border-gray-100">
                                      <AvatarImage src={v.user?.avatar_url} />
                                      <AvatarFallback className="bg-gray-100 text-[12px] font-bold">
                                        {v.user?.username?.charAt(0).toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-[14px] font-bold text-[#111111]">@{v.user?.username || 'anonymous'}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="px-1.5 py-0.5 rounded bg-gray-100 text-[#667781] text-[10px] font-bold">LVL {Math.floor((v.user?.points || 0) / 100) + 1}</div>
                                        <p className="text-[11px] text-[#667781] font-medium uppercase">{v.user?.accuracy || 0}% ACCURACY</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`px-3 py-1 rounded-lg text-[12px] font-bold tracking-tight border ${v.answer?.toLowerCase() === 'yes' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                      v.answer?.toLowerCase() === 'no' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {v.answer?.toUpperCase()}
                                  </div>
                                </div>
                              ))}
                              {answers.length === 0 && (
                                <div className="text-center py-10">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <Users size={24} className="text-slate-300 dark:text-slate-600" />
                                  </div>
                                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No votes recorded yet</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {(['Yes', 'No', 'Vague'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedAnswer(option)}
                          className={`py-3.5 rounded-xl border-2 transition-all font-bold text-[14px] uppercase tracking-wide ${selectedAnswer === option
                              ? "bg-[#111111] text-white border-[#111111] shadow-md"
                              : "bg-white dark:bg-white/5 border-gray-100 hover:bg-gray-50"
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <Button
                      className="h-14 md:h-auto md:w-36 rounded-xl text-[14px] font-bold bg-[#111111] hover:bg-[#222222] transition-all"
                      onClick={handleVote}
                      disabled={submitting || !selectedAnswer || hasVoted}
                    >
                      {submitting ? '...' : 'SUBMIT'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (1/3) */}
            <div className="lg:col-span-4 space-y-1 lg:sticky lg:top-0">

              {/* Summary Stats - Premium Card */}
              <div className="rounded-2xl p-4 border border-gray-100 shadow-sm" style={{ borderLeft: `3px solid ${cardPalettes[3].border}`, background: cardPalettes[3].bg }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={15} className="text-[#667781]" />
                  <p className="text-[12px] font-bold text-[#667781]">Analytics</p>
                </div>
                <div className="space-y-1.5 text-[14px] font-medium text-[#111111]">
                  <div className="flex flex-col p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100">
                    <span className="text-[#667781] text-[11px] mb-1">Timeline</span>
                    <span className="font-bold">
                      {formatDateCompact(prediction.voting_end_date)} | {formatDateCompact(prediction.end_date)}
                    </span>
                    <p className="text-[10px] text-[#667781] mt-1">Voting Ends | Prediction Due</p>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100">
                    <span className="text-[#667781] text-[11px]">Voters</span>
                    <span className="text-[#111111] font-bold">{totalValidVotes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-600 text-[11px]">Status</span>
                    <span className="text-emerald-600 font-bold uppercase">{isClosed ? 'Closed' : 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Creator Card - Leaderboard Style Overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Trophy size={60} strokeWidth={1} />
                </div>
                <div className="relative z-10 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-9 h-9 ring-2 ring-white/20 shadow-lg">
                      <AvatarImage src={prediction.user?.avatar_url} />
                      <AvatarFallback className="text-xs bg-gray-800">P</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[14px] font-bold leading-none text-white">@{prediction.user?.username || 'user'}</p>
                      <p className="text-[10px] text-white/50 mt-1 font-medium uppercase">Verified Creator</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-white/10 pt-4">
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-bold">8</p>
                      <p className="text-[10px] text-white/40 font-medium">Forecasts</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-bold text-emerald-400">62%</p>
                      <p className="text-[10px] text-white/40 font-medium">Accuracy</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-bold text-amber-400">145</p>
                      <p className="text-[10px] text-white/40 font-medium">Points</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Card - Compact & Clean */}
              <div className="rounded-2xl p-3 border border-gray-100 shadow-sm" style={{ borderLeft: `3px solid ${cardPalettes[4].border}`, background: cardPalettes[4].bg }}>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#667781] uppercase tracking-widest">Broadcast</p>
                  <div className="flex gap-2">
                    {[Twitter, MessageCircle, Send, Link2].map((Icon, i) => (
                      <button key={i} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#667781] transition-all border border-gray-100">
                        <Icon size={14} />
                      </button>
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










