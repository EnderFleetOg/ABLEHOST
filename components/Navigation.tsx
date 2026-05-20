
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { UserRole, CognitiveMode } from '../types';
import Logo from './Logo';
import AccessibilityModal from './AccessibilityModal';
import ProfileModal from './ProfileModal';
import NotificationCenter from './NotificationCenter';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEmergency: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onEmergency }) => {
  const { toggleHighContrast, isHighContrast, speak, logout, user, searchQuery, setSearchQuery, notifications, pad, updatePAD } = useAbility();
  const [isListening, setIsListening] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleCognitiveMode = () => {
    const newMode = pad.cognitive === CognitiveMode.Simplified ? CognitiveMode.Standard : CognitiveMode.Simplified;
    updatePAD({ cognitive: newMode });
    speak(newMode === CognitiveMode.Simplified ? "Simplified navigation active." : "Standard navigation active.");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleTabs = useMemo(() => {
    switch (user?.role) {
      case UserRole.Specialist:
        return [
          { id: 'dashboard', label: 'HUB', icon: '🏥' },
          { id: 'patients', label: 'PATIENTS', icon: '📋' },
          { id: 'requests', label: 'REQUESTS', icon: '📩' }
        ];
      case UserRole.Mentor:
        return [
          { id: 'dashboard', label: 'HUB', icon: '🤝' },
          { id: 'mentees', label: 'MENTEES', icon: '👥' },
          { id: 'sync', label: 'SYNC', icon: '🧬' }
        ];
      default:
        return [
          { id: 'dashboard', label: 'HOME', icon: '🏠' },
          { id: 'vision', label: 'VISION', icon: '👁️' },
          { id: 'voice', label: 'COMM', icon: '🎙️' },
          { id: 'explorer', label: 'EXPLORE', icon: '🗺️' },
          { id: 'market', label: 'SHOP', icon: '🛒' },
          { id: 'career', label: 'GROWTH', icon: '📈' },
          { id: 'dna', label: 'DNA', icon: '🧬' }
        ];
    }
  }, [user?.role]);

  const handleVoiceCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    const tabMatch = roleTabs.find(t => 
      cmd.includes(`go to ${t.label.toLowerCase()}`) || 
      cmd.includes(`open ${t.label.toLowerCase()}`) ||
      (cmd.includes(t.label.toLowerCase()) && cmd.split(' ').length < 3)
    );
    
    if (tabMatch) {
      setActiveTab(tabMatch.id);
      speak(`Opening ${tabMatch.label}`);
    } else if (cmd.includes('emergency') || cmd.includes('sos')) {
      onEmergency();
    } else if (cmd.includes('logout')) {
      logout();
    } else if (cmd.includes('settings') || cmd.includes('accessibility')) {
      setIsAccessibilityOpen(true);
    } else if (cmd.includes('profile')) {
      setIsProfileOpen(true);
    }
  }, [roleTabs, setActiveTab, speak, onEmergency, logout]);

  const [recognition, setRecognition] = useState<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      try { recognition?.start(); } catch (e) {}
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.onresult = (e: any) => handleVoiceCommand(e.results[e.results.length - 1][0].transcript);
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    setRecognition(rec);
    try { rec.start(); } catch (e) {}
    return () => rec.stop();
  }, [handleVoiceCommand]);

  const themeColor = useMemo(() => {
    if (user?.role === UserRole.Specialist) return 'border-ableSky text-ableSky';
    if (user?.role === UserRole.Mentor) return 'border-emerald-500 text-emerald-500';
    return 'border-[var(--able-primary)] text-[var(--able-primary)]';
  }, [user?.role]);

  return (
    <>
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[60] h-14 md:h-16 flex justify-between items-center px-4 md:px-8 bg-ableBlack/90 backdrop-blur-xl border-b-2 ${themeColor.split(' ')[0]} shadow-2xl transition-colors duration-500`}
      >
        <div className="flex items-center space-x-2 md:space-x-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-glow p-1"
          >
            <Logo />
          </motion.div>
          <div className="hidden lg:flex flex-col">
            <span className={`text-xl md:text-2xl font-black tracking-tighter leading-none italic uppercase transition-colors duration-500 ${themeColor.split(' ')[1]}`}>ABLE</span>
            <span className="text-[6px] font-black text-white/30 tracking-widest uppercase">{user?.role.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="flex-1 max-w-[120px] sm:max-w-xs mx-1 md:mx-4 relative group flex items-center gap-1 md:gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
              <svg className={`h-3 w-3 md:h-4 md:w-4 text-white/20 transition-colors ${user?.role === UserRole.Specialist ? 'group-focus-within:text-ableSky' : 'group-focus-within:text-[var(--able-primary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={`w-full bg-white/5 border border-white/10 rounded-lg md:rounded-xl py-1.5 md:py-2 pl-7 md:pl-10 pr-2 md:pr-3 text-[10px] md:text-xs font-black text-white placeholder-white/20 outline-none transition-all ${user?.role === UserRole.Specialist ? 'focus:border-ableSky' : 'focus:border-[var(--able-primary)]'} focus:bg-white/10`}
            />
          </div>
          <button 
            onClick={toggleListening}
            className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border transition-all flex items-center justify-center relative btn-dna ${isListening ? 'bg-ableRed border-white text-white shadow-glow' : 'bg-white/5 border-white/10 text-white/20 hover:text-white'}`}
          >
            {isListening && (
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-white rounded-lg md:rounded-xl"
              />
            )}
            <span className="text-xs md:text-sm relative z-10">🎙️</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10 group">
            <span className={`text-[6px] font-black tracking-widest uppercase transition-colors ${pad.cognitive === CognitiveMode.Simplified ? 'text-[var(--able-primary)]' : 'text-white/20'}`}>SIM</span>
            <button 
              onClick={toggleCognitiveMode}
              className={`w-8 h-4 rounded-full p-0.5 transition-all ${pad.cognitive === CognitiveMode.Simplified ? 'bg-[var(--able-primary)]' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: pad.cognitive === CognitiveMode.Simplified ? 16 : 0 }}
                className="w-3 h-3 bg-white rounded-full shadow-lg"
              />
            </button>
            <span className={`text-[6px] font-black tracking-widest uppercase transition-colors ${pad.cognitive !== CognitiveMode.Simplified ? 'text-[var(--able-primary)]' : 'text-white/20'}`}>STD</span>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 btn-dna"
          >
            <span className="text-xs md:text-sm">🔔</span>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-ableRed text-white rounded-full text-[6px] font-black flex items-center justify-center border border-ableBlack animate-bounce"
              >
                {unreadCount}
              </motion.span>
            )}
          </button>
          <button 
            onClick={() => setIsAccessibilityOpen(true)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 btn-dna"
          >
            <span className="text-xs md:text-sm">⚙️</span>
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="hidden sm:flex w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 btn-dna"
          >
            <span className="text-xs md:text-sm">👤</span>
          </button>
          {user?.role === UserRole.User && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEmergency} 
              className="bg-ableRed text-white h-8 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl font-black shadow-huge text-[10px] md:text-xs border border-white/20 btn-dna"
            >
              SOS
            </motion.button>
          )}
        </div>
      </motion.div>

      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-[60] h-16 md:h-20 flex items-center justify-center px-2 md:px-4 bg-ableBlack/90 backdrop-blur-xl border-t-2 md:border-t-4 ${themeColor.split(' ')[0]} shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-colors duration-500`}
      >
        <div className="w-full max-w-4xl flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5 md:py-1">
          {roleTabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-all flex-1 py-1.5 md:py-2 px-1 rounded-xl md:rounded-2xl min-w-[50px] md:min-w-[65px] ${
                activeTab === tab.id 
                  ? 'text-ableBlack' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-tab"
                  className={`absolute inset-0 ${user?.role === UserRole.Specialist ? 'bg-ableSky' : user?.role === UserRole.Mentor ? 'bg-emerald-500' : 'bg-[var(--able-primary)]'} rounded-xl md:rounded-2xl shadow-glow border-2 border-white`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="text-sm md:text-lg relative z-10">{tab.icon}</span>
              <span className="text-[6px] md:text-[7px] font-black tracking-widest uppercase relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <AccessibilityModal isOpen={isAccessibilityOpen} onClose={() => setIsAccessibilityOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};

export default Navigation;
