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
      <div className="min-h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] flex flex-col items-center justify-center gap-2 p-6">
        <h2 className="text-sm font-black text-red-400 uppercase">Error</h2>
        <p className="text-muted-foreground text-[10px] text-center font-bold uppercase">{fetchError || 'Not found'}</p>
        <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase">Back</Button>
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

  return (
    <div className="h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
      <TopNav />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 lg:px-6 pt-2 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto w-full flex flex-col gap-1.5 pb-20"
        >
          {/* ── Header Badges ── */}
          <div className="flex items-center gap-1.5 flex-wrap px-0.5">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-all active:scale-90">
              <ArrowLeft size={18} />
            </button>

            <span
              className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border border-transparent shadow-sm"
              style={{ backgroundColor: `${catColor}22`, color: catColor, borderColor: `${catColor}33` }}
            >
              {prediction?.field?.fields || 'GENERAL'}
            </span>

            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] shadow-sm border ${
              isClosed ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
            }`}>
              {isClosed ? 'CLOSED' : 'OPEN'}
            </span>

            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] shadow-sm border ${
              prediction?.visibility === 'private' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' : 'bg-blue-500/10 border-blue-500/30 text-blue-600'
            }`}>
              {prediction?.visibility === 'private' ? <Lock size={10} /> : <Globe size={10} />}
              {prediction?.visibility === 'private' ? 'PRIVATE' : 'PUBLIC'}
            </div>
          </div>

          {/* ── Main Layout Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
            
            {/* LEFT COLUMN (2/3) */}
            <div className="lg:col-span-8 space-y-1.5">

              {/* Banner Card - Premium Gradient */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#0f0c29] via-[#1b1a4b] to-[#302b63] text-white group">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700" style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop')",
                  backgroundSize: 'cover', backgroundPosition: 'right'
                }}></div>
                <div className="relative z-10 flex items-center justify-between p-4 md:p-6 lg:p-8">
                  <div className="space-y-4">
                    <h1 className="text-sm md:text-xl lg:text-2xl font-black leading-tight max-w-xl tracking-tight">
                      {prediction.questions || 'Prediction Question'}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5 lg:w-7 lg:h-7 border-2 border-white/20 shadow-md">
                        <AvatarImage src={prediction.user?.avatar_url} />
                        <AvatarFallback className="text-[8px] bg-slate-700">P</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] lg:text-sm font-bold text-white/90">@{prediction.user?.username || 'user'}</span>
                    </div>
                  </div>
                  {showResultPill && (
                    <div className={`shrink-0 px-3 py-1.5 rounded-xl border-2 font-black text-[10px] lg:text-xs shadow-2xl backdrop-blur-md ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text} animate-in zoom-in duration-500`}>
                      {pillConfig.label} WON
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Card - Visual Polish */}
              <div className="glass-card rounded-2xl px-4 py-4 border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Clock size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Journey</p>
                </div>

                <div className="relative px-4 lg:px-8">
                  <div className="absolute top-[8px] lg:top-[12px] left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/10" />
                  <div className="absolute top-[8px] lg:top-[12px] left-0 h-[2px] bg-purple-500 transition-all duration-1000" style={{ width: '100%' }} />
                  <div className="relative flex justify-between">
                    {[
                      { label: "Created", date: prediction.created_at, done: true },
                      { label: "Voted", date: prediction.voting_end_date, done: true },
                      { label: "Result", date: prediction.end_date, done: true },
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center w-[30%] group">
                        <div className={`w-4 h-4 lg:w-6 lg:h-6 z-10 flex items-center justify-center rounded-full text-[8px] lg:text-[10px] transition-all duration-500 ring-4 ring-white dark:ring-[#0f0f0f] ${
                          step.done ? "bg-purple-500 text-white shadow-lg" : "border-2 border-purple-500 bg-background text-purple-500"
                        }`}>
                          {step.done ? "✓" : ""}
                        </div>
                        <p className="text-[9px] lg:text-[11px] mt-2 font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">{step.label}</p>
                        <p className="text-[8px] lg:text-[10px] text-slate-400 font-bold mt-0.5">{formatDateCompact(step.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outcome / Interaction Card - Leaderboard Style */}
              <div className="glass-card rounded-2xl p-4 lg:p-6 border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Target size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xs lg:text-sm font-black uppercase tracking-widest">{isClosed ? 'Official Verdict' : 'Cast Forecast'}</h3>
                </div>

                {isClosed ? (
                  <div className="text-center py-2">
                    <div className={`px-8 py-3 rounded-[1.5rem] border-4 font-black text-sm lg:text-xl inline-block mb-6 shadow-xl ${pillConfig.bg} ${pillConfig.border} ${pillConfig.text}`}>
                      {resultLabel}
                    </div>
                    {totalValidVotes > 0 && (
                      <div className="max-w-md mx-auto space-y-4">
                        <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Vote Distribution</p>
                        <div className="h-3 lg:h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/5 shadow-inner">
                          <div style={{ width: `${agreePercentage}%` }} className="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000" />
                          <div style={{ width: `${disagreePercentage}%` }} className="bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-1000" />
                          <div style={{ width: `${vaguePercentage}%` }} className="bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-1000" />
                        </div>
                        <div className="flex justify-between text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-tight">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yes {agreePercentage}%</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> No {disagreePercentage}%</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Vague {vaguePercentage}%</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-8 md:h-10 px-6 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white dark:bg-white/5 shadow-sm border-slate-200 dark:border-white/10 mt-4 transition-all hover:scale-105 active:scale-95">
                              View Details ({totalValidVotes})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card border-slate-200 dark:border-white/10 sm:max-w-md p-4">
                            <DialogHeader className="mb-4">
                              <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Community Insights</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                              {answers.map((v: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 transition-all hover:border-purple-500/20 group">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border-2 border-white dark:border-white/10 shadow-sm transition-transform group-hover:scale-110">
                                      <AvatarImage src={v.user?.avatar_url} />
                                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-[10px] font-black">
                                        {v.user?.username?.charAt(0).toUpperCase() || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-[10px] font-black leading-none text-slate-800 dark:text-white">@{v.user?.username || 'anonymous'}</p>
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <div className="px-1 py-0.5 rounded-md bg-purple-500/10 text-purple-500 text-[7px] font-black">LVL {Math.floor((v.user?.points || 0) / 100) + 1}</div>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{v.user?.accuracy || 0}% ACCURACY</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border-2 shadow-sm transition-all ${
                                    v.answer?.toLowerCase() === 'yes' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                    v.answer?.toLowerCase() === 'no' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
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
                                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No votes recorded yet</p>
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
                          className={`py-3 rounded-xl border-2 transition-all font-black text-[10px] lg:text-xs uppercase tracking-widest ${
                            selectedAnswer === option 
                              ? "bg-purple-500 text-white border-purple-400 shadow-lg scale-95" 
                              : "bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-100 dark:border-white/5"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <Button 
                      className="h-12 md:h-auto md:w-32 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
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
            <div className="lg:col-span-4 space-y-2 lg:sticky lg:top-0">
              
              {/* Summary Stats - Premium Card */}
              <div className="glass-card rounded-2xl p-4 border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <TrendingUp size={14} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Analytics</p>
                </div>
                <div className="space-y-1.5 text-[11px] lg:text-xs font-bold uppercase tracking-tight">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <span className="text-slate-400 text-[9px]">Due Date</span>
                    <span className="text-slate-800 dark:text-slate-100">{formatDateCompact(prediction.end_date)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <span className="text-slate-400 text-[9px]">Voters</span>
                    <span className="text-purple-500">{totalValidVotes} Participants</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-green-500/5 border border-green-500/10">
                    <span className="text-green-600/60 text-[9px]">Live Status</span>
                    <span className="text-green-500 font-black">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Creator Card - Leaderboard Style Overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Trophy size={60} strokeWidth={1} />
                </div>
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 ring-2 ring-purple-500/50 ring-offset-2 ring-offset-[#1e1b4b] shadow-2xl">
                      <AvatarImage src={prediction.user?.avatar_url} />
                      <AvatarFallback className="text-xs bg-slate-800">P</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-black leading-none text-white tracking-tight">@{prediction.user?.username || 'user'}</p>
                      <p className="text-[9px] text-white/50 mt-1 font-bold uppercase tracking-widest">Verified Creator</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center border-t border-white/10 pt-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black">8</p>
                      <p className="text-[8px] text-white/40 uppercase font-black">Forecasts</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-emerald-400">62%</p>
                      <p className="text-[8px] text-white/40 uppercase font-black">Accuracy</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-purple-400">145</p>
                      <p className="text-[8px] text-white/40 uppercase font-black">Points</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Card - Compact & Clean */}
              <div className="glass-card rounded-2xl p-4 border border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/5 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Broadcast</p>
                  <div className="flex gap-2">
                    {[Twitter, MessageCircle, Send, Link2].map((Icon, i) => (
                      <button key={i} className="p-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 transition-all active:scale-90 border border-slate-100 dark:border-white/5 shadow-sm">
                        <Icon size={14} strokeWidth={2.5} />
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