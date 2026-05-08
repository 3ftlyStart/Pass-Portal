import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  History, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  User, 
  Bot, 
  Sparkles,
  BarChart3,
  Clock,
  BookOpen,
  Volume2,
  X,
  Lock,
  Loader2,
  Save,
  MessageSquare,
  ArrowUpDown,
  Filter,
  Library
} from 'lucide-react';
import { auth, db } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  evaluateSpeaking, 
  saveSpeakingSession, 
  getSpeakingHistory,
  getLiveSession,
  encodeAudio,
  pcm16ToFloat32,
  float32ToPcm16
} from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { doc, getDoc } from 'firebase/firestore';
import { SpeakingScore } from '../types';

const SpeakingModule = () => {
  const [user] = useAuthState(auth);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ sender: string; text: string }[]>([]);
  const [activePrompt, setActivePrompt] = useState({
    category: 'Part 1',
    text: 'What do you enjoy doing in your free time?'
  });
  
  const [cachedPrompts, setCachedPrompts] = useState<Record<string, string>>({
    'Part 1': 'What do you enjoy doing in your free time?',
    'Part 2': 'Describe a memorable event from your past. You have 1 minute to prepare.',
    'Part 3': 'Compare and contrast your memorable event from Part 2 with a similar event from a different cultural context.'
  });
  const [isPromptListOpen, setIsPromptListOpen] = useState(false);
  
  const [usedPrompts, setUsedPrompts] = useState<Record<string, number[]>>({
    'Part 1': [0], // Initial prompt index
    'Part 2': [],
    'Part 3': []
  });
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isHistoryPlaying, setIsHistoryPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ feedback: string; band: number; scores: SpeakingScore } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  
  // Live API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  const prompts = {
    'Part 1': [
      'What do you enjoy doing in your free time?',
      'Tell me about your hometown.',
      'Do you prefer to study in the morning or evening?',
      'What kind of music do you like?',
      'Do you think it is important to eat breakfast?'
    ],
    'Part 2': [
      'Describe a memorable event from your past. You have 1 minute to prepare.',
      'Describe a book you have recently read. Explain why you liked it.',
      'Describe a city you would like to visit in the future.',
      'Describe a person who has influenced you significantly.',
      'Describe a piece of technology that you find very useful.'
    ],
    'Part 3': [
      'Compare and contrast your memorable event from Part 2 with a similar event from a different cultural context.',
      'How has technology changed the way people communicate in your country?',
      'What are the advantages and disadvantages of living in a big city?',
      'Do you think modern education is better than traditional education?',
      'How important is it for people to have hobbies in today\'s world?'
    ]
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const history = await getSpeakingHistory(user.uid);
      setSessions(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const generateNewPrompt = (category: string) => {
    const categoryPrompts = prompts[category as keyof typeof prompts];
    const categoryUsed = usedPrompts[category] || [];
    
    // Find unused indices
    let availableIndices = categoryPrompts
      .map((_, index) => index)
      .filter(index => !categoryUsed.includes(index));

    // If all used, reset for this category
    if (availableIndices.length === 0) {
      // Exclude current text if we are re-shuffling to avoid instant repeat
      availableIndices = categoryPrompts.map((_, index) => index);
      const currentIdx = categoryPrompts.indexOf(activePrompt.text);
      if (availableIndices.length > 1 && currentIdx !== -1 && activePrompt.category === category) {
        availableIndices = availableIndices.filter(i => i !== currentIdx);
      }
      
      const nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setUsedPrompts(prev => ({ ...prev, [category]: [nextIdx] }));
      const newPrompt = { category, text: categoryPrompts[nextIdx] };
      setActivePrompt(newPrompt);
      setCachedPrompts(prev => ({ ...prev, [category]: newPrompt.text }));
    } else {
      const nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setUsedPrompts(prev => ({ 
        ...prev, 
        [category]: [...categoryUsed, nextIdx] 
      }));
      const newPrompt = { category, text: categoryPrompts[nextIdx] };
      setActivePrompt(newPrompt);
      setCachedPrompts(prev => ({ ...prev, [category]: newPrompt.text }));
    }
  };

  const handleCategorySwitch = (category: string) => {
    setActivePrompt({
      category,
      text: cachedPrompts[category]
    });
  };

  const startSession = async () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsActive(true);
      setTranscript([
        { sender: 'Examiner', text: `Hello. Let's begin the speaking test. For Part 1, I'm going to ask you some general questions. ${activePrompt.text}` }
      ]);

      const systemInstruction = `You are an official IELTS Speaking Examiner. 
      Your goal is to conduct a professional, formal interview.
      Current prompt: ${activePrompt.category} - ${activePrompt.text}
      Be encouraging but maintain the standard of a formal examination. 
      Ask follow-up questions based on the candidate's responses.
      Start by asking about the candidate's name or jumping into the first question.`;

      const sessionPromise = getLiveSession({
        onopen: () => {
          console.log('Live API session opened');
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = float32ToPcm16(inputData);
            const base64 = encodeAudio(pcm16);
            
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle audio output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const float32 = pcm16ToFloat32(bytes);
            audioQueueRef.current.push(float32);
            if (!isPlayingRef.current) playNextInQueue();
          }

          // Handle transcriptions
          const inputTranscription = (message as any).serverContent?.inputAudioTranscription?.text;
          const outputTranscription = (message as any).serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;

          if (inputTranscription) {
            updateTranscript('You', inputTranscription);
          }
          if (outputTranscription) {
            updateTranscript('Examiner', outputTranscription);
          }

          if (message.serverContent?.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
          }
        },
        onclose: () => setIsActive(false),
        onerror: (err: any) => console.error('Live API Error:', err),
      }, systemInstruction);

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error('Error starting Live Session:', error);
      alert('Could not access microphone or start Live API.');
    }
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const ctx = audioContextRef.current;
    const chunk = audioQueueRef.current.shift()!;
    const buffer = ctx.createBuffer(1, chunk.length, 16000);
    buffer.getChannelData(0).set(chunk);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => playNextInQueue();
    source.start();
  };

  const updateTranscript = (sender: string, text: string) => {
    setTranscript(prev => {
      // If the last message is from the same sender, we might want to append?
      // Actually, Live API sends chunks. Let's just manage unique-ish entries or trust the message flow.
      const last = prev[prev.length - 1];
      if (last && last.sender === sender && sender === 'Examiner') {
        // Simple heuristic: if it's the same sender and very recent, maybe group?
        // For now, just append as new message for simplicity in real-time feel
        return [...prev, { sender, text }];
      }
      return [...prev, { sender, text }];
    });
  };

  const stopSession = async () => {
    if (isActive) {
      if (processorRef.current) {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (sessionRef.current) {
        const session = await sessionRef.current;
        session.close();
      }
      
      setIsActive(false);
      handleEvaluation();
    }
  };

  const handleEvaluation = async () => {
    setIsSaving(true);
    try {
      // Combine transcript text for full analysis
      const fullTranscript = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
      const evaluation = await evaluateSpeaking(fullTranscript);
      setFeedback(evaluation);

      if (user) {
        await saveSpeakingSession(user.uid, {
          date: new Date().toISOString(),
          transcript,
          overallBand: evaluation.band,
          feedback: evaluation.feedback,
          scores: evaluation.scores
        });
        loadHistory();
      }
    } catch (error) {
      console.error('Error evaluating session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayTime(time);
    }
  };

  const toggleHistoryAudio = (id: string, blobId: string) => {
    if (playingId === id) {
      if (isHistoryPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsHistoryPlaying(!isHistoryPlaying);
    } else {
      setPlayingId(id);
      setIsHistoryPlaying(true);
      setPlayTime(0);
      // In a real app, fetch blob or URL. For now, mock playback.
      if (audioRef.current) {
        audioRef.current.src = ''; 
      }
    }
  };

  const AccordionItem = ({ title, icon, isOpen, onToggle, children }: any) => (
    <motion.div 
      className={`rounded-3xl border transition-all duration-300 ${isOpen ? 'bg-white border-indigo-100 shadow-xl' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
    >
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>
            {icon}
          </div>
          <span className={`text-sm font-black uppercase tracking-widest ${isOpen ? 'text-slate-800' : 'text-slate-500'}`}>
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={isOpen ? 'text-indigo-600' : 'text-slate-300'}
        >
          <ChevronRight />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-sm font-medium leading-relaxed text-slate-600 border-t border-slate-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const PronunciationTips = () => (
    <div className="space-y-5 pt-8 border-t border-slate-100 mt-4">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Sparkles size={18} />
        </div>
        <h4 className="text-xl font-black text-slate-800 tracking-tight font-heading">Mastering Pronunciation</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Vowel Sounds",
            content: "Focus on long vs short vowels (e.g., 'heat' vs 'hit'). Practice the /æ/ as in 'cat' and the neutral schwa /ə/.",
            icon: <Volume2 size={16} />
          },
          {
            title: "Consonant Clarity",
            content: "Ensure 'th', 'v/b', and 'l/r' distinctions are clear. Don't drop final consonant sounds like /t/, /d/, or /s/.",
            icon: <Mic size={16} />
          },
          {
            title: "Intonation",
            content: "Vary your pitch to show emotion and emphasize key words. Avoid a monotone delivery to keep the examiner engaged.",
            icon: <TrendingUp size={16} />
          }
        ].map((tip, i) => (
          <div key={i} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all cursor-default group">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                {tip.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tip.title}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-bold">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (!user && !isActive) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 font-heading">Secure Your Progress</h2>
        <p className="text-slate-500 font-medium px-10">Sign in to record your speaking mock tests, save transcripts, and track your performance over time.</p>
        <button
          onClick={signInWithGoogle}
          className="bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">
      {/* Module Navigation / Actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className={`p-2 rounded-xl transition-all ${isSidebarVisible ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-100'}`}
            title="Toggle History Sidebar"
          >
            <History size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            {feedback && !isActive ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-800 font-heading">Performance Analysis</h3>
                  <button 
                    onClick={() => setFeedback(null)}
                    className="text-indigo-600 font-bold text-sm hover:underline"
                  >
                    Back to Lab
                  </button>
                </div>

                <div className="bg-indigo-600 p-8 md:p-10 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Award size={120} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <h4 className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-2">Estimated Overall Band</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black tracking-tighter">{feedback.band.toFixed(1)}</span>
                        <span className="text-2xl font-bold text-indigo-300">/ 9.0</span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 max-w-sm">
                      <p className="text-xs text-indigo-200 mb-2 font-bold uppercase tracking-wider text-center md:text-left">Examiner Summary</p>
                      <p className="text-sm font-medium leading-relaxed italic">
                        "{feedback.feedback}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">Detailed Assessment</h4>
                  <AccordionItem
                    title="Fluency & Coherence"
                    icon={<Clock />}
                    isOpen={openSection === 'Fluency'}
                    onToggle={() => setOpenSection(openSection === 'Fluency' ? null : 'Fluency')}
                  >
                    {feedback.scores.fluencyCoherence}
                  </AccordionItem>
                  <AccordionItem
                    title="Lexical Resource"
                    icon={<BookOpen />}
                    isOpen={openSection === 'Lexical'}
                    onToggle={() => setOpenSection(openSection === 'Lexical' ? null : 'Lexical')}
                  >
                    {feedback.scores.lexicalResource}
                  </AccordionItem>
                  <AccordionItem
                    title="Grammatical Range"
                    icon={<Award />}
                    isOpen={openSection === 'Grammar'}
                    onToggle={() => setOpenSection(openSection === 'Grammar' ? null : 'Grammar')}
                  >
                    {feedback.scores.grammaticalRange}
                  </AccordionItem>
                  <AccordionItem
                    title="Pronunciation"
                    icon={<Volume2 />}
                    isOpen={openSection === 'Pronunciation'}
                    onToggle={() => setOpenSection(openSection === 'Pronunciation' ? null : 'Pronunciation')}
                  >
                    {feedback.scores.pronunciation}
                  </AccordionItem>
                </div>

                <PronunciationTips />

                <button 
                  onClick={() => setFeedback(null)}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200 hover:bg-slate-900 transition-all active:scale-95"
                >
                  Start New Practice
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="lab"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center space-y-8 relative overflow-hidden transition-all duration-700 ${isActive ? 'ring-4 ring-indigo-50 border-indigo-100' : ''}`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-indigo-50/20 animate-pulse pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight font-heading">Speaking Lab</h2>
                    <p className="text-slate-500 font-medium">Recordings will be saved automatically with full AI feedback</p>
                  </div>

                  <div className="flex justify-center mb-12">
                    <div className="relative">
                      <motion.div 
                        animate={isActive ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-700 shadow-inner ${
                          isActive ? 'bg-indigo-600 shadow-2xl shadow-indigo-200' : 'bg-slate-50'
                        }`}
                      >
                        {isActive ? <Bot size={64} className="text-white md:w-20 md:h-20" /> : <User size={64} className="text-slate-200 md:w-20 md:h-20" />}
                      </motion.div>
                      {isActive && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 bg-green-500 p-4 rounded-full border-8 border-white text-white shadow-xl"
                        >
                          <Volume2 size={24} className="md:w-8 md:h-8" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {!isActive ? (
                      <div className="flex flex-col items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={startSession}
                          disabled={isSaving}
                          className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Mic size={24} />}
                          {isSaving ? "Saving Session..." : "Start Interview"}
                        </motion.button>
                        {!isActive && !isSaving && (
                          <button 
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-slate-400 font-bold text-sm flex items-center gap-2 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
                          >
                            <History size={16} />
                            {showHistory ? "Hide History" : "View Previous Tests"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
                        <div className="w-full bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 md:p-8 max-h-[350px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-slate-50/50 py-2 backdrop-blur-sm z-10">
                            <Sparkles size={12} className="text-indigo-500" />
                            Live Interview Transcript
                          </div>
                          {transcript.map((msg, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={i} 
                              className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
                            >
                              <span className={`text-[9px] font-black uppercase tracking-wider mb-1 ${msg.sender === 'You' ? 'text-indigo-500' : 'text-slate-400'}`}>
                                {msg.sender === 'You' ? 'Candidate (You)' : 'IELTS Examiner'}
                              </span>
                              <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed text-left ${msg.sender === 'You' ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={transcriptEndRef} />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={stopSession}
                            className="bg-rose-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-rose-100 hover:bg-rose-600 transition-all"
                          >
                            <Square size={24} />
                            End & Save Session
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isActive && !showHistory && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Filter size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight font-heading">Question Filter</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a category to filter prompts</p>
                  </div>
                </div>
                
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  {(['Part 1', 'Part 2', 'Part 3'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySwitch(cat)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activePrompt.category === cat 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-500" />
                    Step 1: Select Your Prompt
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setIsPromptListOpen(!isPromptListOpen)}
                      className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      <Library size={12} />
                      Browse All {activePrompt.category} Prompts
                    </button>
                    
                    <AnimatePresence>
                      {isPromptListOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 max-h-64 overflow-y-auto"
                        >
                          <div className="px-4 py-2 border-b border-slate-50 mb-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Questions</p>
                          </div>
                          {prompts[activePrompt.category as keyof typeof prompts].map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const newPrompt = { category: activePrompt.category, text: p };
                                setActivePrompt(newPrompt);
                                setCachedPrompts(prev => ({ ...prev, [activePrompt.category]: p }));
                                setIsPromptListOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-xs font-bold transition-all hover:bg-slate-50 flex gap-3 ${activePrompt.text === p ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                            >
                              <span className="opacity-30">{idx + 1}.</span>
                              <span className="line-clamp-2">{p}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.div 
                  key={activePrompt.text} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-white p-8 md:p-10 rounded-[2.5rem] border-2 border-indigo-50 shadow-sm relative overflow-hidden group"
                >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <MessageSquare size={120} />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                      <Sparkles size={12} />
                      {activePrompt.category} Focus
                    </div>
                    <button 
                      onClick={() => generateNewPrompt(activePrompt.category)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="New Question"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-2xl md:text-3xl font-black text-slate-800 leading-tight font-heading max-w-2xl">
                      "{activePrompt.text}"
                    </p>
                    <p className="text-xs text-slate-400 font-bold max-w-lg">
                      {activePrompt.category === 'Part 1' && "Part 1 questions are usually about everyday topics like work, home, or interests."}
                      {activePrompt.category === 'Part 2' && "In Part 2, you have to talk about a specific topic for 1-2 minutes. Use your 1 minute prep time wisely."}
                      {activePrompt.category === 'Part 3' && "Part 3 involves an abstract discussion related to your Part 2 topic."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          )}
        </div>

        <AnimatePresence>
          {isSidebarVisible && sessions.length > 0 && (
            <motion.div 
              initial={{ x: 20, opacity: 0, width: 0 }} 
              animate={{ x: 0, opacity: 1, width: 'auto' }} 
              exit={{ x: 20, opacity: 0, width: 0 }} 
              className="w-full lg:w-96 space-y-6 overflow-hidden"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 font-heading">
                  <TrendingUp className="text-indigo-600" size={20} />
                  Session History
                </h3>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                  >
                    <ArrowUpDown size={14} />
                    {sortOrder === 'desc' ? 'New' : 'Old'}
                  </button>
                  <button 
                    onClick={() => setIsSidebarVisible(false)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {sortedSessions.map((session) => (
                  <motion.div 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)} 
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group hover:shadow-md relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="bg-indigo-50/50 p-1.5 rounded-lg absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={10} />
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                        <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                          {session.overallBand ? <span>B{session.overallBand}</span> : <span className="opacity-50">-</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">AI Summary</div>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic mb-3">
                          "{session.feedback || 'No summary available.'}"
                        </p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSession(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight font-heading">Session Details</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedSession.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-3 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all border border-slate-100"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-600 p-8 rounded-[2rem] text-white flex flex-col items-center justify-center text-center shadow-xl shadow-indigo-100">
                    <Award size={40} className="mb-2 text-indigo-200" />
                    <div className="text-6xl font-black">{selectedSession.overallBand}</div>
                    <p className="text-sm font-bold opacity-60">Overall Band</p>
                  </div>
                  <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-slate-600 font-medium leading-relaxed italic">"{selectedSession.feedback}"</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight font-heading">AI Assessment</h4>
                  <div className="space-y-3">
                    {selectedSession.scores && (
                      <>
                        <AccordionItem title="Fluency & Coherence" icon={<Clock />} isOpen={openSection === 'F'} onToggle={() => setOpenSection(openSection === 'F' ? null : 'F')}>{selectedSession.scores.fluencyCoherence}</AccordionItem>
                        <AccordionItem title="Lexical Resource" icon={<BookOpen />} isOpen={openSection === 'L'} onToggle={() => setOpenSection(openSection === 'L' ? null : 'L')}>{selectedSession.scores.lexicalResource}</AccordionItem>
                        <AccordionItem title="Grammatical Range" icon={<Award />} isOpen={openSection === 'G'} onToggle={() => setOpenSection(openSection === 'G' ? null : 'G')}>{selectedSession.scores.grammaticalRange} </AccordionItem>
                        <AccordionItem title="Pronunciation" icon={<Volume2 />} isOpen={openSection === 'P'} onToggle={() => setOpenSection(openSection === 'P' ? null : 'P')}>{selectedSession.scores.pronunciation}</AccordionItem>
                      </>
                    )}
                  </div>
                </div>

                <PronunciationTips />

                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight font-heading">Full Transcript</h4>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                    {selectedSession.transcript?.map((msg: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${msg.sender === 'Examiner' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                          {msg.sender[0]}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender}</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeakingModule;
