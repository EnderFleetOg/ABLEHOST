
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { VisionNeed, CognitiveMode, VoicePreference } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import EmergencyQR from './EmergencyQR';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { pad, updatePAD, isHighContrast, toggleHighContrast, speak } = useAbility();
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-ableBlack border-8 border-ableTeal rounded-huge shadow-huge overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b-4 border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-ableTeal italic uppercase tracking-tighter">Accessibility DNA</h2>
              <button 
                onClick={() => setShowQR(true)}
                className="bg-ableRed text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow active:scale-95 transition-all flex items-center gap-2"
              >
                <span>🆘</span> OPEN QR
              </button>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
            <AnimatePresence>
              {showQR && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                  <EmergencyQR onClose={() => setShowQR(false)} />
                </div>
              )}
            </AnimatePresence>
            {/* Visual Settings */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Visual Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={toggleHighContrast}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${isHighContrast ? 'border-ableTeal bg-ableTeal text-ableBlack' : 'border-white/10 bg-white/5 text-white'}`}
                >
                  <span className="text-3xl">🌓</span>
                  <span className="font-black uppercase text-sm">High Contrast</span>
                </button>
                <button 
                  onClick={() => {
                    const sizes: Array<'standard' | 'large' | 'extra-large'> = ['standard', 'large', 'extra-large'];
                    const currentIdx = sizes.indexOf(pad.fontSize || 'standard');
                    const nextIdx = (currentIdx + 1) % sizes.length;
                    updatePAD({ fontSize: sizes[nextIdx] });
                  }}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${pad.fontSize && pad.fontSize !== 'standard' ? 'border-ableTeal bg-ableTeal text-ableBlack' : 'border-white/10 bg-white/5 text-white'}`}
                >
                  <span className="text-3xl">🔤</span>
                  <span className="font-black uppercase text-[10px]">Text Size: {pad.fontSize || 'standard'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Vision Need</label>
                <div className="grid grid-cols-3 gap-2">
                  {[VisionNeed.Standard, VisionNeed.LowVision, VisionNeed.Blind].map(need => (
                    <button
                      key={need}
                      onClick={() => updatePAD({ vision: need })}
                      className={`py-3 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${pad.vision === need ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                    >
                      {need}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Audio Settings */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Audio & Speech</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Speech Rate ({Math.round(pad.speechRate * 100)}%)</label>
                  <button onClick={() => speak("Testing speech rate at this speed.")} className="text-ableTeal font-black text-[10px] uppercase underline">Test</button>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={pad.speechRate}
                  onChange={(e) => updatePAD({ speechRate: parseFloat(e.target.value) })}
                  className="w-full h-4 bg-white/10 rounded-full appearance-none cursor-pointer accent-ableTeal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Voice Preference</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => updatePAD({ voicePreference: VoicePreference.CalmFemale })}
                    className={`p-4 rounded-2xl border-2 font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${pad.voicePreference === VoicePreference.CalmFemale ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                  >
                    <span>👩</span> Calm Female
                  </button>
                  <button 
                    onClick={() => updatePAD({ voicePreference: VoicePreference.CalmMale })}
                    className={`p-4 rounded-2xl border-2 font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${pad.voicePreference === VoicePreference.CalmMale ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                  >
                    <span>👨</span> Calm Male
                  </button>
                </div>
              </div>
            </section>

            {/* Cognitive Settings */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Cognitive Load & AI</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => updatePAD({ simplifiedResponses: !pad.simplifiedResponses })}
                  className={`w-full p-4 rounded-2xl border-2 font-black uppercase text-xs flex items-center justify-between transition-all ${pad.simplifiedResponses ? 'border-ablePurple bg-ablePurple/20 text-ablePurple' : 'border-white/10 text-white/40'}`}
                >
                  <div className="flex items-center gap-2">
                    <span>🧠</span> Simplified AI Responses
                  </div>
                  <span>{pad.simplifiedResponses ? 'ON' : 'OFF'}</span>
                </button>

                <div className="grid grid-cols-1 gap-2">
                  {[CognitiveMode.Standard, CognitiveMode.Simplified, CognitiveMode.HighFocus].map(mode => (
                  <button
                    key={mode}
                    onClick={() => updatePAD({ cognitive: mode })}
                    className={`p-4 rounded-2xl border-2 font-black uppercase text-xs flex items-center justify-between transition-all ${pad.cognitive === mode ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                  >
                    <span>{mode}</span>
                    {pad.cognitive === mode && <span>✓</span>}
                  </button>
                ))}
                </div>
              </div>
            </section>
          </div>

          <div className="p-8 bg-white/5 border-t-4 border-white/10">
            <button 
              onClick={onClose}
              className="w-full py-6 bg-ableTeal text-ableBlack rounded-3xl font-black text-xl uppercase tracking-widest shadow-huge active:scale-95 transition-all"
            >
              Apply Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AccessibilityModal;
