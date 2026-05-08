import { db } from './firebase';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { ModuleType, CreditTransaction } from '../types';

export const CREDIT_COSTS = {
  [ModuleType.SPEAKING]: 5,
  [ModuleType.WRITING]: 3,
  [ModuleType.READING]: 1,
  [ModuleType.LISTENING]: 1,
};

export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 9.99,
    description: 'Perfect for quick practice before your exam.',
    features: ['50 Practice Credits', 'Speaking & Writing AI Feedback', '7-day History']
  },
  {
    id: 'pro',
    name: 'Pro Learner',
    credits: 150,
    price: 24.99,
    description: 'Comprehensive preparation for target band 8.0+.',
    features: ['150 Practice Credits', 'Extended AI Feedback', 'Unlimited History', 'Priority Support'],
    recommended: true
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    credits: 1000,
    price: 59.99,
    description: 'Bulk credits for intensive training centers.',
    features: ['1000 Practice Credits', 'All Pro Features', 'Team Dashboard', 'Consultation Session']
  }
];

export async function deductCredits(userId: string, module: ModuleType, description: string) {
  const cost = CREDIT_COSTS[module];
  const userRef = doc(db, 'users', userId);
  const transactionRef = collection(db, 'users', userId, 'transactions');

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User does not exist");
      
      const currentCredits = userDoc.data().credits || 0;
      if (currentCredits < cost) throw new Error("Insufficient credits");

      transaction.update(userRef, {
        credits: increment(-cost),
        updatedAt: serverTimestamp()
      });

      // We can't use addDoc in a Firestore transaction context directly with transaction.set
      // but we can prepare the doc reference
      const newTxRef = doc(transactionRef);
      transaction.set(newTxRef, {
        amount: -cost,
        type: 'usage',
        module,
        description,
        timestamp: serverTimestamp()
      });
    });
    return true;
  } catch (error) {
    console.error("Credit deduction failed:", error);
    throw error;
  }
}

export async function addCredits(userId: string, amount: number, description: string) {
  const userRef = doc(db, 'users', userId);
  const transactionRef = collection(db, 'users', userId, 'transactions');

  try {
    await runTransaction(db, async (transaction) => {
      transaction.update(userRef, {
        credits: increment(amount),
        updatedAt: serverTimestamp()
      });

      const newTxRef = doc(transactionRef);
      transaction.set(newTxRef, {
        amount,
        type: 'purchase',
        description,
        timestamp: serverTimestamp()
      });
    });
    return true;
  } catch (error) {
    console.error("Adding credits failed:", error);
    throw error;
  }
}
