
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Target as TargetIcon, 
  Shield, 
  Save, 
  CheckCircle2, 
  Camera,
  Loader2,
  Crown,
  History,
  Zap,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { CREDIT_COSTS } from '../services/billingService';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [targetScore, setTargetScore] = useState(profile?.targetScore?.toString() || '7.5');
  const [role, setRole] = useState<UserRole>(profile?.role || 'student');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setTargetScore(profile.targetScore?.toString() || '7.5');
      setRole(profile.role || 'student');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName,
        targetScore: parseFloat(targetScore),
        role
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-heading">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, preferences, and study goals.</p>
        </div>
        
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-medium text-sm"
          >
            <CheckCircle2 size={16} />
            Profile updated successfully
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 p-4">
              {profile?.role === 'admin' ? (
                <Crown size={20} className="text-amber-500" />
              ) : (
                <Shield size={20} className="text-slate-200" />
              )}
            </div>
            
            <div className="relative inline-block mb-6">
              <img 
                src={profile?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=random`} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-md object-cover"
              />
              <button className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-800 font-heading">{displayName || 'Anonymous User'}</h2>
            <p className="text-sm text-slate-400 font-medium mb-4">{profile?.email || user.email}</p>
            
            <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {profile?.role || 'Student'}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <TargetIcon size={120} />
            </div>
            <h3 className="text-lg font-bold mb-2 font-heading">Study Progress</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium opacity-90">
                  <span>Target Achievement</span>
                  <span>{((profile?.targetScore || 0) / 9 * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${((profile?.targetScore || 0) / 9 * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed">
                You're currently aiming for a Band {profile?.targetScore || '?.?'} score. Keep practicing!
              </p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-heading">
                <UserIcon size={20} className="text-indigo-600" />
                Personal Information
              </h3>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Display Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      value={user.email || ''} 
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <TargetIcon size={16} />
                    IELTS Target Score
                  </label>
                  <select 
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-800 font-medium appearance-none"
                  >
                    {[4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Shield size={16} />
                    Account Role
                  </label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-800 font-medium appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium ml-1">Roles allow access to different dashboard features.</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>

            <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
              <h3 className="text-lg font-bold text-rose-800 mb-2 font-heading">Danger Zone</h3>
              <p className="text-rose-600/70 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-6 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-8 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-heading">
              <History size={20} className="text-indigo-600" />
              Recent Transactions
            </h3>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
              <Zap size={14} className="text-indigo-600" />
              <span className="text-xs font-black text-indigo-700">{profile?.credits || 0} CR</span>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Description</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${tx.amount > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            {tx.amount > 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          </div>
                          <span className="text-xs font-bold text-slate-700 capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-slate-500">{tx.description}</td>
                      <td className="px-8 py-4 text-xs text-slate-400">
                        {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : 'Pending...'}
                      </td>
                      <td className={`px-8 py-4 text-sm font-black text-right ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} CR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 mb-4">
                  <History size={24} />
                </div>
                <p className="text-sm font-medium text-slate-400">No transactions recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Profile;
