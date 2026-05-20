
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import SignLanguageAvatar from './SignLanguageAvatar';
import EmergencyQR from './EmergencyQR';

interface EmergencySystemProps {
  onClose: () => void;
}

const EmergencySystem: React.FC<EmergencySystemProps> = ({ onClose }) => {
  const { pad, speak } = useAbility();
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [showHelperView, setShowHelperView] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [status, setStatus] = useState('Broadcasting SOS...');
  const [alertedContacts, setAlertedContacts] = useState<Set<number>>(new Set());
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'silent' | 'contact' | null>(null);
  const [targetContactIdx, setTargetContactIdx] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error(err);
          setStatus('SOS: Location via Network Only');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const autoBroadcast = useCallback(async () => {
    setIsBroadcasting(true);
    setStatus('STEALTH BROADCAST INITIATED...');
    
    for (let i = 0; i < pad.emergencyContacts.length; i++) {
      const contact = pad.emergencyContacts[i];
      setAlertedContacts(prev => new Set(prev).add(i));
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Sent Location (${coords?.lat}, ${coords?.lng}) and PAD (${pad.visual}, ${pad.speech}) to ${contact.name}`);
    }
    
    setStatus('ALL CONTACTS NOTIFIED. GPS LIVE.');
    setIsBroadcasting(false);
  }, [pad.emergencyContacts, pad.visual, pad.speech, coords]);

  const handleConfirmAction = () => {
    setShowConfirm(false);
    if (confirmType === 'silent') {
      setIsSilent(true);
      speak("Silent SOS activated. Automatically sharing location and Ability DNA with your circle.");
      autoBroadcast();
    } else if (confirmType === 'contact' && targetContactIdx !== null) {
      const idx = targetContactIdx;
      const contact = pad.emergencyContacts[idx];
      setAlertedContacts(prev => new Set(prev).add(idx));
      speak(`Alerting ${contact.name}. Broadcast sync active.`);
    }
    setConfirmType(null);
    setTargetContactIdx(null);
  };

  const handleCancelAction = () => {
    setShowConfirm(false);
    setConfirmType(null);
    setTargetContactIdx(null);
  };

  const handleSilentToggle = () => {
    const newSilentState = !isSilent;
    if (newSilentState) {
      setConfirmType('silent');
      setShowConfirm(true);
    } else {
      setIsSilent(false);
      speak("Silent mode deactivated.");
      setAlertedContacts(new Set());
      setStatus('SOS STANDBY');
    }
  };

  const initiateCall = (idx: number) => {
    if (alertedContacts.has(idx)) return;
    setConfirmType('contact');
    setTargetContactIdx(idx);
    setShowConfirm(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] transition-all duration-700 flex items-center justify-center p-0 sm:p-4 overflow-hidden ${
        isSilent ? 'bg-black' : 'bg-ableRed/98 backdrop-blur-2xl'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full h-full sm:h-auto sm:max-w-6xl sm:rounded-huge shadow-2xl border-0 sm:border-8 flex flex-col relative transition-all duration-500 overflow-hidden ${
          isSilent ? 'bg-black border-white/5' : 'bg-ableBlack border-white'
        }`}
      >
        {isSilent && (
          <div className="absolute inset-0 bg-black z-0 flex flex-col items-center justify-center p-10 opacity-10 pointer-events-none">
             <div className="text-[12vw] font-black uppercase tracking-[1em] text-white/10 whitespace-nowrap rotate-12 animate-pulse">SOS ACTIVE</div>
             <div className="text-[12vw] font-black uppercase tracking-[1em] text-white/10 whitespace-nowrap rotate-12 mt-20 animate-pulse delay-700">GPS SYNCED</div>
          </div>
        )}

        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[250] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 sm:p-12 text-center"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-ableBlack border-4 border-ableRed/50 p-8 sm:p-12 rounded-[2.5rem] max-w-lg w-full space-y-8 shadow-2xl relative"
              >
                <div className="w-20 h-20 bg-ableRed/20 text-ableRed rounded-full flex items-center justify-center text-4xl font-black mx-auto animate-pulse border-2 border-ableRed">
                  ⚠️
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                    {confirmType === 'silent' ? 'Confirm Stealth SOS?' : 'Confirm Contact Alert?'}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-white/70 uppercase tracking-wide">
                    {confirmType === 'silent' 
                      ? 'Are you sure you want to activate Silent SOS? This will immediately broadcast your real-time location and Ability DNA to your entire circle in stealth mode.'
                      : `Are you sure you want to alert ${targetContactIdx !== null ? pad.emergencyContacts[targetContactIdx]?.name : 'your contact'} immediately?`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleCancelAction}
                    className="py-4 bg-white/5 border-2 border-white/10 hover:border-white/20 hover:bg-white/10 text-white rounded-2xl font-black text-lg transition-all active:scale-95"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={handleConfirmAction}
                    className="py-4 bg-ableRed text-white rounded-2xl font-black text-lg shadow-huge active:scale-95 hover:bg-ableRed/80 transition-all border-2 border-white"
                  >
                    CONFIRM
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 sm:p-16 relative z-10">
          <AnimatePresence mode="wait">
            {showHelperView ? (
              <motion.div 
                key="helper"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-white/10 pb-8 gap-6">
                  <div className="space-y-2">
                    <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Helper Guide</h2>
                    <p className="text-xl font-bold text-white/60">Interaction protocol for this user.</p>
                  </div>
                  <button onClick={() => setShowHelperView(false)} className="bg-white text-ableBlack px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-ableTeal transition-all active:scale-95">BACK TO SOS</button>
                </header>

                <AnimatePresence>
                  {showQR && (
                    <motion.div 
                      key="qr-modal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[300] bg-ableBlack/90 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                      <EmergencyQR onClose={() => setShowQR(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8 bg-white p-10 rounded-huge text-ableBlack shadow-2xl">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Ability Profile</h3>
                    <div className="space-y-6">
                      <div className="border-l-8 border-ableSky pl-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Speech Pattern</p>
                        <p className="text-3xl font-black uppercase italic">{pad.speech.replace('-', ' ')}</p>
                      </div>
                      <div className="border-l-8 border-ablePurple pl-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vision Level</p>
                        <p className="text-3xl font-black uppercase italic">{pad.visual.replace('-', ' ')}</p>
                      </div>
                      <div className="bg-ableRed/5 p-6 rounded-2xl border-2 border-ableRed/20">
                        <p className="font-bold text-lg leading-snug italic text-ableRed">"I am in distress. My medical and contact info has been sent to my family."</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white/5 rounded-huge p-8">
                    <div className="w-full max-w-sm">
                      <SignLanguageAvatar message="Emergency detected. Helping is on the way." active={true} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="sos"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col justify-between space-y-12"
              >
                <header className="flex items-center space-x-8">
                  <div className={`w-24 h-24 rounded-huge flex items-center justify-center text-6xl font-black animate-pulse shadow-huge ${isSilent ? 'bg-white/5 text-white/10' : 'bg-white text-ableRed'}`}>!</div>
                  <div className="space-y-1">
                    <h2 className={`text-[10px] font-black uppercase tracking-[0.5em] ${isSilent ? 'text-white/20' : 'text-ableTeal'}`}>Emergency Hub</h2>
                    <p className={`text-5xl font-black tracking-tighter ${isSilent ? 'text-white/30' : 'text-white'}`}>{status}</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="p-8 bg-white/5 border-4 border-white/10 rounded-huge space-y-6">
                      <h3 className="text-xl font-black uppercase text-ableTeal italic tracking-tighter">Circle Alert List</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {pad.emergencyContacts.map((contact, i) => (
                          <button 
                            key={i}
                            onClick={() => initiateCall(i)}
                            className={`w-full p-6 rounded-3xl border-4 flex justify-between items-center transition-all ${alertedContacts.has(i) ? 'bg-emerald-500 border-white shadow-glow' : 'bg-white/5 border-white/10 hover:border-white/40'}`}
                          >
                            <div className="text-left">
                              <p className="font-black text-2xl">{contact.name}</p>
                              <p className="text-sm font-bold opacity-40">{alertedContacts.has(i) ? 'DATA TRANSMITTED' : 'TAP TO ALERT'}</p>
                            </div>
                            <span className={`text-4xl ${alertedContacts.has(i) ? 'animate-bounce' : ''}`}>
                              {alertedContacts.has(i) ? '🛰️' : '📞'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                        onClick={handleSilentToggle} 
                        className={`py-10 rounded-huge font-black text-2xl border-4 shadow-huge transition-all active:scale-95 ${isSilent ? 'bg-white text-ableBlack border-white' : 'bg-black/40 border-white/10 text-white hover:border-white/30'}`}
                      >
                        {isSilent ? 'DEACTIVATE' : 'STEALTH SOS'}
                      </button>
                      <button 
                        onClick={() => setShowQR(true)} 
                        className="py-10 bg-white text-ableBlack rounded-huge font-black text-2xl shadow-huge border-4 border-ableTeal active:scale-95 transition-all hover:bg-ableTeal"
                      >
                        EMERGENCY QR
                      </button>
                      <button 
                        onClick={() => setShowHelperView(true)} 
                        className="py-10 bg-ableTeal text-ableBlack rounded-huge font-black text-2xl shadow-huge border-4 border-white active:scale-95 transition-all hover:brightness-110"
                      >
                        HELPER INFO
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end space-y-8">
                     <div className="p-8 rounded-huge border-4 border-white/20 bg-white/5 relative overflow-hidden">
                        {isBroadcasting && (
                          <div className="absolute inset-0 bg-emerald-500/10 animate-shimmer"></div>
                        )}
                        <p className="text-[10px] font-black uppercase text-ablePurple tracking-widest mb-4">Location Precision</p>
                        <p className="text-4xl font-black text-white">{coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Syncing GPS...'}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <div className={`w-3 h-3 bg-emerald-500 rounded-full ${isBroadcasting ? 'animate-ping' : ''}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {isBroadcasting ? 'TRANSMITTING DNA DATA...' : 'DNA BROADCAST READY'}
                          </span>
                        </div>
                     </div>
                     
                     <button onClick={onClose} className="w-full py-10 bg-white text-ableRed rounded-huge font-black text-5xl shadow-huge hover:bg-ableTeal hover:text-ableBlack transition-all border-8 border-white active:scale-95">
                      RESOLVE
                     </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmergencySystem;
