
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { VisionNeed, CognitiveMode, VoicePreference } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import EmergencyQR from './EmergencyQR';
import { LANGUAGES } from '../data/languages';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { pad, updatePAD, isHighContrast, toggleHighContrast, speak, t } = useAbility();
  const [showQR, setShowQR] = useState(false);
  const [langQuery, setLangQuery] = useState('');

  const filteredLangs = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langQuery.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(langQuery.toLowerCase()) || 
    l.region.toLowerCase().includes(langQuery.toLowerCase())
  ).slice(0, 30);

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
              <h2 className="text-4xl font-black text-ableTeal italic uppercase tracking-tighter">{t("Accessibility DNA")}</h2>
              <button 
                onClick={() => setShowQR(true)}
                className="bg-ableRed text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow active:scale-95 transition-all flex items-center gap-2"
              >
                <span>🆘</span> {t("OPEN QR")}
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
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{t("Visual Experience")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={toggleHighContrast}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${isHighContrast ? 'border-ableTeal bg-ableTeal text-ableBlack' : 'border-white/10 bg-white/5 text-white'}`}
                >
                  <span className="text-3xl">🌓</span>
                  <span className="font-black uppercase text-sm">{t("High Contrast")}</span>
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
                  <span className="font-black uppercase text-[10px]">{t("Text Size")}: {t(pad.fontSize || 'standard')}</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{t("Vision Need")}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[VisionNeed.Standard, VisionNeed.LowVision, VisionNeed.Blind].map(need => (
                    <button
                      key={need}
                      onClick={() => updatePAD({ vision: need })}
                      className={`py-3 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${pad.vision === need ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                    >
                      {t(need)}
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

            {/* Real-Time Language & Translation (1,000+ Languages) */}
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{t("Real-Time Translation")}</h3>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t("1,050+ Languages Active")}
                </span>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    placeholder={t("Search 1,000+ languages & dialects (e.g., Navajo, Welsh)") + "..."}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-3 px-4 pl-10 text-xs font-black text-white placeholder-white/20 outline-none focus:border-ableTeal transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-sm">🔍</span>
                  </div>
                  {langQuery && (
                    <button 
                      onClick={() => setLangQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="bg-white/5 border-2 border-white/10 rounded-2xl max-h-64 overflow-y-auto no-scrollbar divide-y divide-white/10">
                  {filteredLangs.length > 0 ? (
                    filteredLangs.map(lang => {
                      const isSelected = pad.primaryLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            updatePAD({ primaryLanguage: lang.code });
                            speak(`System translated and adapted to ${lang.name} in real-time.`);
                          }}
                          className={`w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all outline-none ${isSelected ? 'bg-ableTeal/20 border-l-4 border-ableTeal' : ''}`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{lang.name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
                                {lang.region}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-white/60">{lang.nativeName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-white/30">{lang.code.toUpperCase()}</span>
                            {isSelected ? (
                              <span className="text-ableTeal font-black text-xs">✓ Selected</span>
                            ) : (
                              <span className="text-white/20 text-xs font-all uppercase tracking-wider text-[10px]">Tap</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <span className="text-2xl block">🌐</span>
                      <p className="text-xs font-black text-white/40 uppercase">No matching languages found</p>
                      <p className="text-[10px] text-white/20 font-medium">Try typing standard languages like Spanish, Hindi, or Arabic.</p>
                    </div>
                  )}
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
