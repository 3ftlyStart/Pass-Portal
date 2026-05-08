import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Phone, Loader2, Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupportResponse, ChatMessage } from '../services/aiSupportService';
import { useAuth } from '../context/AuthContext';

const WhatsAppWidget: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ozi_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890';

  // Persistence
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ozi_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Personalized greeting if history is empty
  useEffect(() => {
    if (messages.length === 0) {
      const name = profile?.displayName ? profile.displayName.split(' ')[0] : 'there';
      const greeting = `Hello ${name}! I'm Ozi, your personal ieltshub assistant. How can I help you reach your target score of ${profile?.targetScore || '7.5'}+ today? 🎓`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [profile, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    const aiResponse = await getSupportResponse(newMessages, profile);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    localStorage.removeItem('ozi_chat_history');
    setMessages([]);
  };

  const handleWhatsAppHandoff = () => {
    const summary = messages
      .map(m => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const intro = "Hi ieltshub Support! I've been chatting with Ozi and I'd like to speak with a human. Here is our conversation so far:\n\n";
    const message = encodeURIComponent(intro + summary);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 fixed inset-0 sm:relative sm:inset-auto w-full h-full sm:w-80 md:w-96 bg-white sm:rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col sm:max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-slate-900 p-5 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black tracking-tight font-heading">Ozi AI</p>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ieltshub Genius</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                  title="Clear history"
                >
                  <History size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                      {msg.role === 'user' ? <User size={12} className="text-slate-600" /> : <Sparkles size={12} className="text-indigo-600" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm border ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                        : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-indigo-600">Ozi is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3 shrink-0 pb-safe">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Ozi anything..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-100"
                >
                  <Send size={18} />
                </button>
              </div>
              
              <button 
                onClick={handleWhatsAppHandoff}
                className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
              >
                <Phone size={14} className="group-hover:rotate-12 transition-transform" />
                Transfer to Human on WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center text-white transition-all hover:bg-emerald-600 z-[60]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default WhatsAppWidget;

