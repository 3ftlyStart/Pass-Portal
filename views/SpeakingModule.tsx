
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, Square, Loader2, Volume2, User, Bot } from 'lucide-react';
import { getLiveSession, encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

const SpeakingModule: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{ sender: 'Examiner' | 'You', text: string }[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<any>(null);

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
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
              data: encodeAudio(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          if (msg.serverContent?.outputTranscription) {
            setCurrentTranscription(prev => prev + msg.serverContent.outputTranscription.text);
          }
          
          if (msg.serverContent?.turnComplete) {
            setTranscript(prev => [...prev, { sender: 'Examiner', text: '...' }]); // Transcription support can be deeper
          }

          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-10">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 text-center space-y-6 md:space-y-8 relative overflow-hidden"
      >
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-50/50 animate-pulse pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Speaking Mock Test</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium">Simulate a real 1-on-1 IELTS interview with our AI examiner</p>
          </div>

          <div className="flex justify-center mb-8 md:mb-12">
            <div className="relative">
              <motion.div 
                animate={isActive ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner ${
                  isActive ? 'bg-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50'
                }`}
              >
                {isActive ? (
                  <Bot size={48} className="text-white md:w-16 md:h-16" />
                ) : (
                  <User size={48} className="text-slate-200 md:w-16 md:h-16" />
                )}
              </motion.div>
              {isActive && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 bg-green-500 p-2.5 md:p-3 rounded-full border-4 border-white text-white shadow-lg"
                >
                  <Volume2 size={20} className="md:w-6 md:h-6" />
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {!isActive ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="bg-indigo-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl flex items-center gap-3 mx-auto shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <Mic size={24} className="md:w-7 md:h-7" />
                Start Interview
              </motion.button>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopSession}
                  className="bg-rose-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl flex items-center gap-3 shadow-xl shadow-rose-100 hover:bg-rose-600 transition-all"
                >
                  <Square size={24} className="md:w-7 md:h-7" />
                  End Session
                </motion.button>
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                  <span>Examiner is Participating...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Responsive Grid for Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: "Part 1: Intro", text: "Relax and answer naturally about familiar topics like work, home, or hobbies." },
          { title: "Part 2: Cue Card", text: "Speak for 2 minutes. Use the 1 minute prep time to write down bullet points." },
          { title: "Part 3: Discussion", text: "Expand your answers. Discuss abstract ideas and justify opinions clearly." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SpeakingModule;
