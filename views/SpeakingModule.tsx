
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Volume2, 
  User, 
  Bot, 
  History, 
  LogIn, 
  Loader2,
  Calendar, 
  BarChart3, 
  Play, 
  Pause,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Trash2,
  Lock,
  X
} from 'lucide-react';
import { getLiveSession, encodeAudio, decodeAudio, decodeAudioData, evaluateSpeaking } from '../services/geminiService';
import { saveSpeakingSession, getSpeakingHistory, getAudioBlob } from '../services/speakingService';
import { auth, signInWithGoogle } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { SpeakingSession } from '../types';

const SpeakingModule: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{ sender: 'Examiner' | 'You', text: string }[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SpeakingSession | null>(null);
  const [selectedSessionAudio, setSelectedSessionAudio] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isHistoryPlaying, setIsHistoryPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Audio recording refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (selectedSession) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSession]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadHistory();
    });
    return unsubscribe;
  }, []);

  const loadHistory = async () => {
    const history = await getSpeakingHistory();
    setSessions(history);
  };

  const stopSession = useCallback(async () => {
    setIsActive(false);
    setIsListening(false);
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    // Trigger saving process
    setIsSaving(true);
  }, []);

  const handleMediaRecorderStop = useCallback(async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    // Evaluate and Save
    try {
      // Create string transcript for AI evaluation
      const transcriptText = transcript
        .map(t => `${t.sender}: ${t.text}`)
        .join('\n');
      
      const evaluation = await evaluateSpeaking(transcriptText);
      await saveSpeakingSession(transcript, evaluation.feedback, evaluation.band, audioBlob);
      await loadHistory();
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setIsSaving(false);
      audioChunksRef.current = [];
    }
  }, [transcript]);

  const startSession = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (err) {
        return;
      }
    }

    setTranscript([]);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup MediaRecorder for candidate audio
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = handleMediaRecorderStop;
      mediaRecorder.start();
      
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = getLiveSession({
        onopen: () => {
          setIsActive(true);
          setIsListening(true);
          
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
               audio: { 
                 data: encodeAudio(new Uint8Array(int16.buffer)),
                 mimeType: 'audio/pcm;rate=16000'
               }
            };
            
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput(pcmBlob);
            });
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          // Input Audio Transcription
          if (msg.serverContent?.inputAudioTranscription) {
            const text = msg.serverContent.inputAudioTranscription.text;
            if (text) {
              setTranscript(prev => [...prev, { sender: 'You', text }]);
            }
          }

          // Output Audio Transcription
          if (msg.serverContent?.modelTurn?.parts) {
             const audioData = msg.serverContent.modelTurn.parts.find((p: any) => p.inlineData)?.inlineData?.data;
             if (audioData) {
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               const buffer = await decodeAudioData(decodeAudio(audioData), outputCtx, 24000, 1);
               const source = outputCtx.createBufferSource();
               source.buffer = buffer;
               source.connect(outputCtx.destination);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
               sourcesRef.current.add(source);
             }

             // Handle Model's text part (transcription)
             const textPart = msg.serverContent.modelTurn.parts.find((p: any) => p.text);
             if (textPart) {
                setTranscript(prev => [...prev, { sender: 'Examiner', text: textPart.text }]);
             }
          }
        },
        onerror: (e: any) => {
          console.error('Session Error:', e);
          stopSession();
        },
        onclose: () => {
          stopSession();
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      alert('Could not access microphone.');
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio URLs
      if (selectedSessionAudio) URL.revokeObjectURL(selectedSessionAudio);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [selectedSessionAudio]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAudioRef.current) {
      const time = parseFloat(e.target.value);
      currentAudioRef.current.currentTime = time;
      setPlayTime(time);
    }
  };

  const toggleHistoryAudio = async (sessionId: string, audioBlobId: string | undefined) => {
    if (!audioBlobId) return;

    if (playingId === sessionId) {
      if (currentAudioRef.current?.paused) {
        currentAudioRef.current.play();
        setIsHistoryPlaying(true);
      } else {
        currentAudioRef.current?.pause();
        setIsHistoryPlaying(false);
      }
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setPlayingId(sessionId);
    setIsHistoryPlaying(true);
    setPlayTime(0);
    setDuration(0);

    const blob = await getAudioBlob(audioBlobId);
    if (blob) {
      if (selectedSessionAudio) URL.revokeObjectURL(selectedSessionAudio);
      const url = URL.createObjectURL(blob);
      setSelectedSessionAudio(url);
      
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setPlayingId(null);
        setIsHistoryPlaying(false);
        setPlayTime(0);
      };
      
      audio.onerror = () => {
        setPlayingId(null);
        setIsHistoryPlaying(false);
      };

      audio.ontimeupdate = () => setPlayTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);

      audio.play();
    } else {
      setPlayingId(null);
      setIsHistoryPlaying(false);
    }
  };

  if (!user && !isActive) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-6">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Secure Your Progress</h2>
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
                <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Speaking Lab</h2>
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
                    {isActive ? (
                      <Bot size={64} className="text-white md:w-20 md:h-20" />
                    ) : (
                      <User size={64} className="text-slate-200 md:w-20 md:h-20" />
                    )}
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
                  <div className="flex flex-col items-center gap-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 1.0 }}
                      onClick={stopSession}
                      className="bg-rose-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 shadow-2xl shadow-rose-100 hover:bg-rose-600 transition-all"
                    >
                      <Square size={24} />
                      End & Save Session
                    </motion.button>
                    <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-xs">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                      <span>Examiner is Participating...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Transcript Display during session */}
          {isActive && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-100">
               {transcript.map((msg, i) => (
                 <motion.div 
                    initial={{ opacity: 0, x: msg.sender === 'You' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                 >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.sender === 'You' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                 </motion.div>
               ))}
               {transcript.length === 0 && (
                 <p className="text-center text-slate-400 font-medium italic">Begin speaking to start the interview...</p>
               )}
            </div>
          )}

          {/* Interview Parts Instructions */}
          {!isActive && !showHistory && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Part 1: Intro", text: "Introduce yourself and talk about your daily routine and hobbies." },
                { title: "Part 2: Cue Card", text: "Describe a memorable event from your past. You have 1 minute to prepare before you speak for 2 minutes." },
                { title: "Part 3: Discussion", text: "Compare and contrast your memorable event from Part 2 with a similar event from a different cultural context, encouraging deeper discussion and abstract thinking." }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
                  <h4 className="font-black text-slate-800 mb-2 uppercase tracking-tight text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Previous Sessions (Sidebar/Bottom) */}
        <AnimatePresence>
          {(showHistory || !isActive) && sessions.length > 0 && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-full lg:w-96 space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={20} />
                  Session History
                </h3>
              </div>
              
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div 
                     layoutId={session.id}
                     key={session.id} 
                     onClick={() => setSelectedSession(session)}
                     className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                          <BarChart3 size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(session.date).toLocaleDateString()}</p>
                          <div className="flex items-center gap-2">
                             <Award size={14} className="text-amber-500" />
                             <span className="text-lg font-black text-slate-800 tracking-tight">{session.overallBand} <span className="text-xs opacity-50">/ 9.0</span></span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHistoryAudio(session.id, session.audioBlobId);
                        }}
                        className={`p-2.5 rounded-full transition-all transform active:scale-90 ${
                          playingId === session.id 
                            ? (isHistoryPlaying ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {playingId === session.id && isHistoryPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                      </button>
                    </div>
                    {playingId === session.id && (
                      <div className="space-y-2 mb-4 px-1">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 h-3 items-center">
                            {[1, 2, 3, 4, 5].map(i => (
                              <motion.div
                                key={i}
                                animate={isHistoryPlaying ? { height: [4, 12, 4] } : { height: 4 }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 bg-indigo-400 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {formatTime(playTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          step="0.01"
                          value={playTime}
                          onChange={handleSeek}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          style={{
                            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${duration ? (playTime / duration) * 100 : 0}%, #f1f5f9 ${duration ? (playTime / duration) * 100 : 0}%, #f1f5f9 100%)`
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic mb-3">"{session.feedback}"</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span className="flex items-center gap-1"><Clock size={10} /> {session.transcript.length} message exchange</span>
                       <span className="group-hover:text-indigo-600 transition-colors flex items-center gap-1">Details <ChevronRight size={10} /></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSession(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Session Details</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedSession.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="p-3 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all border border-slate-100"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-100">
                {/* Score and Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-indigo-600 p-8 rounded-[2rem] text-white space-y-2 shadow-xl shadow-indigo-100 flex flex-col justify-center items-center text-center">
                    <Award size={40} className="mb-2 text-indigo-200" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 text-indigo-100">Overall Estimated Band</p>
                    <div className="text-6xl font-black">{selectedSession.overallBand}</div>
                    <p className="text-sm font-bold opacity-60">Out of 9.0</p>
                  </div>
                  
                  <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs">
                      <TrendingUp size={16} />
                      <span>Examiner Feedback</span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic text-lg">
                      "{selectedSession.feedback}"
                    </p>
                  </div>
                </div>

                {/* Transcript Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-xs">
                      <User size={16} />
                      <span>Full Interview Transcript</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedSession.transcript.length} Exchanges</span>
                  </div>

                  <div className="space-y-4">
                    {selectedSession.transcript.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] space-y-1 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                          <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${msg.sender === 'You' ? 'text-indigo-400' : 'text-slate-400'}`}>
                            {msg.sender === 'You' ? 'Candidate (You)' : 'IELTS Examiner'}
                          </div>
                          <div className={`p-4 md:p-5 rounded-2xl text-sm md:text-base font-medium shadow-sm leading-relaxed ${
                            msg.sender === 'You' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 order-2 md:order-1">
                  <button 
                    onClick={() => toggleHistoryAudio(selectedSession.id, selectedSession.audioBlobId)}
                    className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all transform active:scale-95 shadow-lg ${
                      playingId === selectedSession.id && isHistoryPlaying
                        ? 'bg-rose-500 text-white shadow-rose-100'
                        : 'bg-indigo-600 text-white shadow-indigo-100'
                    }`}
                  >
                    {playingId === selectedSession.id && isHistoryPlaying ? (
                      <><Pause size={20} fill="currentColor" /> Pause Interview Audio</>
                    ) : (
                      <><Play size={20} fill="currentColor" /> Play Interview Audio</>
                    )}
                  </button>
                  
                  {playingId === selectedSession.id && (
                    <div className="hidden md:flex items-center gap-3 px-4">
                      <span className="text-xs font-mono text-slate-500 font-bold">{formatTime(playTime)}</span>
                      <div className="w-24 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${(playTime / duration) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-500 font-bold">{formatTime(duration)}</span>
                    </div>
                  )}
                </div>
                <div className="order-1 md:order-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recordings are stored locally in your browser</p>
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
