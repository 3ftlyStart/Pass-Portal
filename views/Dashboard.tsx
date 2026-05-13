
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock,
  ArrowRight,
  PenTool,
  ChevronRight,
  Zap,
  CreditCard,
  Wallet,
  Gift,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const stats = [
    { label: 'Overall Band', value: '7.5', icon: Target, color: 'bg-indigo-500' },
    { label: 'Improvement', value: '+0.5', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Credits Left', value: profile?.credits?.toString() || '0', icon: Zap, color: 'bg-indigo-400' },
    { label: 'Days Active', value: '24', icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentTests = [
    { module: 'Writing Task 2', date: 'Oct 24, 2023', score: '7.0', status: 'Completed' },
    { module: 'Reading Practice', date: 'Oct 22, 2023', score: '8.5', status: 'Completed' },
    { module: 'Speaking Interview', date: 'Oct 20, 2023', score: '7.5', status: 'Completed' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 group hover:border-indigo-200 transition-colors"
          >
            <div className={`${stat.color} p-2.5 md:p-3 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Progress Chart Placeholder */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 font-heading">Module Performance</h2>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 w-full sm:w-auto">
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="space-y-5 md:space-y-6">
            {['Reading', 'Listening', 'Writing', 'Speaking'].map((module, idx) => (
              <div key={module}>
                <div className="flex justify-between text-xs md:text-sm mb-2 font-bold tracking-tight">
                  <span className="text-slate-600">{module}</span>
                  <span className="text-indigo-600">Band {7.0 + idx * 0.5}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${70 + idx * 7}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + idx * 0.1 }}
                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Billing & Wallet Section */}
        <motion.div variants={itemVariants} className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Wallet size={120} className="text-indigo-400" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white mb-2 font-heading tracking-tight">Practice Wallet</h2>
            <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Top up credits to unlock advanced AI examiners for Speaking and Writing modules.</p>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</span>
                <span className="text-xl font-black text-indigo-400 font-heading">{profile?.credits || 0} CR</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((profile?.credits || 0) / 150) * 100, 100)}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/pricing" className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                <CreditCard size={16} />
                Get More Credits
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 shrink-0">
                <Zap size={14} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                Current Plan: <span className="text-white">{profile?.subscriptionTier || 'Free'}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rewards / Referral Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 md:p-8 rounded-3xl shadow-xl shadow-amber-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Gift size={120} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white mb-2 font-heading tracking-tight">Refer & Earn</h2>
            <p className="text-white/80 text-xs font-medium mb-6 leading-relaxed">Earn 10 points for every friend who joins! Redeem points for free credits.</p>
            
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Your Points</span>
                <span className="text-xl font-black text-white font-heading">{profile?.points || 0} PTS</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((profile?.points || 0) / 100) * 100, 100)}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            <Link to="/rewards" className="w-full h-12 flex items-center justify-center gap-2 bg-white text-orange-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95 shadow-lg">
              <Share2 size={16} />
              Invite Friends
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Tests */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 font-heading">Recent Performance</h2>
          <button className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline md:hidden">View all</button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTests.map((test, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-700">{test.module}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">{test.date}</td>
                  <td className="px-8 py-5">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-black ring-1 ring-indigo-100/50">
                      {test.score}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-500">{test.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-700 transition-colors inline-flex items-center gap-1">
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-slate-100">
          {recentTests.map((test, idx) => (
            <div key={idx} className="p-4 active:bg-slate-50 transition-colors flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate mb-0.5">{test.module}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{test.date}</span>
                  <span className="text-slate-200">|</span>
                  <span className="text-emerald-500">{test.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shadow-indigo-100">
                  {test.score}
                </span>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
