import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890'; // Default placeholder

  const handleSendMessage = () => {
    const message = encodeURIComponent("Hi ieltshub! I'd like to ask about the IELTS prep material.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-emerald-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">ieltshub Support</p>
                  <p className="text-[10px] opacity-80">Replied in minutes</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 mb-4 max-w-[85%]">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Hello! How can we help you today with your IELTS preparation? 🎓
                </p>
                <p className="text-[9px] text-slate-400 mt-1 font-bold">10:00 AM</p>
              </div>
              
              <button 
                onClick={handleSendMessage}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100"
              >
                <Send size={16} />
                Start Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-500 rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center text-white transition-colors hover:bg-emerald-600"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
};

export default WhatsAppWidget;
