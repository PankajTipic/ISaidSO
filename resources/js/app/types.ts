export type UserLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: UserLevel;
  accuracy: number;
  predictionsCreated: number;
  predictionsResolved: number;
  rankScore: number;
  badges: Badge[];
  country?: string;
  city?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type Category = 'trending' | 'politics' | 'sports' | 'finance' | 'education' | 'entertainment';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AnswerType = 'yes-no' | 'mcq' | 'numeric' | 'datetime';

export interface PredictionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Prediction {
  id: string;
  category: Category;
  text: string;
  creator: User;
  createdAt: Date;
  votingEndTime: Date;
  resultPublishTime: Date;
  answerType: AnswerType;
  options?: PredictionOption[];
  numericValue?: number;
  numericTolerance?: number;
  datetimeValue?: Date;
  datetimeToleranceHours?: number;
  riskLevel: RiskLevel;
  rewardMultiplier: number;
  visibility: 'public' | 'private';
  groupId?: string;
  agreePercentage: number;
  disagreePercentage: number;
  totalVotes: number;
  status: 'active' | 'voting-ended' | 'resolved';
  actualResult?: any;
  accuracy?: number;
  userVote?: any;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  isPrivate: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
}

export const LEVEL_CONFIG = {
  0: { name: 'New', minPredictions: 0, minAccuracy: 0, color: '#9ca3af', description: 'Less than 10 resolved predictions' },
  1: { name: 'Beginner', minPredictions: 10, minAccuracy: 0, color: '#06b6d4', description: '10+ predictions, <55% accuracy' },
  2: { name: 'Improving', minPredictions: 10, minAccuracy: 55, color: '#10b981', description: '10+ predictions, ≥55% accuracy' },
  3: { name: 'Reliable', minPredictions: 20, minAccuracy: 60, color: '#a855f7', description: '20+ predictions, ≥60% accuracy' },
  4: { name: 'Expert', minPredictions: 30, minAccuracy: 65, color: '#ec4899', description: '30+ predictions, ≥65% accuracy' },
  5: { name: 'Elite', minPredictions: 50, minAccuracy: 70, color: '#fbbf24', description: '50+ predictions, ≥70% accuracy sustained' },
} as const;

export function calculateUserLevel(predictionsResolved: number, accuracy: number): UserLevel {
  if (predictionsResolved < 10) return 0;
  if (predictionsResolved >= 50 && accuracy >= 70) return 5;
  if (predictionsResolved >= 30 && accuracy >= 65) return 4;
  if (predictionsResolved >= 20 && accuracy >= 60) return 3;
  if (predictionsResolved >= 10 && accuracy >= 55) return 2;
  return 1;
}

export function getRiskMultiplier(riskLevel: RiskLevel): number {
  return riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1;
}
