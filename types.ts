
export enum ModuleType {
  LISTENING = 'Listening',
  READING = 'Reading',
  WRITING = 'Writing',
  SPEAKING = 'Speaking'
}

export type UserRole = 'admin' | 'teacher' | 'student';
export type SubscriptionTier = 'free' | 'pro' | 'unlimited';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  targetScore?: number;
  credits: number;
  points: number;
  referralCode?: string;
  referredBy?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: any;
  updatedAt: any;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  status: 'pending' | 'completed';
  pointsAwarded: number;
  timestamp: any;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  pointsSpent: number;
  rewardType: 'credits' | 'subscription_discount';
  rewardValue: number;
  timestamp: any;
}

export interface CreditTransaction {
  id: string;
  amount: number; // positive for buy, negative for spend
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  module?: ModuleType;
  description: string;
  timestamp: any;
}

export interface WritingScore {
  overallBand: number;
  taskResponse: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalRange: string;
  suggestedCorrections: string[];
}

export interface SpeakingScore {
  overallBand: number;
  fluencyCoherence: string;
  lexicalResource: string;
  grammaticalRange: string;
  pronunciation: string;
}

export interface SpeakingSession {
  id: string;
  date: string;
  transcript: { sender: 'Examiner' | 'You', text: string }[];
  audioUrl?: string;
  audioBlobId?: string; // For IndexedDB storage
  feedback?: string;
  overallBand?: number;
  scores?: SpeakingScore;
}

export interface ReadingQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingPassage {
  title: string;
  content: string;
  questions: ReadingQuestion[];
}
