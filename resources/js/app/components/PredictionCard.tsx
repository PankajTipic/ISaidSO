// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { useAppSelector } from '@/app/store/hooks';
// import { toast } from 'sonner';
// import {
//   TrendingUp,
//   Landmark,
//   Trophy,
//   DollarSign,
//   GraduationCap,
//   Film,
//   Clock,
//   ThumbsUp,
//   ThumbsDown,
//   Globe,
//   Lock,
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

// interface PredictionCardProps {
//   prediction: any;
// }

// const categoryIcons = {
//   trending: TrendingUp,
//   politics: Landmark,
//   sports: Trophy,
//   finance: DollarSign,
//   education: GraduationCap,
//   entertainment: Film,
// };

// const categoryColors = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };

// export function PredictionCard({ prediction }: PredictionCardProps) {
//   const navigate = useNavigate();
//   const isGuest = useAppSelector((state) => state.auth.isGuest);

//   // Map category (from field.fields) to icon & color
//   const categoryKey = prediction?.field?.fields?.toLowerCase() || 'trending';
//   const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons] || TrendingUp;
//   const categoryColor = categoryColors[categoryKey as keyof typeof categoryColors] || '#a855f7';

//   const timeRemaining = prediction?.end_date
//     ? formatDistanceToNow(new Date(prediction.end_date), { addSuffix: true })
//     : 'TBD';

//   // Calculate voting stats
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
//   } else if (prediction?.yes_count !== undefined && prediction?.no_count !== undefined) {
//     const agreeCount = prediction.yes_count;
//     const disagreeCount = prediction.no_count;
//     totalValidVotes = agreeCount + disagreeCount;

//     if (totalValidVotes > 0) {
//       agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
//       disagreePercentage = 100 - agreePercentage;
//     }
//   } else if (prediction?.answers_count > 0) {
//     agreePercentage = 50;
//     disagreePercentage = 50;
//   }

//   return (
//     <motion.div
//       className="glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-border/50"
//       whileHover={{ scale: 1.02 }}
//       onClick={() => {
//         if (isGuest) {
//           toast.info('Please log in or create an account to view details', {
//             action: {
//               label: 'Log In',
//               onClick: () => navigate('/auth')
//             }
//           });
//           return;
//         }
//         const path = prediction?.module_type === 'poll' ? '/poll' : '/prediction';
//         navigate(`${path}/${prediction.id}`);
//       }}
//       style={{
//         boxShadow: `0 10px 30px ${categoryColor}08`,
//       }}
//     >
//       {/* Header & Category */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <div
//             className="p-1.5 rounded-lg"
//             style={{ backgroundColor: `${categoryColor}15` }}
//           >
//             <Icon size={16} style={{ color: categoryColor }} />
//           </div>
//           <span
//             className="text-[10px] font-bold uppercase tracking-wider"
//             style={{ color: categoryColor }}
//           >
//             {prediction?.field?.fields || 'General'}
//           </span>
//         </div>

//         <div className="flex items-center gap-1.5">
//           <Clock size={12} className="text-muted-foreground opacity-60" />
//           <span className="text-[10px] font-medium text-muted-foreground">{timeRemaining}</span>
//         </div>
//       </div>

//       {/* Prediction Question Box */}
//       <div className="relative bg-muted/20 rounded-2xl p-4 mb-4 border border-border/5 hover:bg-muted/30 transition-colors">
//         {/* Visibility Badge inside the Question Box */}
//         <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider shadow-sm z-10 ${
//           prediction?.visibility === 'private'
//             ? 'bg-amber-500 text-white border-amber-600'
//             : 'bg-primary text-white border-primary-foreground/20'
//         }`}>
//           {prediction?.visibility === 'private' ? (
//             <Lock size={10} strokeWidth={3} />
//           ) : (
//             <Globe size={10} strokeWidth={3} />
//           )}
//           <span>{prediction?.visibility || 'Public'}</span>
//         </div>

//         <p className="text-base md:text-lg font-bold text-foreground line-clamp-3 leading-tight pr-14">
//           {prediction?.questions || 'No question text'}
//         </p>
//       </div>

//       {/* Creator Info */}
//       <div className="flex items-center justify-between mb-4 px-1">
//         <div className="flex items-center gap-2">
//           <Avatar className={`w-8 h-8 ring-2 ring-background shadow-sm ${isGuest ? 'blur-[2px]' : ''}`}>
//             <AvatarImage src={prediction?.user?.avatar_url} alt={prediction?.user?.name} />
//             <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
//               {prediction?.user?.name?.[0] || '?'}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex flex-col">
//             <span className={`text-xs font-bold text-foreground leading-none ${isGuest ? 'blur-[4px] select-none' : ''}`}>
//                 {prediction?.user?.name || 'Anonymous'}
//             </span>
//             <span className="text-[10px] text-muted-foreground mt-1 font-medium italic">
//               Success Rate: <span className="text-primary font-bold not-italic">{prediction?.user?.accuracy || '78'}%</span>
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Voting Progress */}
//       {(prediction?.answer_type?.ans_type?.toLowerCase().includes('yes/no') || prediction?.module_type === 'prediction') && (
//         <div className="mb-4">
//           {/* Majority Results Bar */}
//           <div className="px-2">
//             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
//               <span className="text-green-500">Yes {Math.round((prediction.yes_count / (prediction.answers_count || 1)) * 100)}%</span>
//               <span className="text-amber-500">Vague {Math.round((prediction.vague_count / (prediction.answers_count || 1)) * 100)}%</span>
//               <span className="text-red-500">No {Math.round((prediction.no_count / (prediction.answers_count || 1)) * 100)}%</span>
//             </div>
//             <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex">
//               <div 
//                 className="h-full bg-green-500 transition-all duration-500" 
//                 style={{ width: `${(prediction.yes_count / (prediction.answers_count || 1)) * 100}%` }}
//               />
//               <div 
//                 className="h-full bg-amber-500/50 transition-all duration-500" 
//                 style={{ width: `${(prediction.vague_count / (prediction.answers_count || 1)) * 100}%` }}
//               />
//               <div 
//                 className="h-full bg-red-500 transition-all duration-500" 
//                 style={{ width: `${(prediction.no_count / (prediction.answers_count || 1)) * 100}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
//         <div className="flex items-center gap-1.5">
//           <Clock size={14} className="opacity-70" />
//           <span className="font-medium">{timeRemaining}</span>
//         </div>
//         <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
//           <span className="font-bold text-foreground/80">{prediction?.answers_count || 0}</span>
//           <span className="opacity-70">votes</span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }









// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { useAppSelector } from '@/app/store/hooks';
// import { toast } from 'sonner';
// import {
//   TrendingUp,
//   Landmark,
//   Trophy,
//   DollarSign,
//   GraduationCap,
//   Film,
//   Clock,
//   Globe,
//   Lock,
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

// interface PredictionCardProps {
//   prediction: any;
// }

// const categoryIcons = {
//   trending: TrendingUp,
//   politics: Landmark,
//   sports: Trophy,
//   finance: DollarSign,
//   education: GraduationCap,
//   entertainment: Film,
// };

// const categoryColors = {
//   trending: '#a855f7',
//   politics: '#ef4444',
//   sports: '#10b981',
//   finance: '#fbbf24',
//   education: '#06b6d4',
//   entertainment: '#ec4899',
// };

// export function PredictionCard({ prediction }: PredictionCardProps) {
//   const navigate = useNavigate();
//   const isGuest = useAppSelector((state) => state.auth.isGuest);

//   const categoryKey = prediction?.field?.fields?.toLowerCase() || 'trending';
//   const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons] || TrendingUp;
//   const categoryColor = categoryColors[categoryKey as keyof typeof categoryColors] || '#a855f7';

//   const timeRemaining = prediction?.end_date
//     ? formatDistanceToNow(new Date(prediction.end_date), { addSuffix: true })
//     : 'TBD';

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
//   } else if (prediction?.yes_count !== undefined && prediction?.no_count !== undefined) {
//     const agreeCount = prediction.yes_count;
//     const disagreeCount = prediction.no_count;
//     totalValidVotes = agreeCount + disagreeCount;
//     if (totalValidVotes > 0) {
//       agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
//       disagreePercentage = 100 - agreePercentage;
//     }
//   } else if (prediction?.answers_count > 0) {
//     agreePercentage = 50;
//     disagreePercentage = 50;
//   }

//   return (
//     <motion.div
//       className="glass-card rounded-xl p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-border/50"
//       whileHover={{ scale: 1.02 }}
//       onClick={() => {
//         if (isGuest) {
//           toast.info('Please log in or create an account to view details', {
//             action: { label: 'Log In', onClick: () => navigate('/auth') }
//           });
//           return;
//         }
//         const path = prediction?.module_type === 'poll' ? '/poll' : '/prediction';
//         navigate(`${path}/${prediction.id}`);
//       }}
//       style={{ boxShadow: `0 4px 12px ${categoryColor}08` }}
//     >
//       {/* Header & Category */}
//       <div className="flex items-center justify-between mb-0.5">
//         <div className="flex items-center gap-1">
//           <div className="p-1 rounded-md" style={{ backgroundColor: `${categoryColor}15` }}>
//             <Icon size={11} style={{ color: categoryColor }} />
//           </div>
//           <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: categoryColor }}>
//             {prediction?.field?.fields || 'General'}
//           </span>
//         </div>
//         <div className="flex items-center gap-1">
//           <Clock size={9} className="text-muted-foreground opacity-60" />
//           <span className="text-[9px] font-medium text-muted-foreground">{timeRemaining}</span>
//         </div>
//       </div>

//       {/* Prediction Question Box */}
//       <div className="relative bg-muted/20 rounded-xl p-2 mb-0.5 border border-border/5 hover:bg-muted/30 transition-colors">
//         <div className={`absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm z-10 ${
//           prediction?.visibility === 'private'
//             ? 'bg-amber-500 text-white border-amber-600'
//             : 'bg-primary text-white border-primary-foreground/20'
//         }`}>
//           {prediction?.visibility === 'private' ? (
//             <Lock size={8} strokeWidth={3} />
//           ) : (
//             <Globe size={8} strokeWidth={3} />
//           )}
//           <span>{prediction?.visibility || 'Public'}</span>
//         </div>

//         <p className="text-sm font-bold text-foreground line-clamp-3 leading-tight pr-12">
//           {prediction?.questions || 'No question text'}
//         </p>
//       </div>

//       {/* Creator Info */}
//       <div className="flex items-center mb-0.5 px-0.5">
//         <div className="flex items-center gap-1.5">
//           <Avatar className={`w-6 h-6 ring-1 ring-background shadow-sm ${isGuest ? 'blur-[2px]' : ''}`}>
//             <AvatarImage src={prediction?.user?.avatar_url} alt={prediction?.user?.name} />
//             <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
//               {prediction?.user?.name?.[0] || '?'}
//             </AvatarFallback>
//           </Avatar>
//           <div className="flex flex-col">
//             <span className={`text-[10px] font-bold text-foreground leading-none ${isGuest ? 'blur-[4px] select-none' : ''}`}>
//               {prediction?.user?.name || 'Anonymous'}
//             </span>
//             <span className="text-[9px] text-muted-foreground font-medium italic">
//               Success Rate: <span className="text-primary font-bold not-italic">{prediction?.user?.accuracy || '78'}%</span>
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Voting Progress */}
//       {(prediction?.answer_type?.ans_type?.toLowerCase().includes('yes/no') || prediction?.module_type === 'prediction') && (
//         <div className="mb-0.5">
//           <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-0.5">
//             <span className="text-green-500">Yes {Math.round((prediction.yes_count / (prediction.answers_count || 1)) * 100)}%</span>
//             <span className="text-amber-500">Vague {Math.round((prediction.vague_count / (prediction.answers_count || 1)) * 100)}%</span>
//             <span className="text-red-500">No {Math.round((prediction.no_count / (prediction.answers_count || 1)) * 100)}%</span>
//           </div>
//           <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden flex">
//             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(prediction.yes_count / (prediction.answers_count || 1)) * 100}%` }} />
//             <div className="h-full bg-amber-500/50 transition-all duration-500" style={{ width: `${(prediction.vague_count / (prediction.answers_count || 1)) * 100}%` }} />
//             <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(prediction.no_count / (prediction.answers_count || 1)) * 100}%` }} />
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1.5 border-t border-border/30">
//         <div className="flex items-center gap-1">
//           <Clock size={10} className="opacity-70" />
//           <span className="font-medium">{timeRemaining}</span>
//         </div>
//         <div className="flex items-center gap-0.5 bg-muted/50 px-1.5 py-0.5 rounded-full">
//           <span className="font-bold text-foreground/80">{prediction?.answers_count || 0}</span>
//           <span className="opacity-70">votes</span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }







import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useAppSelector } from '@/app/store/hooks';
import { toast } from 'sonner';
import {
  TrendingUp, Landmark, Trophy, DollarSign,
  GraduationCap, Film, Clock, Users, Lock, Globe, Flame
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PredictionCardProps {
  prediction: any;
}

const categoryMeta = {
  trending: { icon: TrendingUp, color: '#22c55e', label: 'TRENDING' },
  politics: { icon: Landmark, color: '#ef4444', label: 'POLITICS' },
  sports: { icon: Trophy, color: '#3b82f6', label: 'SPORTS' },
  finance: { icon: DollarSign, color: '#eab308', label: 'FINANCE' },
  education: { icon: GraduationCap, color: '#8b5cf6', label: 'EDUCATION' },
  entertainment: { icon: Film, color: '#ec4899', label: 'ENTERTAINMENT' },
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  const navigate = useNavigate();
  const isGuest = useAppSelector((state) => state.auth.isGuest);

  const key = prediction?.field?.fields?.toLowerCase() || 'trending';
  const meta = categoryMeta[key] || categoryMeta.trending;
  const Icon = meta.icon;

  const timeLeft = prediction?.end_date
    ? formatDistanceToNow(new Date(prediction.end_date), { addSuffix: true })
    : 'TBD';

  let yesPct = 0;
  let noPct = 0;
  let totalVotes = 0;

  if (prediction?.answers && Array.isArray(prediction.answers)) {
    const yesC = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
    const noC = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
    totalVotes = yesC + noC;
    yesPct = totalVotes > 0 ? Math.round((yesC / totalVotes) * 100) : 0;
    noPct = totalVotes > 0 ? Math.round((noC / totalVotes) * 100) : 0;
  } else if (prediction?.yes_count !== undefined && prediction?.no_count !== undefined) {
    totalVotes = prediction.yes_count + prediction.no_count;
    yesPct = totalVotes > 0 ? Math.round((prediction.yes_count / totalVotes) * 100) : 0;
    noPct = 100 - yesPct;
  }

  const handleClick = () => {
    if (isGuest) {
      toast.info('Please login to view details', {
        action: { label: 'Login', onClick: () => navigate('/auth') }
      });
      return;
    }
    navigate(`/prediction/${prediction.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl cursor-pointer h-full flex flex-col relative"
    >
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Time */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-slate-100">
              <Icon size={18} style={{ color: meta.color }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-slate-700">
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={14} />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Question */}
        <p className="font-semibold text-[15.5px] leading-snug text-slate-800 line-clamp-3 flex-1 mb-6 group-hover:text-slate-900 transition-colors">
          {prediction?.questions}
        </p>

        {/* Creator */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-8 h-8 ring-2 ring-white">
            <AvatarImage src={prediction?.user?.avatar_url} />
            <AvatarFallback className="bg-slate-100 text-xs font-bold">
              {prediction?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">@{prediction?.user?.username || 'anonymous'}</p>
            <p className="text-xs text-emerald-600 font-medium">{prediction?.user?.accuracy || '78'}% accuracy</p>
          </div>
        </div>

        {/* Progress Bar - Screenshot Style */}
        <div className="mt-auto">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex mb-2">
            <div 
              className="h-full bg-emerald-500 transition-all" 
              style={{ width: `${yesPct}%` }}
            />
            <div 
              className="h-full bg-red-500 transition-all" 
              style={{ width: `${noPct}%` }}
            />
          </div>

          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-600">YES {yesPct}%</span>
            <span className="text-red-600">NO {noPct}%</span>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 mt-3">
            <div className="flex items-center gap-1">
              <Users size={13} /> {totalVotes} votes
            </div>
            <span className="text-emerald-600 font-medium cursor-pointer hover:underline">Predict Now →</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}