
import React, { useState, useCallback } from 'react';
import { useAbility } from '../context/AbilityContext';

interface FeedbackSystemProps {
  onClose: () => void;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ onClose }) => {
  const { pad, speak } = useAbility();
  const [category, setCategory] = useState<'glitch' | 'barrier' | 'idea'>('barrier');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSubmitted(true);
    setLoading(false);
    setTimeout(onClose, 2500);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition is not supported in this browser.");
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
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errorMsg = "Dictation failed.";
      switch(event.error) {
        case 'not-allowed': errorMsg = "Microphone access is restricted."; break;
        case 'network': errorMsg = "Check your internet connection."; break;
        case 'no-speech': errorMsg = "No audio detected."; break;
      }
      speak(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speak]);

  return (
    <div className="fixed inset-0 z-[100] bg-ableBlack/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-ableBlack border-8 border-ableTeal p-12 rounded-huge shadow-huge animate-in zoom-in slide-in-from-bottom-4 duration-400">
        
        {submitted ? (
          <div className="py-12 text-center space-y-6">
            <div className="text-9xl">💪</div>
            <h2 className="text-5xl font-black text-ableTeal tracking-tighter uppercase">DNA LOGGED.</h2>
            <p className="text-xl font-bold text-white/60">We are adapting the platform based on your input.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <header className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-xs font-black text-ablePurple uppercase tracking-[0.3em]">Adaptive Barrier Report</p>
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">WHAT STOPPED YOU?</h2>
              </div>
              <button onClick={onClose} className="text-4xl text-white/40 hover:text-white p-2">✕</button>
            </header>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-2">
                {['BARRIER', 'GLITCH', 'IDEA'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat.toLowerCase() as any)}
                    className={`py-4 rounded-2xl border-4 font-black text-[10px] tracking-widest transition-all ${
                      category === cat.toLowerCase() 
                        ? 'bg-ableTeal text-ableBlack border-white shadow-xl scale-105' 
                        : 'bg-white/5 text-white border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest">Description</label>
                  <button 
                    onClick={startListening}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg font-black text-[10px] border transition-all ${isListening ? 'bg-ableRed border-white animate-pulse text-white' : 'bg-white/5 border-white/20 text-white/60 hover:text-white hover:border-ableTeal'}`}
                  >
                    {isListening ? '🔴 LISTENING' : '🎙️ DICTATE'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="DESCRIBE THE FRICTION..."
                  className="w-full bg-white/5 border-4 border-white/10 rounded-3xl p-8 text-xl font-bold text-white outline-none focus:border-ableTeal min-h-[150px] transition-all resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !description.trim()}
                className="w-full bg-ableTeal text-ableBlack py-8 rounded-huge font-black text-3xl shadow-huge active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'SYNCING...' : 'REPORT BARRIER'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;
