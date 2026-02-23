import { UserLevel, LEVEL_CONFIG } from '@/app/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface LevelBadgeProps {
  level: UserLevel;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function LevelBadge({ level, size = 'md', showTooltip = true }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        background: `linear-gradient(135deg, ${config.color}22 0%, ${config.color}11 100%)`,
        border: `1px solid ${config.color}55`,
        color: config.color,
      }}
    >
      <span className="font-semibold">{config.name}</span>
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="glass-card">
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
