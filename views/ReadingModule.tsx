
import React, { useState } from 'react';
import { ReadingPassage } from '../types';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_PASSAGE: ReadingPassage = {
  title: "The Impact of Urban Green Spaces on Mental Health",
  content: `In the rapidly urbanizing world of the 21st century, the psychological well-being of city dwellers has become a major concern for public health officials. Research consistently suggests that urbanization is associated with increased levels of mental stress, anxiety, and mood disorders. However, a growing body of evidence points to a potential solution: urban green spaces. These areas, which include parks, gardens, and urban forests, are not merely aesthetic additions to the cityscape; they serve as critical infrastructure for cognitive restoration.\n\nA study conducted by the University of Exeter found that individuals living in greener urban areas had significantly lower levels of mental distress than those in less green environments. One theory, known as Attention Restoration Theory (ART), proposes that natural environments allow the brain to recover from the "directed attention fatigue" caused by the constant stimuli of urban life. Unlike a busy street, which requires constant cognitive processing to avoid hazards, a park offers "soft fascination"—stimuli that capture attention without effort, allowing the mind to wander and recharge.`,
  questions: [
    {
      id: 1,
      text: "According to the passage, what is a primary concern for public health officials in modern cities?",
      options: ["The cost of infrastructure", "Psychological well-being of residents", "The design of urban forests", "Physical health issues"],
      correctAnswer: "Psychological well-being of residents"
    },
    {
      id: 2,
      text: "What does Attention Restoration Theory (ART) suggest natural environments provide?",
      options: ["New hazards", "Constant stimuli", "Cognitive processing speed", "Recovery from mental fatigue"],
      correctAnswer: "Recovery from mental fatigue"
    },
    {
      id: 3,
      text: "How does the author characterize the nature of park stimuli compared to urban stimuli?",
      options: ["Hard fascination", "Soft fascination", "Directed attention", "Hazardous stimuli"],
      correctAnswer: "Soft fascination"
    }
  ]
};

const ReadingModule: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: number, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    MOCK_PASSAGE.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
        {/* Left Side: Passage */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-160px)] flex flex-col transition-all">
          <div className="flex items-center gap-3 mb-4 md:mb-6 shrink-0">
            <BookOpen className="text-indigo-600" size={24} />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-heading">Reading Passage</h2>
          </div>
          <div className="overflow-y-auto lg:pr-4 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-bold text-indigo-700 underline underline-offset-8 decoration-indigo-200 leading-tight font-heading">
              {MOCK_PASSAGE.title}
            </h3>
            <div className="text-slate-600 md:text-slate-700 leading-relaxed md:leading-loose text-base md:text-lg whitespace-pre-wrap font-medium">
              {MOCK_PASSAGE.content}
            </div>
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight font-heading">Questions 1-3</h2>
              <div className="bg-indigo-50 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border border-indigo-100/50">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Multiple Choice
              </div>
            </div>

            <div className="space-y-8 md:space-y-10">
              {MOCK_PASSAGE.questions.map((q, idx) => (
                <div key={q.id} className="space-y-4">
                  <p className="text-base md:text-lg font-bold text-slate-800 flex gap-3">
                    <span className="bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 font-black">{q.id}</span>
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 md:ml-11">
                    {q.options.map(opt => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrect = submitted && opt === q.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== q.correctAnswer;

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelect(q.id, opt)}
                          disabled={submitted}
                          className={`text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center text-sm md:text-base ${
                            isSelected && !submitted ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 
                            isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' :
                            isWrong ? 'border-rose-500 bg-rose-50 text-rose-700 font-black' :
                            'border-slate-50 hover:border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="flex-1 pr-4">{opt}</span>
                          {isCorrect && <CheckCircle size={18} className="text-emerald-600 shrink-0" />}
                          {isWrong && <AlertCircle size={18} className="text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-12">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSubmitted(true)}
                    disabled={Object.keys(answers).length < MOCK_PASSAGE.questions.length}
                    className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 active:scale-95"
                  >
                    Submit Answers
                  </motion.button>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 md:p-8 bg-indigo-600 rounded-[2rem] text-white text-center shadow-2xl shadow-indigo-200"
                  >
                    <p className="text-indigo-200 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2">Final Performance</p>
                    <p className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">{calculateScore()} <span className="text-2xl md:text-3xl opacity-50 font-bold">/ {MOCK_PASSAGE.questions.length}</span></p>
                    <p className="font-bold text-sm md:text-base opacity-90 leading-tight">Estimated Reading Band: <span className="text-emerald-400">{calculateScore() === 3 ? '9.0' : '6.5'}</span></p>
                    <button 
                      onClick={() => { setAnswers({}); setSubmitted(false); }}
                      className="mt-6 md:mt-8 bg-white/10 hover:bg-white/20 px-8 py-2.5 rounded-full font-bold text-sm transition-all border border-white/20 active:scale-95"
                    >
                      Restart Practice
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingModule;
