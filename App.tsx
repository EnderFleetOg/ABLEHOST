
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AbilityProvider, useAbility } from './context/AbilityContext';
import { UserRole } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PADSettings from './components/PADForm'; 
import VisionAI from './components/AICompanion'; 
import CommHub from './components/SocialHub'; 
import CareerHub from './components/CareerHub';
import MapExplorer from './components/MapExplorer';
import InfoPage from './components/InfoPage';
import EmergencySystem from './components/EmergencySystem';
import ReportIssue from './components/ReportIssue';
import Shop from './components/Shop';
import AuthFlow from './components/AuthFlow';
import Onboarding from './components/Onboarding';
import PredictiveAssistance from './components/PredictiveAssistance';

// Role-specific Portal Components
const SpecialistPortal: React.FC<{ tab: string }> = ({ tab }) => {
  const { speak } = useAbility();
  switch (tab) {
    case 'patients':
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-ableSky rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-ableSky italic uppercase tracking-tighter">Clinical Registry</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Monitoring Active Bio-Syncs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Sarah Miller', id: 'P-9921', status: 'Stable', dna: 'Cognitive: Simplified, Vision: Standard' },
              { name: 'James Chen', id: 'P-4402', status: 'High Focus', dna: 'Vision: Partial Blind, Speech: Pace-Sync' }
            ].map((p, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border-4 border-white/10 p-6 rounded-3xl space-y-4 group hover:border-ableSky transition-all"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">{p.name}</h3>
                  <span className="bg-ableSky text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-glow">{p.status}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 font-bold uppercase text-[8px] tracking-widest leading-none italic">ABILITY DNA CONFIG</p>
                  <p className="text-white/60 font-black text-sm italic">{p.dna}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-ableSky text-white rounded-xl font-black uppercase tracking-widest text-[8px] shadow-huge active:scale-95 transition-all" onClick={() => speak(`Opening bio-sync for ${p.name}`)}>Sync DNA</button>
                  <button className="flex-1 py-1.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[8px] hover:bg-white/10" onClick={() => speak(`Noting progress for ${p.name}`)}>Add Note</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 'requests':
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-ableSky rounded-full shadow-glow"></div>
            <h2 className="text-3xl font-black text-ableSky italic uppercase tracking-tighter">Access Requests</h2>
          </div>
          <div className="bg-white/5 border-2 border-white/10 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-ableSky/5 animate-pulse"></div>
            <span className="text-6xl opacity-20 relative z-10 drop-shadow-2xl">📥</span>
            <div className="space-y-1 relative z-10">
              <p className="text-xl font-black text-white italic">0 PENDING SYNC REQUESTS</p>
              <p className="text-[8px] font-black text-white/20 tracking-[0.5em] uppercase leading-none italic">Monitoring encrypted channels...</p>
            </div>
          </div>
        </div>
      );
    default: return <Dashboard />;
  }
};

const MentorPortal: React.FC<{ tab: string }> = ({ tab }) => {
  const { speak } = useAbility();
  switch (tab) {
    case 'mentees':
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-emerald-500 rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-emerald-500 italic uppercase tracking-tighter">Mentee Management</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Humanoid Connection Loop</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border-4 border-white/10 p-6 rounded-3xl space-y-4 group hover:border-emerald-500 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👤</div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black italic uppercase">Alex Rivera</h3>
                  <span className="text-[8px] font-black text-emerald-500 tracking-widest uppercase">Career Track: Visual Designer</span>
                </div>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white/60 font-medium text-sm leading-relaxed italic">"I'm feeling much more confident using the Vision AI for color contrast checks. Ready to explore layout next!"</p>
                <div className="flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-widest">
                  <span>LAST MESSAGE: 14:20</span>
                  <span className="text-emerald-500">DNA SYNCED 🤟</span>
                </div>
              </div>
              <button className="w-full py-2 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-huge active:scale-95 transition-all text-[10px]" onClick={() => speak("Initiating live coordination session.")}>Enter Guidance Room</button>
            </motion.div>
          </div>
        </div>
      );
    case 'sync':
      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-emerald-500 rounded-full shadow-glow"></div>
            <h2 className="text-3xl font-black text-emerald-500 italic uppercase tracking-tighter">DNA Sync Hub</h2>
          </div>
          <div className="max-w-xl mx-auto space-y-6 bg-white/5 border-2 border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]"></div>
            <p className="text-lg font-bold text-center text-white/60 italic leading-snug">To provide professional guidance, establish a secure link using the token provided by the mentee's medical portal.</p>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] ml-2 italic">SECURITY TOKEN</label>
              <input type="text" placeholder="ABLE-GUIDE-DNA" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-center text-emerald-500 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-white/5 shadow-inner" />
            </div>
            <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-huge active:scale-95 transition-all border-2 border-white/20 text-[12px]" onClick={() => speak("Token authenticated. Synaptic bridge formed.")}>ACTIVATE CONNECTION</button>
          </div>
        </div>
      );
    default: return <Dashboard />;
  }
};

