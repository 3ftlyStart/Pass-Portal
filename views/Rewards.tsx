
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Users, 
  Share2, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  AlertCircle,
  ArrowRight,
  History,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Referral, RewardRedemption } from '../types';

const Rewards: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  const THRESHOLD = 100;
  const POINTS_PER_REFERRAL = 10;
  const CREDITS_PER_REDEMPTION = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.uid) return;
      
      try {
        // Fetch referrals
        const refQ = query(
          collection(db, 'referrals'),
          where('referrerId', '==', profile.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const refSnapshot = await getDocs(refQ);
        const refList = refSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Referral));
        setReferrals(refList);

        // Fetch redemptions
        const redQ = query(
          collection(db, 'redemptions'),
          where('userId', '==', profile.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const redSnapshot = await getDocs(redQ);
        const redList = redSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RewardRedemption));
        setRedemptions(redList);

      } catch (error) {
        console.error("Error fetching rewards data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.uid]);

  const referralLink = `${window.location.origin}/#/login?ref=${profile?.referralCode || ''}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const shareData = {
      title: 'ieltshub Portal',
      text: 'Join me on ieltshub and reach your target band score with AI!',
      url: referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyLink();
      }
    } catch (err) {
      copyLink();
    }
  };

  const handleRedeem = async () => {
    if (!profile || profile.points < THRESHOLD || isRedeeming) return;

    setIsRedeeming(true);
    try {
      const batch = writeBatch(db);
      
      // Create redemption record
      const redemptionRef = doc(collection(db, 'redemptions'));
      batch.set(redemptionRef, {
        userId: profile.uid,
        pointsSpent: THRESHOLD,
        rewardType: 'credits',
        rewardValue: CREDITS_PER_REDEMPTION,
        timestamp: serverTimestamp()
      });

      // Update user points and credits
      const userRef = doc(db, 'users', profile.uid);
      batch.update(userRef, {
        points: profile.points - THRESHOLD,
        credits: (profile.credits || 0) + CREDITS_PER_REDEMPTION,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      
      setRedemptionSuccess(true);
      setTimeout(() => setRedemptionSuccess(false), 5000);
    } catch (error) {
      console.error("Redemption error:", error);
    } finally {
      setIsRedeeming(false);
    }
  };

  const progressPercent = Math.min(100, ((profile?.points || 0) / THRESHOLD) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-100">
            <Gift size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-heading">Rewards Hub</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Earn while you learn with our referral program</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Points & Progress Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Your Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black">{profile?.points || 0}</span>
                    <span className="text-sm font-bold opacity-60">Points</span>
                  </div>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <TrendingUp size={24} className="text-amber-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/60">
                  <span>Progress to Next Reward</span>
                  <span>{profile?.points || 0} / {THRESHOLD}</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  />
                </div>
                <p className="text-[10px] text-center text-white/50 font-bold">
                  Reach {THRESHOLD} points to unlock {CREDITS_PER_REDEMPTION} bonus credits
                </p>
              </div>

              <button
                onClick={handleRedeem}
                disabled={profile?.points < THRESHOLD || isRedeeming}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group flex items-center justify-center gap-3",
                  profile?.points >= THRESHOLD 
                    ? "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-amber-200/20" 
                    : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                )}
              >
                {isRedeeming ? "Processing..." : redemptionSuccess ? "Redeemed!" : "Redeem Rewards"}
                {!redemptionSuccess && <Zap size={16} className={profile?.points >= THRESHOLD ? "animate-pulse" : ""} />}
                {redemptionSuccess && <CheckCircle2 size={16} />}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-800 font-heading">How it works</h3>
            <div className="space-y-6">
              {[
                { icon: Share2, title: "Share your Link", desc: "Invite your friends to ieltshub using your unique code.", color: "bg-indigo-50 text-indigo-600" },
                { icon: Users, title: "Friend Signs Up", desc: "You get 10 points immediately when they create their account.", color: "bg-teal-50 text-teal-600" },
                { icon: Zap, title: "Unlock Powerups", desc: "Exchange your points for exam credits and special features.", color: "bg-amber-50 text-amber-600" }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", step.color)}>
                    <step.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{step.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Share & Referrals Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
            {/* Design accents */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors" />
            
            <div className="relative z-10 space-y-8">
              <div className="max-w-lg">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight font-heading mb-4">Sharing is Caring.</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Help your friends achieve their ieltshub goals and earn bonus credits for every successful referral. It's a win-win.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 flex items-center justify-between group/code hover:border-indigo-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referral Link</span>
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                      {referralLink}
                    </span>
                  </div>
                  <button 
                    onClick={copyLink}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    title="Copy Link"
                  >
                    {copied ? <CheckCircle2 size={20} className="text-teal-500" /> : <Copy size={20} />}
                  </button>
                </div>
                
                <button
                  onClick={shareLink}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 shrink-0"
                >
                  <Share2 size={18} />
                  Share Link
                </button>
              </div>

              <div className="flex gap-4 p-4 bg-teal-50/50 rounded-[1.5rem] border border-teal-100/50 items-center">
                <div className="p-2 bg-teal-500 text-white rounded-lg shrink-0">
                  <AlertCircle size={16} />
                </div>
                <p className="text-[11px] font-bold text-teal-700 leading-normal">
                  Your unique referral code is <span className="font-black bg-white px-2 py-0.5 rounded border border-teal-100">{profile?.referralCode}</span>. Friends must enter this during sign up if not using your direct link.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                  <History size={18} />
                </div>
                <h3 className="text-xl font-black text-slate-800 font-heading">Referral History</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing latest {referrals.length} referrals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referrals.length === 0 && !loading ? (
                <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4 shadow-sm">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-800 font-black mb-1">No referrals yet</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Start sharing to earn points!</p>
                </div>
              ) : (
                referrals.map((referral, idx) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {referral.refereeName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{referral.refereeName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(referral.timestamp?.toDate ? referral.timestamp.toDate() : referral.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none mb-1">Awarded</span>
                      <span className="text-lg font-black text-slate-800">+{referral.pointsAwarded}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {redemptions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                  <Zap size={18} />
                </div>
                <h3 className="text-xl font-black text-slate-800 font-heading">Redemption History</h3>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Spent</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {redemptions.map((red) => (
                        <tr key={red.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                <Zap size={14} />
                              </div>
                              <span className="text-sm font-black text-slate-800">{red.rewardValue} Exam Credits</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-500 text-sm">{red.pointsSpent} pts</td>
                          <td className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase">
                            {new Date(red.timestamp?.toDate ? red.timestamp.toDate() : red.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
