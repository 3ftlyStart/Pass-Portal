
export enum ModuleType {
  LISTENING = 'Listening',
  READING = 'Reading',
  WRITING = 'Writing',
  SPEAKING = 'Speaking'
}

export interface WritingScore {
  overallBand: number;
  taskResponse: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalRange: string;
  suggestedCorrections: string[];
}

export interface SpeakingSession {
  id: string;
  date: string;
  transcript: { speaker: 'Examiner' | 'Candidate', text: string }[];
  feedback?: string;
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
