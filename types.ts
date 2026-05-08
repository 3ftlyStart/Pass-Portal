
export enum ModuleType {
  LISTENING = 'Listening',
  READING = 'Reading',
  WRITING = 'Writing',
  SPEAKING = 'Speaking'
}

export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  targetScore?: number;
  createdAt: any;
  updatedAt: any;
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
