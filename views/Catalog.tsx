import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Video, 
  BookMarked,
  MessageCircle,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'practice-test';
  category: 'Writing' | 'Speaking' | 'Reading' | 'Listening';
  whatsappTag: string;
}

const materials: Material[] = [
  {
    id: '1',
    title: 'Writing Task 2: Opinion Essays Guide',
    description: 'Master the structure and vocabulary for high-scoring opinion essays.',
    type: 'pdf',
    category: 'Writing',
    whatsappTag: 'WRITING_TASK_2_GUIDE'
  },
  {
    id: '2',
    title: 'Speaking Part 2: Cue Card Templates',
    description: 'Learn how to plan and deliver 2-minute talks with confidence.',
    type: 'pdf',
    category: 'Speaking',
    whatsappTag: 'SPEAKING_CUE_CARDS'
  },
  {
    id: '3',
    title: 'Reading Strategy: Skimming & Scanning',
    description: 'Techniques to manage your time and find answers faster.',
    type: 'video',
    category: 'Reading',
    whatsappTag: 'READING_STRATEGY_VIDEO'
  },
  {
    id: '4',
    title: 'Full Mock Test - Academic (V12)',
    description: 'Complete practice test with answer keys and model answers.',
    type: 'practice-test',
    category: 'Writing',
    whatsappTag: 'MOCK_TEST_V12'
  },
  {
    id: '5',
    title: 'Common Listening Distractors',
    description: 'Avoid traps and improve your score in Section 1 and 2.',
    type: 'pdf',
    category: 'Listening',
    whatsappTag: 'LISTENING_DISTRACTORS'
  },
  {
    id: '6',
    title: '7.5+ Band Vocabulary List',
    description: 'Academic words grouped by common IELTS topics.',
    type: 'pdf',
    category: 'Reading',
    whatsappTag: 'VOCAB_LIST_75'
  }
];

const Catalog: React.FC = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890';

  const handleRequestMaterial = (material: Material) => {
    const message = encodeURIComponent(`Hi ieltshub! I'd like to receive the following material on WhatsApp: ${material.title} (ID: ${material.whatsappTag})`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              Material Catalog
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight font-heading">
              Study Material <br />on the Go.
            </h1>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              Browse our curated learning resources and get them delivered instantly to your WhatsApp.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm shrink-0 md:w-80">
            <h3 className="text-sm font-black mb-3 uppercase tracking-wider opacity-60">How it works</h3>
            <ul className="space-y-3">
              {[
                "Browse the catalog",
                "Click 'Get via WhatsApp'",
                "Receive file instantly"
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {i + 1}
                  </div>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Search & Filter (Visual only for now) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-800 font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Writing', 'Speaking', 'Reading', 'Listening'].map((cat) => (
            <button 
              key={cat}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                cat === 'All' 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {materials.map((item) => (
          <motion.div 
            key={item.id}
            variants={itemVariants}
            className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all overflow-hidden flex flex-col"
          >
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${
                  item.type === 'pdf' ? 'bg-rose-50 text-rose-500' :
                  item.type === 'video' ? 'bg-sky-50 text-sky-500' :
                  'bg-indigo-50 text-indigo-500'
                }`}>
                  {item.type === 'pdf' && <FileText size={24} />}
                  {item.type === 'video' && <Video size={24} />}
                  {item.type === 'practice-test' && <BookMarked size={24} />}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100/50">
                  {item.category}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors font-heading">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                {item.description}
              </p>
            </div>
            
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 group-hover:bg-indigo-50 transition-colors">
              <button 
                onClick={() => handleRequestMaterial(item)}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all font-bold active:scale-95 group/btn"
              >
                <MessageCircle size={18} className="text-emerald-500 group-hover/btn:text-white" />
                Get via WhatsApp
                <ChevronRight size={16} className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Info */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden">
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <h2 className="text-xl font-black mb-2 font-heading">Can't find what you're looking for?</h2>
        <p className="text-slate-400 font-medium mb-6">Chat with our bot for custom requests.</p>
        <button 
          onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95 inline-flex items-center gap-3"
        >
          <MessageCircle size={20} />
          Chat Now
        </button>
      </div>
    </div>
  );
};

export default Catalog;
