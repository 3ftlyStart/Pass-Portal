
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock,
  ArrowRight,
  PenTool,
  ChevronRight,
  Filter,
  BarChart3,
  Mic
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const trendData = [
    { name: 'Week 1', band: 6.0, reading: 6.5, listening: 6.0, writing: 5.5, speaking: 6.0 },
    { name: 'Week 2', band: 6.5, reading: 7.0, listening: 6.5, writing: 6.0, speaking: 6.5 },
    { name: 'Week 3', band: 7.0, reading: 7.5, listening: 7.0, writing: 6.5, speaking: 7.0 },
    { name: 'Week 4', band: 7.5, reading: 8.0, listening: 7.5, writing: 7.0, speaking: 7.5 },
  ];

  const modulePerformance = [
    { name: 'Reading', score: 8.0, color: '#1A365D' },
    { name: 'Listening', score: 7.5, color: '#38B2AC' },
    { name: 'Writing', score: 7.0, color: '#ED8936' },
    { name: 'Speaking', score: 7.5, color: '#63B3ED' },
  ];
  const stats = [
    { label: 'Overall Band', value: '7.5', icon: Target, color: 'bg-brand-navy' },
    { label: 'Improvement', value: '+0.5', icon: TrendingUp, color: 'bg-brand-teal' },
    { label: 'Tests Taken', value: '12', icon: Clock, color: 'bg-brand-orange-dark' },
    { label: 'Days Active', value: '24', icon: Calendar, color: 'bg-brand-sky' },
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
            className="card-brand p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 group hover:border-brand-sky/20 transition-all hover:scale-[1.02]"
          >
            <div className={`${stat.color} p-2.5 md:p-3 rounded-xl text-white shadow-lg shadow-brand-navy/5 group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl md:text-2xl font-black text-brand-navy">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Performance Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-brand p-5 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-brand-navy">Performance Trends</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Overall Band Progression</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white text-brand-navy rounded-lg shadow-sm shadow-brand-navy/5">All</button>
                <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy">Weekly</button>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38B2AC" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#38B2AC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 9]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="band" 
                  stroke="#38B2AC" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorBand)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Module Breakdown Bar Chart */}
        <motion.div variants={itemVariants} className="card-brand p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg md:text-xl font-bold text-brand-navy">Module Breakdown</h2>
            <BarChart3 className="text-brand-sky" size={20} />
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modulePerformance} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide domain={[0, 9]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#1A365D' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                />
                <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                  {modulePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Strength</p>
              <p className="text-sm font-bold text-brand-navy">Reading Passage 3</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Focus</p>
              <p className="text-sm font-bold text-brand-orange-dark">Writing Cohesion</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Quick Actions (moved and resized) */}
        <motion.div variants={itemVariants} className="card-brand p-6 md:p-8 flex flex-col sm:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-brand-navy">Target Band: 8.0</h2>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-linear-to-r from-brand-teal to-brand-sky rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[8px] font-black text-white mix-blend-difference uppercase tracking-widest">85% of progress</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">You're slightly above your peer group in Lexical Resource. Keep it up!</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 sm:w-48">
            <Link to="/mock-tests" className="w-full h-12 flex items-center justify-center gap-2 bg-brand-navy text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95">
              <Target size={16} /> Full Mock Test
            </Link>
            <Link to="/speaking" className="w-full h-12 flex items-center justify-center gap-2 border-2 border-slate-100 text-brand-navy rounded-xl font-bold text-xs hover:bg-slate-50 transition-all active:scale-95">
              <Mic size={16} /> Speaking Lab
            </Link>
          </div>
        </motion.div>
        
        {/* Insight Card */}
        <motion.div variants={itemVariants} className="card-brand p-6 md:p-8 bg-linear-to-br from-brand-navy to-slate-900 text-white flex gap-6 items-center">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-brand-sky shadow-2xl shrink-0">
             <TrendingUp size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Weekly Improvement</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">You've improved your Listening score by <span className="text-brand-sky font-black">+0.5</span> this week. Excellent focus on Section 4! </p>
          </div>
        </motion.div>
      </div>


      {/* Recent Tests */}
      <motion.div variants={itemVariants} className="card-brand overflow-hidden">
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-brand-navy">Recent Performance</h2>
          <button className="text-brand-teal text-xs font-bold uppercase tracking-widest hover:underline md:hidden">View all</button>
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
                    <span className="bg-brand-sky/10 text-brand-navy px-3 py-1 rounded-full text-sm font-black ring-1 ring-brand-sky/20">
                      {test.score}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-500">{test.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-brand-teal font-bold text-xs uppercase tracking-widest hover:text-brand-navy transition-colors inline-flex items-center gap-1">
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
                <span className="bg-brand-teal text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shadow-brand-teal/20">
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
