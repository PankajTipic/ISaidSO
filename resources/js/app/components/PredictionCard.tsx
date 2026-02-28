// import { Prediction } from '@/app/types';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
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
//   Target
// } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';
// import { useNavigate } from 'react-router';

// interface PredictionCardProps {
//   prediction: Prediction;
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

// const riskColors = {   
//   low: '#10b981',
//   medium: '#fbbf24',
//   high: '#ef4444',
// };

// export function PredictionCard({ prediction }: PredictionCardProps) {
//   const navigate = useNavigate();
//   const Icon = categoryIcons[prediction.category];
//   const categoryColor = categoryColors[prediction.category];
//   const riskColor = riskColors[prediction.riskLevel];

//   const timeRemaining = formatDistanceToNow(prediction.votingEndTime, { addSuffix: true });

//   return (
//     <div 
//       className="glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
//       onClick={() => navigate(`/prediction/${prediction.id}`)}
//       style={{
//         boxShadow: `0 4px 24px ${categoryColor}15`,
//       }}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <div 
//             className="p-2 rounded-lg"
//             style={{ backgroundColor: `${categoryColor}22` }}
//           >
//             <Icon size={18} style={{ color: categoryColor }} />
//           </div>
//           <span 
//             className="text-xs font-medium uppercase tracking-wide"
//             style={{ color: categoryColor }}
//           >
//             {prediction.category}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <div 
//             className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
//             style={{ 
//               backgroundColor: `${riskColor}22`,
//               color: riskColor 
//             }}
//           >
//             <Target size={12} />
//             {prediction.riskLevel.toUpperCase()}
//           </div>
//           <span 
//             className="px-2 py-1 rounded-md text-xs font-bold"
//             style={{ 
//               backgroundColor: '#fbbf2422',
//               color: '#fbbf24'
//             }}
//           >
//             {prediction.rewardMultiplier}x
//           </span>
//         </div>
//       </div>

//       {/* Prediction Text */}
//       <p className="text-base mb-4 text-foreground line-clamp-2">
//         {prediction.text}
//       </p>

//       {/* Creator Info */}
//       <div className="flex items-center gap-2 mb-3">
//         <Avatar className="w-6 h-6">
//           <AvatarImage src={prediction.creator.avatar} alt={prediction.creator.username} />
//           <AvatarFallback>{prediction.creator.username[0]}</AvatarFallback>
//         </Avatar>
//         <span className="text-sm text-muted-foreground">{prediction.creator.username}</span>
//         <LevelBadge level={prediction.creator.level} size="sm" />
//         <span className="text-xs text-muted-foreground ml-auto">
//           {prediction.creator.accuracy.toFixed(1)}% accurate
//         </span>
//       </div>

//       {/* Voting Progress (for yes-no) */}
//       {prediction.answerType === 'yes-no' && (
//         <div className="mb-3">
//           <div className="flex items-center justify-between text-xs mb-1">
//             <span className="flex items-center gap-1 text-[#10b981]">
//               <ThumbsUp size={12} />
//               Agree {prediction.agreePercentage}%
//             </span>
//             <span className="flex items-center gap-1 text-[#ef4444]">
//               <ThumbsDown size={12} />
//               Disagree {prediction.disagreePercentage}%
//             </span>
//           </div>
//           <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
//             <div 
//               className="h-full bg-gradient-to-r from-[#10b981] to-[#10b98188]"
//               style={{ width: `${prediction.agreePercentage}%` }}
//             />
//             <div 
//               className="h-full bg-gradient-to-r from-[#ef444488] to-[#ef4444]"
//               style={{ width: `${prediction.disagreePercentage}%` }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between text-xs text-muted-foreground">
//         <div className="flex items-center gap-1">
//           <Clock size={12} />
//           <span>Ends {timeRemaining}</span>
//         </div>
//         <span>{prediction.totalVotes.toLocaleString()} votes</span>
//       </div>
//     </div>
//   );
// }



















// resources/js/app/components/PredictionCard.tsx

