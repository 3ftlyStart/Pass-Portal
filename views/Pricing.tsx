import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, CreditCard, Loader2 } from 'lucide-react';
import { PRICING_PLANS, addCredits } from '../services/billingService';
import { useAuth } from '../context/AuthContext';

const Pricing: React.FC = () => {
  const { profile } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async (plan: typeof PRICING_PLANS[0]) => {
    if (!profile) return;
    setLoadingId(plan.id);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await addCredits(profile.uid, plan.credits, `Purchased ${plan.name}`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight"
        >
          Master IELTS with <span className="text-indigo-600">Precision Credits</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-lg max-w-2xl mx-auto font-medium"
        >
          Only pay for what you use. No hidden fees, no subscriptions (unless you want them). 
          Our AI-powered feedback engine runs on credits.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {PRICING_PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-8 rounded-[2.5rem] bg-white border ${
              plan.recommended ? 'border-indigo-500 shadow-2xl shadow-indigo-100 ring-2 ring-indigo-500/10' : 'border-slate-100 shadow-xl'
            } flex flex-col`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  plan.recommended ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {plan.id === 'starter' && <Zap size={24} />}
                  {plan.id === 'pro' && <Shield size={24} />}
                  {plan.id === 'unlimited' && <Crown size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{plan.credits} Credits</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {plan.description}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                <span className="text-slate-400 font-bold text-sm">one-time</span>
              </div>
              <div className="mt-4 space-y-3">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handlePurchase(plan)}
              disabled={loadingId !== null}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                plan.recommended 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              } disabled:opacity-50 disabled:active:scale-100`}
            >
              {loadingId === plan.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={18} />
                  Top Up Now
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black flex items-center gap-3 z-50 text-xs uppercase tracking-widest"
        >
          <Zap size={18} />
          Credits added successfully!
        </motion.div>
      )}

      {/* Credit Usage Legend */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">How it works?</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              We operate on a "Precision Billing" model. Credits are only deducted when you successfully 
              complete a practice session or receive detailed AI feedback.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Speaking</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">5 <span className="text-xs">CR</span></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Writing</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">3 <span className="text-xs">CR</span></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reading</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">1 <span className="text-xs">CR</span></span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Listening</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-slate-900">1 <span className="text-xs">CR</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