const AppContent: React.FC = () => {
  const { isLoggedIn, user, updateUser, activeTab, setActiveTab, isOnline } = useAbility();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('able_onboarded') === 'true');

  if (!isLoggedIn) return <AuthFlow />;

  if (!onboarded) {
    return (
      <Onboarding 
        onComplete={(role) => {
          updateUser({ role });
          setOnboarded(true);
          localStorage.setItem('able_onboarded', 'true');
        }} 
      />
    );
  }

  const renderContent = () => {
    if (user?.role === UserRole.Specialist) return <SpecialistPortal tab={activeTab} />;
    if (user?.role === UserRole.Mentor) return <MentorPortal tab={activeTab} />;

    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} onEmergency={() => setShowEmergency(true)} />;
      case 'vision': return <VisionAI />;
      case 'voice': return <CommHub />;
      case 'explorer': return <MapExplorer />;
      case 'market': return <Shop />;
      case 'career': return <CareerHub />;
      case 'dna': return <PADSettings />;
      case 'info': return <InfoPage />;
      default: return <Dashboard setActiveTab={setActiveTab} onEmergency={() => setShowEmergency(true)} />;
    }
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col bg-ableBlack overflow-hidden relative ${user?.role === UserRole.Specialist ? 'selection:bg-ableSky' : user?.role === UserRole.Mentor ? 'selection:bg-emerald-500' : 'selection:bg-ableTeal'}`}>
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onEmergency={() => setShowEmergency(true)} 
      />
      
      <div className="flex-1 flex flex-col w-full overflow-hidden pt-20 md:pt-24 pb-28 md:pb-32">
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-container px-4 md:px-10">
          <div className="max-w-7xl mx-auto py-6 md:py-8">
            <header className="flex justify-between items-center mb-8 md:mb-12">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-3 md:gap-4 bg-white/5 px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg"
               >
                 <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] ${user?.role === UserRole.Specialist ? 'bg-ableSky shadow-ableSky/50' : user?.role === UserRole.Mentor ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-ableTeal shadow-ableTeal/50'}`}></div>
                 <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                   {user?.name} <span className="mx-1 opacity-20">//</span> {user?.role.replace('-', ' ')}
                 </span>
               </motion.div>
               <motion.button 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setShowReport(true)}
                 className="group relative px-4 md:px-6 py-2 md:py-3 overflow-hidden rounded-full border-2 border-white/20 text-white/40 font-black text-[8px] md:text-[10px] tracking-[0.2em] transition-all hover:border-ableRed hover:text-ableRed uppercase"
               >
                 REPORT FRICTION
               </motion.button>
            </header>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showEmergency && <EmergencySystem onClose={() => setShowEmergency(false)} />}
        {showReport && <ReportIssue onClose={() => setShowReport(false)} />}
      </AnimatePresence>

      <PredictiveAssistance />

      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[70]"
          >
            <div className="bg-ableRed px-4 py-1.5 rounded-full flex items-center gap-2 shadow-huge border border-white/20 animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Offline Mode Active</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03]">
        <div className={`absolute inset-0 animate-pulse-slow ${user?.role === UserRole.Specialist ? 'bg-[radial-gradient(circle_at_50%_50%,_#0EA5E9_0%,_transparent_70%)]' : user?.role === UserRole.Mentor ? 'bg-[radial-gradient(circle_at_50%_50%,_#10B981_0%,_transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_50%,_#2DD4BF_0%,_transparent_70%)]'}`}></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AbilityProvider>
      <AppContent />
    </AbilityProvider>
  );
};

export default App;
