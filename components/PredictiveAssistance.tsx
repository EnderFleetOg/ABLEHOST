
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';

const PredictiveAssistance: React.FC = () => {
  const { suggestion, setSuggestion, speak, activeTab } = useAbility() as any;

  // Basic predictive logic based on active tab and time
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const clearExisting = () => {
      setSuggestion(null);
      if (timer) clearTimeout(timer);
    };

    if (activeTab === 'vision') {
      timer = setTimeout(() => {
        setSuggestion("Need help explaining what the camera sees?");
      }, 15000); 
    } else if (activeTab === 'voice') {
      timer = setTimeout(() => {
        setSuggestion("Want me to speak this for you?");
      }, 10000);
    } else if (activeTab === 'career') {
       timer = setTimeout(() => {
        setSuggestion("Should we analyze your skills for a new role?");
      }, 20000);
    } else if (activeTab === 'dashboard') {
      timer = setTimeout(() => {
        setSuggestion("Would you like to review your scheduled tasks?");
      }, 30000);
    }

    return () => clearExisting();
  }, [activeTab, setSuggestion]);

  if (!suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg"
      >
        <div className="bg-ableBlack/90 border-4 border-ableTeal rounded-3xl p-6 shadow-glow backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ableTeal/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner animate-pulse">🤖</div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-ableTeal uppercase tracking-[0.3em] italic">ABLE Suggests</p>
              <p className="text-sm font-bold text-white italic leading-tight capitalize">{suggestion}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                speak(suggestion);
                setSuggestion(null);
              }}
              className="p-3 bg-ableTeal text-ableBlack rounded-xl font-black text-[10px] uppercase tracking-widest shadow-glow active:scale-90 transition-all"
            >
              YES
            </button>
            <button 
              onClick={() => setSuggestion(null)}
              className="p-3 bg-white/5 text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
            >
              DISMISS
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictiveAssistance;
