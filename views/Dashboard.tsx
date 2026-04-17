
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock,
  ArrowRight,
  PenTool,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Overall Band', value: '7.5', icon: Target, color: 'bg-indigo-500' },
    { label: 'Improvement', value: '+0.5', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Tests Taken', value: '12', icon: Clock, color: 'bg-orange-500' },
    { label: 'Days Active', value: '24', icon: Calendar, color: 'bg-rose-500' },
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
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Module Performance</h2>
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

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Next Milestone</h2>
            <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">You're 2 practice tests away from hitting your Target Band 8.0</p>
            <div className="space-y-3">
              <Link to="/mock-tests" className="w-full h-14 flex items-center justify-between px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-[0.98]">
                <span className="font-bold">Start Mock Test</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/writing" className="w-full h-14 flex items-center justify-between px-6 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold active:scale-[0.98]">
                <span>Practice Writing</span>
                <PenTool size={20} />
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Recommended for you</p>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
                <Target size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 leading-tight mb-1">Vocabulary Boost</p>
                <p className="text-xs text-amber-700/80 leading-relaxed font-medium">Improve your Lexical Resource with topic-specific idioms.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Tests */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Recent Performance</h2>
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
