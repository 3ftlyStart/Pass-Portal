
import React, { useState } from 'react';
import { 
  PenTool, 
  Send, 
  Loader2, 
  CheckCircle2, 
  ChevronDown,
  Target,
  Link,
  BookOpen,
  SpellCheck,
  CheckCircle,
  Lightbulb,
  Info
} from 'lucide-react';
import { evaluateWriting } from '../services/geminiService';
import { WritingScore } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionProps> = ({ title, icon, children, isOpen, onToggle }) => {
  return (
    <motion.div 
      layout
      className="border border-slate-100 rounded-2xl overflow-hidden bg-white mb-3 shadow-sm transition-all duration-200"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
          </div>
          <span className="font-bold text-slate-800 text-sm md:text-base">{title}</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-slate-50 text-slate-600 leading-relaxed text-sm">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const WritingModule: React.FC = () => {
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingScore | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('Task Response');

  const currentTask = {
    title: 'Writing Task 2',
    prompt: 'Some people think that scientific research should be carried out and controlled by the government rather than private companies. To what extent do you agree or disagree with this opinion?',
    wordCount: 'Minimum 250 words'
  };

  const handleSubmit = async () => {
    if (!essay || essay.length < 50) return;
    setLoading(true);
    try {
      const result = await evaluateWriting(currentTask.prompt, essay);
      setFeedback(result);
    } catch (error) {
      console.error(error);
      alert('Failed to evaluate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const grammarTips = [
    { title: "Subject-Verb Agreement", tip: "Ensure singular subjects take singular verbs. Example: 'The research shows' (Correct)." },
    { title: "Article Precision", tip: "Use 'the' for specific nouns mentioned before. Avoid overusing with general plural nouns." },
    { title: "Tense Consistency", tip: "Don't jump between past and present unnecessarily. Use Present Simple for general truths." },
    { title: "Punctuation & Flow", tip: "Use commas after linking words like 'Furthermore' or 'However'." }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Essay Input Section */}
        <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <PenTool size={18} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Question</h2>
            </div>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium mb-4">
              {currentTask.prompt}
            </p>
            <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-4">
              <span>40 mins</span>
              <span>{currentTask.wordCount}</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <textarea
              className="w-full h-[350px] md:h-[500px] p-5 md:p-8 outline-none text-sm md:text-base text-slate-700 leading-relaxed resize-none font-sans placeholder:text-slate-300"
              placeholder="Start typing your essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              disabled={loading}
            ></textarea>
            <div className="bg-slate-50 px-5 md:px-8 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`text-xs md:text-sm font-bold ${wordCount < 250 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  Words: {wordCount} / 250
                </span>
                {wordCount >= 250 && <CheckCircle2 size={16} className="text-emerald-600" />}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || wordCount < 50}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
                Evaluate Essay
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!feedback && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white border border-slate-100 border-dashed rounded-[2rem] shadow-sm"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                  <PenTool size={32} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 tracking-tight">Ready for Review?</h3>
                <p className="text-xs md:text-sm text-slate-400 max-w-sm leading-relaxed font-medium">Write at least 50 words to receive a comprehensive band score and detailed feedback.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
              >
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 md:w-24 md:h-24 border-4 border-indigo-50 border-t-indigo-600 rounded-full" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <PenTool size={24} />
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">AI Examiner at Work</h3>
                <p className="text-xs md:text-sm text-slate-400 max-w-xs leading-relaxed font-medium px-4">Analyzing structure, vocabulary, and grammar against official IELTS standards...</p>
              </motion.div>
            )}

            {feedback && !loading && (
              <motion.div 
                key="feedback"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="space-y-6"
              >
                {/* Score Hero Card */}
                <div className="bg-indigo-600 p-6 md:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
                    <CheckCircle size={100} className="md:w-32 md:h-32" />
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Estimated Band Score</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-black tracking-tighter">{feedback.overallBand}</span>
                        <span className="text-lg md:text-xl font-bold text-indigo-300">/ 9.0</span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/10">
                      <p className="text-[10px] md:text-xs text-indigo-200 mb-1 font-bold uppercase">Analysis Date</p>
                      <p className="text-sm md:text-base font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Criterion Accordion */}
                <motion.div layout className="space-y-3">
                  <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">Scoring Breakdown</h4>
                  
                  <AccordionItem
                    title="Task Response"
                    icon={<Target />}
                    isOpen={openSection === 'Task Response'}
                    onToggle={() => setOpenSection(openSection === 'Task Response' ? null : 'Task Response')}
                  >
                    <div className="space-y-3">
                      <p className="font-medium text-slate-700">{feedback.taskResponse}</p>
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Examiner Focus</p>
                        <p className="text-xs text-indigo-600/80 font-medium">Addressing all parts of the task and providing a clear position throughout the response.</p>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    title="Coherence/Cohesion"
                    icon={<Link />}
                    isOpen={openSection === 'Coherence'}
                    onToggle={() => setOpenSection(openSection === 'Coherence' ? null : 'Coherence')}
                  >
                    <div className="space-y-3">
                      <p className="font-medium text-slate-700">{feedback.coherenceCohesion}</p>
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Examiner Focus</p>
                        <p className="text-xs text-blue-600/80 font-medium">Logically organizing information and ideas; using a range of cohesive devices effectively.</p>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    title="Lexical Resource"
                    icon={<BookOpen />}
                    isOpen={openSection === 'Lexical'}
                    onToggle={() => setOpenSection(openSection === 'Lexical' ? null : 'Lexical')}
                  >
                    <div className="space-y-3">
                      <p className="font-medium text-slate-700">{feedback.lexicalResource}</p>
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Examiner Focus</p>
                        <p className="text-xs text-emerald-600/80 font-medium">Using a wide range of vocabulary with precision and awareness of style and collocation.</p>
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem
                    title="Grammatical Range"
                    icon={<SpellCheck />}
                    isOpen={openSection === 'Grammar'}
                    onToggle={() => setOpenSection(openSection === 'Grammar' ? null : 'Grammar')}
                  >
                    <div className="space-y-3">
                      <p className="font-medium text-slate-700">{feedback.grammaticalRange}</p>
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Examiner Focus</p>
                        <p className="text-xs text-amber-600/80 font-medium">Using a wide range of structures with a high degree of flexibility and accuracy.</p>
                      </div>
                    </div>
                  </AccordionItem>
                </motion.div>

                {/* Suggested Corrections */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Key Improvements</h4>
                  </div>
                  <div className="space-y-3">
                    {feedback.suggestedCorrections.map((correction, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:border-emerald-100 transition-colors">
                        <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-slate-300 group-hover:text-emerald-500 transition-colors shadow-sm shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-600 italic leading-relaxed">"{correction}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grammar Tips */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 border-t-4 border-t-amber-400">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                      <Lightbulb size={18} />
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Grammar Lab Tips</h4>
                  </div>
                  <div className="space-y-3">
                    {grammarTips.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50/30 transition-colors">
                        <div className="mt-1 text-amber-400">
                          <Info size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 mb-0.5">{item.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WritingModule;
