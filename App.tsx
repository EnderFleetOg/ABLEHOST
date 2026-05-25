import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AbilityProvider, useAbility } from './context/AbilityContext';
import { UserRole } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PADSettings from './components/PADForm'; 
import AbilityAnalyzer from './components/AbilityAnalyzer'; 
import CommHub from './components/SocialHub'; 
import InfoPage from './components/InfoPage';
import EmergencySystem from './components/EmergencySystem';
import ReportIssue from './components/ReportIssue';
import Shop from './components/Shop';
import AuthFlow from './components/AuthFlow';
import Onboarding from './components/Onboarding';
import PredictiveAssistance from './components/PredictiveAssistance';
import { OwnerPortal } from './components/OwnerPortal';
import OwnerFloatingControl from './components/OwnerFloatingControl';

// Redesigned Doctor Portal Component
const DoctorPortal: React.FC<{ tab: string }> = ({ tab }) => {
  const { speak } = useAbility();
  const [patientEmail, setPatientEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSyncRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmail) return;
    speak(`Encrypted access request dispatched to patient ${patientEmail}. Connecting secure bridge.`);
    setSuccessMsg(`SYNC REQUEST DISPATCHED: Encrypted connection pending authorization from ${patientEmail}.`);
    setPatientEmail('');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  switch (tab) {
    case 'patients':
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-ableSky rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-ableSky italic uppercase tracking-tighter text-left">Clinical Patient Registry</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase text-left">Monitoring Synced Bio-Parameters</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Sarah Miller', id: 'P-9921', status: 'Stable', dna: 'Cognitive: Standard, Vision: Standard', lastSynced: 'Just Now', contact: 'sarah.m@client.able' },
              { name: 'James Chen', id: 'P-4402', status: 'High Focus', dna: 'Vision: Partial Blind, Speech: Pace-Sync', lastSynced: '2 Hours Ago', contact: 'james.c@client.able' }
            ].map((p, i) => (
              <motion.div 
                key={i} 
                className="bg-white/5 border-4 border-white/10 p-6 rounded-3xl space-y-4 group hover:border-ableSky transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black">{p.name}</h3>
                    <p className="text-[10px] text-white/40 font-bold">{p.contact}</p>
                  </div>
                  <span className="bg-ableSky text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase shadow-glow">{p.status}</span>
                </div>
                
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-white/20 font-black text-[8px] tracking-widest leading-none italic uppercase">SYNAPSE TRAITS</p>
                  <p className="text-white font-black text-sm italic">{p.dna}</p>
                  <span className="text-[8px] text-emerald-500 font-bold tracking-widest block uppercase">⚡ SYNC SECURED • {p.lastSynced}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-3 bg-ableSky text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-huge active:scale-95 transition-all" onClick={() => speak(`Opening medical database sync for ${p.name}`)}>View History</button>
                  <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10" onClick={() => speak(`Preparing schedule slot review for ${p.name}`)}>Schedule Check</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 'requests':
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-ableSky rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-ableSky italic uppercase tracking-tighter text-left">Secure DNA Access Terminal</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase text-left">Encrypted Synaptic Link Dispatcher</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border-2 border-white/10 p-8 rounded-3xl space-y-6 md:col-span-2 text-left">
              <h3 className="text-xl font-black text-white uppercase italic">Send secure invite</h3>
              <form onSubmit={handleSyncRequest} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="patient-contact" className="text-[8px] font-black text-white/40 tracking-[0.3em] uppercase block">PATIENT EMAIL ADDRESS</label>
                  <input 
                    id="patient-contact"
                    type="email" 
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="e.g. patrick@gmail.com"
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-5 py-3 text-base font-black text-white focus:border-ableSky outline-none transition-all"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-ableSky text-white rounded-xl font-black tracking-widest text-xs uppercase hover:bg-sky-400 border-2 border-white/10 transition-all">
                  DISPATCH SECURE TOKEN
                </button>
              </form>

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-500 font-bold text-xs">
                  {successMsg}
                </div>
              )}
            </div>

            <div className="bg-white/5 border-2 border-white/10 p-8 rounded-3xl flex flex-col justify-between text-left relative overflow-hidden">
              <div className="space-y-4">
                <span className="text-sm">🔑</span>
                <h4 className="text-sm font-black text-white uppercase">Encrypted Tunnel</h4>
                <p className="text-xs text-white/60 leading-relaxed font-bold">
                  All sync links use client-to-client encryption. ABLE respects HIPAA guidelines, ensuring patient medical descriptors remain sandboxed locally.
                </p>
              </div>
              <div className="text-[8px] font-black text-white/20 tracking-widest uppercase italic mt-6">
                SECURE ACCESS HUB • LIVE
              </div>
            </div>
          </div>
        </div>
      );
    default: return <Dashboard />;
  }
};

// Redesigned Mentor Portal Component
const MentorPortal: React.FC<{ tab: string }> = ({ tab }) => {
  const { speak } = useAbility();
  const [syncToken, setSyncToken] = useState('');
  const [joinedMsg, setJoinedMsg] = useState('');

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncToken) return;
    speak(`Sync token validated. Humanoid bridge formed with client. Accessibility DNA is online.`);
    setJoinedMsg(`BRIDGE ACTIVE: Mentorship workspace synced successfully using token "${syncToken.toUpperCase()}".`);
    setSyncToken('');
    setTimeout(() => setJoinedMsg(''), 6000);
  };

  switch (tab) {
    case 'mentees':
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-emerald-500 rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-emerald-500 italic uppercase tracking-tighter text-left">Mentorship Roster</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase text-left">Active guidance coordination systems</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border-4 border-white/10 p-6 rounded-3xl space-y-4 group hover:border-emerald-500 transition-all text-left">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👤</div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase">Alex Rivera</h3>
                  <span className="text-[8px] font-black text-emerald-500 tracking-widest uppercase">Visual Design Consultant</span>
                </div>
              </div>
              
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white/60 font-medium text-sm leading-relaxed italic">"I am navigating tools and high contrast settings perfectly. Let's practice design composition today!"</p>
                <div className="flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-widest">
                  <span>LAST ACTIVE: 1 hour ago</span>
                  <span className="text-emerald-500">DNA SYNCED 🤟</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-huge active:scale-95 transition-all" onClick={() => speak("Connecting to live visual design room.")}>Enter Guidance Room</button>
                <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10" onClick={() => speak("Reviewing historical notes.")}>📁</button>
              </div>
            </div>
          </div>
        </div>
      );
    case 'sync':
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-4 h-24 bg-emerald-500 rounded-full shadow-glow"></div>
            <div>
              <h2 className="text-3xl font-black text-emerald-500 italic uppercase tracking-tighter text-left">Synaptic Bridge Sync Link</h2>
              <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase text-left">Access patient config logs securely</p>
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-6 bg-white/5 border-2 border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-md text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px]"></div>
            <p className="text-base font-bold text-white/60 italic leading-snug">
              To establish a remote guidance sync stream, input the unique 6-digit sync token generated from your mentee's medical or personal profile portal.
            </p>
            
            <form onSubmit={handleSyncSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mentor-token" className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] italic">SYNC TOKEN</label>
                <input 
                  id="mentor-token"
                  type="text" 
                  value={syncToken}
                  onChange={(e) => setSyncToken(e.target.value)}
                  placeholder="e.g. ABLE-GUIDE-33" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-center text-emerald-500 uppercase outline-none focus:border-emerald-500 transition-all placeholder:text-white/5 shadow-inner" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm tracking-widest uppercase transition-all shadow-huge active:scale-95 border border-white/20"
              >
                ACTIVATE SYNAPSE CONNECTION
              </button>
            </form>

            {joinedMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-500 font-bold text-xs" id="joined-success-msg">
                {joinedMsg}
              </div>
            )}
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

  const isOwnerUser = user?.role === UserRole.Owner || user?.email === 'enderfleet.ai@gmail.com';

  const [onboarded, setOnboarded] = useState(() => {
    return isOwnerUser ? true : (localStorage.getItem('able_onboarded') === 'true');
  });

  if (!isLoggedIn) return <AuthFlow />;

  if (!onboarded && !isOwnerUser) {
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
    if (user?.role === UserRole.Owner) return <OwnerPortal tab={activeTab} />;
    if (user?.role === UserRole.Doctor) return <DoctorPortal tab={activeTab} />;
    if (user?.role === UserRole.Mentor) return <MentorPortal tab={activeTab} />;

    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} onEmergency={() => setShowEmergency(true)} />;
      case 'vision': return <AbilityAnalyzer />;
      case 'voice': return <CommHub />;
      case 'market': return <Shop />;
      case 'dna': return <PADSettings />;
      case 'info': return <InfoPage />;
      default: return <Dashboard setActiveTab={setActiveTab} onEmergency={() => setShowEmergency(true)} />;
    }
  };

  const portalThemeClass = () => {
    if (user?.role === UserRole.Owner) return 'selection:bg-amber-500 bg-ableBlack text-white';
    if (user?.role === UserRole.Doctor) return 'selection:bg-ableSky bg-ableBlack text-white';
    if (user?.role === UserRole.Mentor) return 'selection:bg-emerald-500 bg-ableBlack text-white';
    return 'selection:bg-ableTeal bg-ableBlack text-white';
  };

  const ambientGradientColor = () => {
    if (user?.role === UserRole.Owner) return 'bg-[radial-gradient(circle_at_50%_50%,_#F59E0B_0%,_transparent_70%)]';
    if (user?.role === UserRole.Doctor) return 'bg-[radial-gradient(circle_at_50%_50%,_#0EA5E9_0%,_transparent_70%)]';
    if (user?.role === UserRole.Mentor) return 'bg-[radial-gradient(circle_at_50%_50%,_#10B981_0%,_transparent_70%)]';
    return 'bg-[radial-gradient(circle_at_50%_50%,_#2DD4BF_0%,_transparent_70%)]';
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden relative ${portalThemeClass()}`}>
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
                 <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] ${user?.role === UserRole.Owner ? 'bg-amber-500 shadow-amber-500/50' : user?.role === UserRole.Doctor ? 'bg-ableSky shadow-ableSky/50' : user?.role === UserRole.Mentor ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-ableTeal shadow-ableTeal/50'}`}></div>
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
      <OwnerFloatingControl />

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
        <div className={`absolute inset-0 animate-pulse-slow ${ambientGradientColor()}`}></div>
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