// import { formatDistanceToNow, format } from 'date-fns';
// import { Clock, Calendar, ThumbsUp, ThumbsDown, Users } from 'lucide-react';
// import { Button } from '@/app/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

// interface PredictionCardProps {
//   prediction: any;
// }

// export function PredictionCard({ prediction }: PredictionCardProps) {
//   const navigate = useNavigate();

//   // ────────────────────────────────────────────────
//   // Safe date helpers
//   // ────────────────────────────────────────────────
//   const getTimeAgo = (dateStr?: string | null) => {
//     if (!dateStr) return 'Just now';

//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) {
//       console.warn('Invalid created_at:', dateStr);
//       return '—';
//     }

//     try {
//       return formatDistanceToNow(date, { addSuffix: true });
//     } catch (err) {
//       console.error('date-fns error on created_at:', err);
//       return '—';
//     }
//   };

//   const getEndDateDisplay = (dateStr?: string | null) => {
//     if (!dateStr) return 'TBD';

//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) {
//       console.warn('Invalid end_date:', dateStr);
//       return 'TBD';
//     }

//     try {
//       return format(date, 'MMM dd, yyyy');
//     } catch {
//       return 'TBD';
//     }
//   };

//   // ────────────────────────────────────────────────
//   // Category color mapping
//   // ────────────────────────────────────────────────
//   const categoryColorMap: Record<string, string> = {
//     trending: '#a855f7',
//     politics: '#ef4444',
//     sports: '#10b981',
//     finance: '#fbbf24',
//     education: '#06b6d4',
//     entertainment: '#ec4899',
//   };

//   const category = prediction?.field?.fields?.toLowerCase() || 'trending';
//   const color = categoryColorMap[category] || '#a855f7';

//   // ────────────────────────────────────────────────
//   // Render
//   // ────────────────────────────────────────────────
//   return (
//     <motion.div
//       className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
//       whileHover={{ scale: 1.02 }}
//       onClick={() => navigate(`/prediction/${prediction.id}`)}
//     >
//       {/* Header / User */}
//       <div className="p-5 pb-3 flex items-center gap-3 border-b border-border/40">
//         <Avatar className="h-10 w-10">
//           <AvatarImage src={prediction?.user?.avatar_url} alt={prediction?.user?.name} />
//           <AvatarFallback>{prediction?.user?.name?.[0] || '?'}</AvatarFallback>
//         </Avatar>
//         <div className="flex-1 min-w-0">
//           <p className="font-medium truncate">{prediction?.user?.name || 'Anonymous'}</p>
//           <p className="text-xs text-muted-foreground">
//             {getTimeAgo(prediction?.created_at)}
//           </p>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="p-5 space-y-4">
//         <p className="text-lg font-semibold leading-tight line-clamp-3">
//           {prediction?.questions || 'No question text'}
//         </p>

//         {/* Category & stats */}
//         <div className="flex items-center gap-3 text-sm">
//           <span
//             className="px-3 py-1 rounded-full font-medium text-xs"
//             style={{
//               backgroundColor: `${color}20`,
//               color,
//             }}
//           >
//             {prediction?.field?.fields || 'Other'}
//           </span>

//           <div className="flex items-center gap-1 text-muted-foreground">
//             <Users size={14} />
//             <span>{prediction?.answers_count ?? 0}</span>
//           </div>

//           <div className="flex items-center gap-1 text-muted-foreground">
//             <Calendar size={14} />
//             <span>Ends {getEndDateDisplay(prediction?.end_date)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Footer / Quick vote preview */}
//       <div className="px-5 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
//         <div className="flex gap-3">
//           <Button variant="ghost" size="sm" className="gap-1.5">
//             <ThumbsUp size={16} />
//             <span>Yes</span>
//           </Button>
//           <Button variant="ghost" size="sm" className="gap-1.5">
//             <ThumbsDown size={16} />
//             <span>No</span>
//           </Button>
//         </div>
//         <Button
//           size="sm"
//           variant="outline"
//           className="text-xs"
//           onClick={(e) => {
//             e.stopPropagation();
//             navigate(`/prediction/${prediction.id}`);
//           }}
//         >
//           View
//         </Button>
//       </div>
//     </motion.div>
//   );
// }

















