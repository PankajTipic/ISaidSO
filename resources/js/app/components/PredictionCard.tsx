import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
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
  Globe,
  Lock,
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

export function PredictionCard({ prediction }: PredictionCardProps) {
  const navigate = useNavigate();

  // Map category (from field.fields) to icon & color
  const categoryKey = prediction?.field?.fields?.toLowerCase() || 'trending';
  const Icon = categoryIcons[categoryKey as keyof typeof categoryIcons] || TrendingUp;
  const categoryColor = categoryColors[categoryKey as keyof typeof categoryColors] || '#a855f7';

  const timeRemaining = prediction?.end_date
    ? formatDistanceToNow(new Date(prediction.end_date), { addSuffix: true })
    : 'TBD';

  // Calculate voting stats
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
    const agreeCount = prediction.yes_count;
    const disagreeCount = prediction.no_count;
    totalValidVotes = agreeCount + disagreeCount;

    if (totalValidVotes > 0) {
      agreePercentage = Math.round((agreeCount / totalValidVotes) * 100);
      disagreePercentage = 100 - agreePercentage;
    }
  } else if (prediction?.answers_count > 0) {
    agreePercentage = 50;
    disagreePercentage = 50;
  }

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-border/50"
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        const path = prediction?.module_type === 'poll' ? '/poll' : '/prediction';
        navigate(`${path}/${prediction.id}`);
      }}
      style={{
        boxShadow: `0 10px 30px ${categoryColor}08`,
      }}
    >
      {/* Header & Category */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${categoryColor}15` }}
          >
            <Icon size={16} style={{ color: categoryColor }} />
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: categoryColor }}
          >
            {prediction?.field?.fields || 'General'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-muted-foreground opacity-60" />
          <span className="text-[10px] font-medium text-muted-foreground">{timeRemaining}</span>
        </div>
      </div>

      {/* Prediction Question Box */}
      <div className="relative bg-muted/20 rounded-2xl p-4 mb-4 border border-border/5 hover:bg-muted/30 transition-colors">
        {/* Visibility Badge inside the Question Box */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider shadow-sm z-10 ${
          prediction?.visibility === 'private'
            ? 'bg-amber-500 text-white border-amber-600'
            : 'bg-primary text-white border-primary-foreground/20'
        }`}>
          {prediction?.visibility === 'private' ? (
            <Lock size={10} strokeWidth={3} />
          ) : (
            <Globe size={10} strokeWidth={3} />
          )}
          <span>{prediction?.visibility || 'Public'}</span>
        </div>

        <p className="text-base md:text-lg font-bold text-foreground line-clamp-3 leading-tight pr-14">
          {prediction?.questions || 'No question text'}
        </p>
      </div>

      {/* Creator Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm">
            <AvatarImage src={prediction?.user?.avatar_url} alt={prediction?.user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {prediction?.user?.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground leading-none">{prediction?.user?.name || 'Anonymous'}</span>
            <span className="text-[10px] text-muted-foreground mt-1 font-medium italic">
              Success Rate: <span className="text-primary font-bold not-italic">{prediction?.user?.accuracy || '78'}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Voting Progress */}
      {(prediction?.answer_type?.ans_type?.toLowerCase().includes('yes/no') || prediction?.module_type === 'prediction') && (
        <div className="mb-4">
          {/* Majority Results Bar */}
          <div className="px-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <span className="text-green-500">Yes {Math.round((prediction.yes_count / (prediction.answers_count || 1)) * 100)}%</span>
              <span className="text-amber-500">Vague {Math.round((prediction.vague_count / (prediction.answers_count || 1)) * 100)}%</span>
              <span className="text-red-500">No {Math.round((prediction.no_count / (prediction.answers_count || 1)) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${(prediction.yes_count / (prediction.answers_count || 1)) * 100}%` }}
              />
              <div 
                className="h-full bg-amber-500/50 transition-all duration-500" 
                style={{ width: `${(prediction.vague_count / (prediction.answers_count || 1)) * 100}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={{ width: `${(prediction.no_count / (prediction.answers_count || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="opacity-70" />
          <span className="font-medium">{timeRemaining}</span>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
          <span className="font-bold text-foreground/80">{prediction?.answers_count || 0}</span>
          <span className="opacity-70">votes</span>
        </div>
      </div>
    </motion.div>
  );
}