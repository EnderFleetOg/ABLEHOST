
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';

const ReportIssue: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { speak } = useAbility();
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const submit = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setDone(true);
    setLoading(false);
    setTimeout(onClose, 2000);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Dictation is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDesc(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errorMsg = "Dictation error.";
      switch(event.error) {
        case 'not-allowed': errorMsg = "Microphone access blocked."; break;
        case 'network': errorMsg = "Network connection required."; break;
        case 'no-speech': errorMsg = "No speech detected."; break;
      }
      speak(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speak]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-ableBlack/95 flex items-center justify-center p-6 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-ableBlack border-8 border-ablePurple p-12 rounded-huge shadow-huge space-y-10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#A855F710_0%,_transparent_70%)]"></div>
        
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div 
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-10 relative z-10"
            >
              <div className="text-9xl animate-bounce">💜</div>
              <h2 className="text-5xl font-black text-ableTeal tracking-tighter uppercase italic">Report Sent</h2>
              <p className="text-2xl font-bold text-white/60">We are adapting the system now.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10 relative z-10"
            >
              <header className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-ablePurple uppercase tracking-[0.4em] leading-none">System Feedback</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic underline decoration-ableTeal underline-offset-4 decoration-4">Report Barrier.</h2>
                </div>
                <button onClick={onClose} className="text-4xl text-white/40 hover:text-white transition-colors p-2 leading-none">✕</button>
              </header>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-white/60">What hindered your ability today?</p>
                  <button 
                    onClick={startListening}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs border-2 transition-all ${isListening ? 'bg-ablePurple border-white animate-pulse' : 'bg-white/10 border-white/20 hover:border-ableTeal text-white'}`}
                  >
                    {isListening ? 'LISTENING...' : '🎙️ DICTATE'}
                  </button>
                </div>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g., Font too small, AI cut me off..."
                  className="w-full h-48 bg-white/5 border-4 border-white/20 rounded-3xl p-8 text-2xl font-bold text-white outline-none focus:border-ableTeal transition-all resize-none shadow-inner"
                />
              </div>

              <button 
                onClick={submit}
                disabled={loading || !desc.trim()}
                className="w-full py-8 bg-ablePurple text-white rounded-huge font-black text-3xl shadow-glow active:scale-95 transition-all disabled:opacity-50 hover:brightness-110"
              >
                {loading ? 'SENDING...' : 'SEND REPORT'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ReportIssue;
