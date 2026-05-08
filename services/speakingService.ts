
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { set, get } from 'idb-keyval';
import { SpeakingSession, SpeakingScore } from '../types';

const SESSIONS_COLLECTION = 'speaking_sessions';

export const saveSpeakingSession = async (
  transcript: { sender: 'Examiner' | 'You', text: string }[],
  feedback: string,
  band: number,
  audioBlob?: Blob,
  scores?: SpeakingScore
) => {
  if (!auth.currentUser) throw new Error("User must be signed in to save sessions.");

  const sessionId = crypto.randomUUID();
  
  // 1. Save audio to IndexedDB (local storage for large blobs)
  if (audioBlob) {
    await set(`audio_${sessionId}`, audioBlob);
  }

  // 2. Save metadata and transcript to Firestore
  const sessionData = {
    userId: auth.currentUser.uid,
    date: new Date().toISOString(),
    transcript,
    feedback,
    overallBand: band,
    scores,
    audioBlobId: sessionId, // ID to retrieve from IDB
    createdAt: Timestamp.now()
  };

  await addDoc(collection(db, SESSIONS_COLLECTION), sessionData);
  return sessionId;
};

export const getSpeakingHistory = async (): Promise<SpeakingSession[]> => {
  if (!auth.currentUser) return [];

  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SpeakingSession));
};

export const getAudioBlob = async (blobId: string): Promise<Blob | undefined> => {
  return await get(`audio_${blobId}`);
};