import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { LevelBadge } from '@/app/components/LevelBadge';
import { Progress } from '@/app/components/ui/progress';
import {
  TrendingUp,
  Landmark,
  Trophy,
  DollarSign,
  GraduationCap,
  Film,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PredictionCardProps {
  prediction: any;
}

const categoryIcons = {
  trending: TrendingUp,
  politics: Landmark,
  sports: Trophy,
  finance: DollarSign,
  education: GraduationCap,
  entertainment: Film,
};

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

export function PredictionCard({ prediction }: PredictionCardProps) {
  const navigate = useNavigate();

  // Map category (from field.fields) to icon & color
  const categoryKey = prediction?.field?.fields?.toLowerCase() || 'trending';
  const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons] || TrendingUp;
  const categoryColor = categoryColors[categoryKey as keyof typeof categoryColors] || '#a855f7';

  const timeRemaining = prediction?.end_date
    ? formatDistanceToNow(new Date(prediction.end_date), { addSuffix: true })
    : 'TBD';

  // Calculate voting stats from actual database answers if available
  let agreePercentage = 0;
  let disagreePercentage = 0;
  let totalValidVotes = 0;

  if (prediction?.answers && Array.isArray(prediction.answers)) {
    const agreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'yes').length;
    const disagreeCount = prediction.answers.filter((a: any) => a.answer?.toLowerCase() === 'no').length;
    totalValidVotes = agreeCount + disagreeCount;

    if (totalValidVotes > 0) {
      agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
      disagreePercentage = 100 - agreePercentage;
    }
  } else if (prediction?.yes_count !== undefined && prediction?.no_count !== undefined) {
    // Use aggregate counts from the backend if available
    const agreeCount = prediction.yes_count;
    const disagreeCount = prediction.no_count;
    totalValidVotes = agreeCount + disagreeCount;

    if (totalValidVotes > 0) {
      agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
      disagreePercentage = 100 - agreePercentage;
    }
  } else if (prediction?.answers_count > 0) {
    // Fallback if neither aggregate counts nor answers relation were loaded
    agreePercentage = 50;
    disagreePercentage = 50;
  }

  return (
    <motion.div
      className="glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        const path = prediction?.module_type === 'poll' ? '/poll' : '/prediction';
        navigate(`${path}/${prediction.id}`);
      }}
      style={{
        boxShadow: `0 4px 24px ${categoryColor}15`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${categoryColor}22` }}
          >
            <Icon size={18} style={{ color: categoryColor }} />
          </div>
          <span
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: categoryColor }}
          >
            {prediction?.field?.fields || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Prediction Text */}
      <p className="text-base mb-4 text-foreground line-clamp-2">
        {prediction?.questions || 'No question text'}
      </p>

      {/* Creator Info */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar className="w-6 h-6">
          <AvatarImage src={prediction?.user?.avatar_url} alt={prediction?.user?.name} />
          <AvatarFallback>{prediction?.user?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{prediction?.user?.name || 'Anonymous'}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {/* Placeholder accuracy — replace with real data if available */}
          78.4% accurate
        </span>
      </div>

      {/* Voting Progress (for yes-no type or predictions) */}
      {(prediction?.answer_type?.ans_type?.toLowerCase().includes('yes/no') || prediction?.module_type === 'prediction') && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-[#10b981]">
              <ThumbsUp size={12} />
              Agree {agreePercentage}%
            </span>
            <span className="flex items-center gap-1 text-[#ef4444]">
              <ThumbsDown size={12} />
              Disagree {disagreePercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-[#10b981] to-[#10b98188]"
              style={{ width: `${agreePercentage}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-[#ef444488] to-[#ef4444]"
              style={{ width: `${disagreePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>Ends {timeRemaining}</span>
        </div>
        <span>{prediction?.answers_count?.toLocaleString() || '0'} votes</span>
      </div>
    </motion.div>
  );
}