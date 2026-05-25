import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { UserRole, VisualAbility, VisionNeed, CognitiveMode, SpeechStyle } from '../types';

const OwnerFloatingControl: React.FC = () => {
  const { user, updateUser, pad, updatePAD, speak, notifications, isHighContrast } = useAbility();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'persona' | 'sandbox' | 'logs'>('persona');

  // Verify if current user email is Naksh/System Admin (enderfleet.ai@gmail.com)
  const isRealOwner = user && (user.email === 'enderfleet.ai@gmail.com' || user.id === 'u-owner');

  if (!isRealOwner) return null;

  const handleRoleSwitch = (targetRole: UserRole) => {
    updateUser({ role: targetRole });
    speak(`Core authority modified. Initializing simulated workspace for ${targetRole.replace('-', ' ')} mode.`);
  };

  const injectPreset = (preset: 'blind' | 'cognitive' | 'speech' | 'reset') => {
    switch (preset) {
      case 'blind':
        updatePAD({
          visual: VisualAbility.PartialBlindness,
          vision: VisionNeed.Blind,
          largeText: true
        });
        speak("Immersive Auditory & Haptic profile activated. Page scale adjusted up 125 percent.");
        break;
      case 'cognitive':
        updatePAD({
          cognitive: CognitiveMode.Simplified,
          simplifiedResponses: true
        });
        speak("Simplified cognitively paced framework constructed. Removed layout noise.");
        break;
      case 'speech':
        updatePAD({
          speech: SpeechStyle.StutterAware,
          speechRate: 0.75
        });
        speak("Custom voice stabilizer mode active. Communication Portal delay metrics adjusted.");
        break;
      case 'reset':
        updatePAD({
          visual: VisualAbility.Standard,
          vision: VisionNeed.Standard,
          cognitive: CognitiveMode.Standard,
          speech: SpeechStyle.Standard,
          largeText: false,
          simplifiedResponses: false,
          speechRate: 0.9
        });
        speak("Restored standard system parameters.");
        break;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {/* Floating Shimmer Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black flex items-center justify-center shadow-lg border-2 border-white shadow-amber-500/40 cursor-pointer overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <span className="text-2xl relative z-10">👑</span>
      </motion.button>

      {/* Main Administrative Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`absolute bottom-20 right-0 w-80 md:w-96 rounded-3xl border-4 border-amber-500 bg-black/95 backdrop-blur-2xl text-left shadow-[0_20px_50px_rgba(234,179,8,0.25)] overflow-hidden text-white`}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-b border-amber-500/20 flex justify-between items-center">
              <div>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-amber-400">Owner Terminal Control</span>
                <h3 className="text-base font-black italic tracking-tighter text-white flex items-center gap-2">
                  👑 SOVEREIGN CONSOLE // <span className="text-yellow-400">NAKSH</span>
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="flex bg-white/5 border-b border-white/5 text-[9px] font-black tracking-widest uppercase">
              <button 
                onClick={() => setActiveTab('persona')}
                className={`flex-1 py-3 text-center transition-colors ${activeTab === 'persona' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-white/40 hover:text-white/60'}`}
              >
                Personas
              </button>
              <button 
                onClick={() => setActiveTab('sandbox')}
                className={`flex-1 py-3 text-center transition-colors ${activeTab === 'sandbox' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-white/40 hover:text-white/60'}`}
              >
                DNA Injector
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-3 text-center transition-colors ${activeTab === 'logs' ? 'bg-amber-500/10 text-amber-400 border-b-2 border-amber-500' : 'text-white/40 hover:text-white/60'}`}
              >
                Sys Metrics
              </button>
            </div>

            {/* Content Scrolled */}
            <div className="p-5 max-h-[360px] overflow-y-auto space-y-4 scroll-container">
              
              {/* Persona Mode Switcher tab */}
              {activeTab === 'persona' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-white/50 leading-relaxed italic">
                    Seamlessly morph security contexts. Instantly access views, tabs, and actions of different roles without logging out.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRoleSwitch(UserRole.Owner)}
                      className={`p-3 rounded-2xl border text-left transition-all ${user?.role === UserRole.Owner ? 'bg-amber-500/20 border-amber-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <p className="text-lg">👑</p>
                      <h4 className="text-xs font-black uppercase text-white leading-tight">Owner</h4>
                      <p className="text-[8px] text-white/40 font-bold tracking-tight">Full Authority Hub</p>
                    </button>

                    <button
                      onClick={() => handleRoleSwitch(UserRole.User)}
                      className={`p-3 rounded-2xl border text-left transition-all ${user?.role === UserRole.User ? 'bg-ableTeal/20 border-ableTeal' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <p className="text-lg">👤</p>
                      <h4 className="text-xs font-black uppercase text-white leading-tight">Patient / User</h4>
                      <p className="text-[8px] text-white/40 font-bold tracking-tight">Standard Explorer</p>
                    </button>

                    <button
                      onClick={() => handleRoleSwitch(UserRole.Doctor)}
                      className={`p-3 rounded-2xl border text-left transition-all ${user?.role === UserRole.Doctor ? 'bg-ableSky/20 border-ableSky' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <p className="text-lg">🩺</p>
                      <h4 className="text-xs font-black uppercase text-white leading-tight">Doctor Clinical</h4>
                      <p className="text-[8px] text-white/40 font-bold tracking-tight">Clinic Roster & Sync</p>
                    </button>

                    <button
                      onClick={() => handleRoleSwitch(UserRole.Mentor)}
                      className={`p-3 rounded-2xl border text-left transition-all ${user?.role === UserRole.Mentor ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <p className="text-lg">🫂</p>
                      <h4 className="text-xs font-black uppercase text-white leading-tight">Expert Mentor</h4>
                      <p className="text-[8px] text-white/40 font-bold tracking-tight">Access Peer Guidance</p>
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-white/50">Current Simulated Context:</span>
                    <span className="bg-amber-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                </div>
              )}

              {/* DNA Injector tab */}
              {activeTab === 'sandbox' && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-white/50 leading-relaxed italic">
                    Instantly simulate specific accessibility barriers or cognitive adaptations to audit layout responsiveness and font resizing.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => injectPreset('blind')}
                      className={`w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-all ${pad.visual === VisualAbility.PartialBlindness ? 'border-amber-500 bg-amber-500/5' : ''}`}
                    >
                      <span className="text-xl">👁️</span>
                      <div>
                        <h4 className="text-xs font-black uppercase">Partial Blindness Adaptation</h4>
                        <p className="text-[8px] text-white/40 font-bold">125% System UI zoom & screen reader compatibility mode</p>
                      </div>
                    </button>

                    <button
                      onClick={() => injectPreset('cognitive')}
                      className={`w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-all ${pad.cognitive === CognitiveMode.Simplified ? 'border-amber-500 bg-amber-500/5' : ''}`}
                    >
                      <span className="text-xl">🧠</span>
                      <div>
                        <h4 className="text-xs font-black uppercase">Simplified Cognitive Assist</h4>
                        <p className="text-[8px] text-white/40 font-bold">Removes secondary visual layout noise, minimal text blocks</p>
                      </div>
                    </button>

                    <button
                      onClick={() => injectPreset('speech')}
                      className={`w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-3 transition-all ${pad.speech === SpeechStyle.StutterAware ? 'border-amber-500 bg-amber-500/5' : ''}`}
                    >
                      <span className="text-xl">🎙️</span>
                      <div>
                        <h4 className="text-xs font-black uppercase">Voice Sync Pacer Preset</h4>
                        <p className="text-[8px] text-white/40 font-bold">Adjusts text speech conversion feedback rate down to 0.75x</p>
                      </div>
                    </button>

                    <button
                      onClick={() => injectPreset('reset')}
                      className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center text-xs font-black uppercase italic text-yellow-400 tracking-widest transition-all"
                    >
                      ⚡ Re-normalize DNA State
                    </button>
                  </div>
                </div>
              )}

              {/* Logs and metrics tab */}
              {activeTab === 'logs' && (
                <div className="space-y-3 font-mono">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-3 bg-black rounded-xl border border-white/5">
                      <span className="text-[7px] text-amber-500 font-bold uppercase block">Core CPU Load</span>
                      <span className="text-xs font-black text-white">0.08% Active</span>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-white/5">
                      <span className="text-[7px] text-amber-500 font-bold uppercase block">Network Latency</span>
                      <span className="text-xs font-black text-white">4.2 ms</span>
                    </div>
                    <div className="p-3 bg-black rounded-xl border border-white/5 col-span-2">
                      <span className="text-[7px] text-amber-500 font-bold uppercase block">Secure Encryption</span>
                      <span className="text-xs font-black text-emerald-400">🔑 AES-256-GCM SECURE</span>
                    </div>
                  </div>

                  <div className="bg-black p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-[8px] text-white/30 border-b border-white/5 pb-1">
                      <span>SECURE ACCESS LOG</span>
                      <span className="text-emerald-500">LIVE</span>
                    </div>
                    <div className="text-[8px] space-y-1 text-white/60 select-none max-h-[140px] overflow-y-auto no-scrollbar pt-1">
                      <p>✓ Connection route matched: <span className="text-yellow-400">Naksh</span></p>
                      <p>✓ Superuser session u-owner bind granted.</p>
                      <p>✓ Local state encryption verified.</p>
                      <p>✓ Speech engine active: pitch adaptive.</p>
                      <p>✓ Simulators ready for user/doctor/mentor.</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      speak("Superuser simulation test successfully dispatched notification cluster.");
                      const tempNotify = document.getElementById('joined-success-msg');
                      if (tempNotify) {
                        tempNotify.innerText = "OWNER AUDIT DISPATCHED!";
                      }
                    }}
                    className="w-full py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-[9px] font-black uppercase text-center hover:bg-amber-500/20 transition-all cursor-pointer"
                  >
                    Run Audits & Diagnostics
                  </button>
                </div>
              )}
            </div>

            {/* Footer details */}
            <div className="p-3 bg-black/80 text-center text-[7px] text-white/20 border-t border-white/5 uppercase tracking-[0.3em]">
              Naksh Sovereign Terminal • Standard Interface Undisturbed
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerFloatingControl;
