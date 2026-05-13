
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, query, collection, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../services/firebase';
import { UserRole, UserProfile, SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateReferralCode = (uid: string) => {
  return (uid.substring(0, 4) + Math.random().toString(36).substring(2, 6)).toUpperCase();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Subscribe to profile changes
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
          } else {
            // New user, create initial profile
            const referralCodeFromStorage = localStorage.getItem('referralCode');
            let referredBy = '';
            
            if (referralCodeFromStorage) {
              try {
                // Find the referrer
                const q = query(collection(db, 'users'), where('referralCode', '==', referralCodeFromStorage));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const referrerDoc = querySnapshot.docs[0];
                  referredBy = referrerDoc.id;
                  
                  // Award points to referrer (10 points)
                  const batch = writeBatch(db);
                  batch.update(doc(db, 'users', referredBy), {
                    points: (referrerDoc.data().points || 0) + 10
                  });
                  
                  // Create referral record
                  const refDocRef = doc(collection(db, 'referrals'));
                  batch.set(refDocRef, {
                    referrerId: referredBy,
                    refereeId: firebaseUser.uid,
                    refereeName: firebaseUser.displayName || 'New User',
                    status: 'completed',
                    pointsAwarded: 10,
                    timestamp: serverTimestamp()
                  });
                  
                  await batch.commit();
                  localStorage.removeItem('referralCode');
                }
              } catch (e) {
                console.error("Referral processing error:", e);
              }
            }

            const initialProfile = {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'student' as UserRole,
              targetScore: 7.5,
              credits: 10, // Start with 10 free credits
              points: 0,
              referralCode: generateReferralCode(firebaseUser.uid),
              referredBy: referredBy,
              subscriptionTier: 'free' as SubscriptionTier,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            setDoc(userDocRef, initialProfile).catch(err => {
              console.error("Initial profile creation error:", err);
            });
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error details:", error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
