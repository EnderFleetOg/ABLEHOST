
import React, { useState, useEffect } from 'react';
import { useAbility } from '../context/AbilityContext';
import { HearingNeed } from '../types';

interface SignLanguageAvatarProps {
  message?: string;
  active?: boolean;
}

const SignLanguageAvatar: React.FC<SignLanguageAvatarProps> = ({ message, active = false }) => {
  const { pad } = useAbility();
  const [isVisible, setIsVisible] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(0);

  useEffect(() => {
    if (pad.signLanguagePreferred || pad.hearing === HearingNeed.Deaf) {
      setIsVisible(true);
    }
  }, [pad]);

  // Cycle gestures when active to simulate signing
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCurrentGesture(prev => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  if (!isVisible && !active) return null;

  const getGesturePath = () => {
    switch (currentGesture) {
      case 0: return "M30 60 Q50 40 70 60 M40 70 Q50 85 60 70"; // Wave-like
      case 1: return "M20 50 Q50 70 80 50 M45 40 Q55 40 50 60"; // Pointing
      case 2: return "M30 40 Q50 20 70 40 M50 50 L50 90"; // High gestures
      default: return "M25 65 Q50 75 75 65 M40 50 Q50 40 60 50"; // Close signing
    }
  };

  return (
    <div className={`relative transition-all duration-500 transform ${active ? 'scale-110' : 'scale-100'}`}>
      <div className="bg-ableBlack rounded-[2.5rem] shadow-2xl border-4 border-ablePurple/40 overflow-hidden w-full aspect-[3/4] flex flex-col relative group">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-all hover:bg-ableRed hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 bg-gradient-to-b from-ablePurple/10 to-transparent flex items-center justify-center overflow-hidden relative">
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-ablePurple/10 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}></div>
          
          <svg viewBox="0 0 100 120" className="w-full h-full p-4 transition-transform duration-300">
            {/* Head */}
            <circle cx="50" cy="30" r="18" fill="currentColor" className="text-ablePurple" />
            
            {/* Body */}
            <path d="M50 48 Q50 110 50 110" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-ablePurple/80" />
            
            {/* Arms/Hands that animate */}
            <path 
              d={active ? getGesturePath() : "M30 65 Q50 75 70 65"} 
              stroke="currentColor" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round" 
              className={`text-ableTeal transition-all duration-300 ${active ? 'animate-pulse' : ''}`}
            />
            
            {/* Decorative Pulse Ring */}
            {active && (
               <circle cx="50" cy="30" r="25" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-ableTeal/30 animate-ping" />
            )}
          </svg>

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-lg ${active ? 'bg-ableTeal text-ableBlack' : 'bg-white/10 text-white/40'}`}>
              {active ? 'Signing Live' : 'Avatar Standby'}
            </span>
          </div>
        </div>
        
        <div className="h-24 bg-black/40 p-4 flex flex-col items-center justify-center text-center border-t border-white/10">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Translation Stream</p>
          <p className="text-xs leading-tight text-white/80 font-bold overflow-hidden text-ellipsis line-clamp-2">
            {message ? message : "Awaiting communication input..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageAvatar;