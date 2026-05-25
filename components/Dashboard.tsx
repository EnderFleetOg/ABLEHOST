
import React from 'react';
import { useAbility } from '../context/AbilityContext';
import { UserRole } from '../types';
import TaskBoard from './TaskBoard';
import { motion } from 'motion/react';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  onEmergency?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onEmergency }) => {
  const { pad, speak, user, t } = useAbility();

  const [buttons, setButtons] = React.useState(() => {
    const saved = localStorage.getItem('able_custom_dashboard_buttons_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed.map((b: any) => {
            if (b.tab === 'career' || b.tab === 'dna') {
              return {
                ...b,
                id: 'skin',
                label: 'Accessibility DNA settings',
                icon: '🧬',
                tab: 'dna'
              };
            }
            return b;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'eye', label: 'Adaptive Ability Analyzer', desc: 'Touch to analyze symptoms/conditions and automatically configure optimal adjustments.', icon: '🧠', color: 'border-ableTeal text-ableTeal bg-ableTeal/5 hover:bg-ableTeal/10 shadow-ableTeal/20', tab: 'vision' },
      { id: 'tongue', label: 'Communication Terminal', desc: 'Use speech sync, voice helpers, and custom pacer interfaces.', icon: '🎙️', color: 'border-ablePurple text-ablePurple bg-ablePurple/5 hover:bg-ablePurple/10 shadow-ablePurple/20', tab: 'voice' },
      { id: 'skin', label: 'Personal Accessibility DNA', desc: 'Configure high contrast, customized sizes, or select fine-tuned color schemes.', icon: '🧬', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-emerald-500/20', tab: 'dna' },
      { id: 'hand', label: 'Emergency Beacon SOS', desc: 'Touch to launch the rescue beacon and instantly signal emergency contacts.', icon: '🖐️', color: 'border-ableRed text-ableRed bg-ableRed/5 hover:bg-ableRed/10 shadow-ableRed/20', tab: 'sos' }
    ];
  });

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const items = [...buttons];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(dropIndex, 0, draggedItem);
    setButtons(items);
    localStorage.setItem('able_custom_dashboard_buttons_v3', JSON.stringify(items));
    setDraggedIndex(null);
    speak("Button order changed.");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const shiftButton = (fromIndex: number, direction: 'prev' | 'next') => {
    let toIndex = direction === 'prev' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= buttons.length) return;
    const items = [...buttons];
    const temp = items[fromIndex];
    items[fromIndex] = items[toIndex];
    items[toIndex] = temp;
    setButtons(items);
    localStorage.setItem('able_custom_dashboard_buttons_v3', JSON.stringify(items));
    speak(`Moved button ${buttons[fromIndex].icon} to position ${toIndex + 1}.`);
  };

  const themeColors = {
    [UserRole.Doctor]: { text: 'text-ableSky', bg: 'bg-ableSky', border: 'border-ableSky/20 shadow-ableSky/20' },
    [UserRole.Mentor]: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/20 shadow-emerald-500/20' },
    [UserRole.User]: { text: 'text-ableTeal', bg: 'bg-ableTeal', border: 'border-ableTeal/20 shadow-ableTeal/20' },
    [UserRole.HomeMember]: { text: 'text-ablePurple', bg: 'bg-ablePurple', border: 'border-ablePurple/20 shadow-ablePurple/20' }
  };

  const colors = themeColors[user?.role || UserRole.User];

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 md:space-y-12 py-4"
    >
      <motion.header 
        variants={cardVariants}
        custom={0}
        className="space-y-4 md:space-y-6"
      >
        <div className="flex items-center space-x-4 md:space-x-8">
          <motion.div 
            animate={{ 
              height: [80, 128, 80],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-2 md:w-3 h-20 md:h-32 ${colors.bg} rounded-full shadow-glow`}
          ></motion.div>
          <div className="space-y-1 md:space-y-2">
            <h1 className={`text-6xl md:text-9xl font-black tracking-tighter leading-none italic uppercase ${colors.text}`}>
              {t(user?.role === UserRole.Doctor ? 'PORTAL.' : user?.role === UserRole.Mentor ? 'GUIDE.' : 'WELCOME.')}
            </h1>
            <p className="text-[8px] md:text-xs font-black tracking-[0.4em] md:tracking-[0.8em] text-white/30 uppercase">{t("SYSTEM SYNCED")} // {user?.name}</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {user?.role === UserRole.User && (
          <>
            {buttons.map((item, idx) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                custom={idx + 1}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (item.tab === 'sos') {
                    if (onEmergency) onEmergency();
                    speak("Emergency status initiated.");
                  } else if (setActiveTab && item.tab) {
                    setActiveTab(item.tab);
                  }
                }}
                className={`bg-ableBlack border-4 md:border-8 ${item.color} p-6 md:p-10 rounded-3xl md:rounded-huge shadow-huge space-y-6 flex flex-col justify-between relative overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${draggedIndex === idx ? 'opacity-30 border-dashed border-white/40' : 'opacity-100'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="flex justify-between items-start relative z-10 w-full mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-white px-3 py-1 rounded-full">
                    Position {idx + 1} (Drag or Tap Arrow)
                  </span>
                  <div className="flex gap-2">
                    {idx > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); shiftButton(idx, 'prev'); }}
                        className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 font-black"
                        title="Move left/up"
                      >
                        ←
                      </button>
                    )}
                    {idx < buttons.length - 1 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); shiftButton(idx, 'next'); }}
                        className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 font-black"
                        title="Move right/down"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                  <span className="text-8xl md:text-9xl tracking-normal block duration-500 transform group-hover:scale-110 active:scale-95 leading-none">
                    {item.icon}
                  </span>
                </div>

                <div className="space-y-2 relative z-10 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
                    {t(item.label)}
                  </h3>
                  <p className="text-sm md:text-base font-bold opacity-80 leading-snug p-1">
                    {t(item.desc)}
                  </p>
                </div>

                {item.id === 'tongue' && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      speak("Audio speaker output is active.");
                    }}
                    className="w-full mt-4 py-3 bg-ablePurple text-white rounded-xl font-black text-xs uppercase tracking-wider relative z-20 border-2 border-white/20"
                  >
                    🔊 {t("PING SPEAKER AUDIO")}
                  </motion.button>
                )}
                {item.id === 'eye' && (
                  <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">{t("ANALYZER READY")}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </>
        )}

        {user?.role === UserRole.Doctor && (
          <>
            <motion.div 
              variants={cardVariants}
              custom={1}
              className="bg-ableBlack border-4 md:border-8 border-ableSky p-6 md:p-12 rounded-3xl md:rounded-huge shadow-huge space-y-6 md:space-y-8 relative overflow-hidden group"
            >
              <div className="text-5xl md:text-7xl">🏥</div>
              <div className="space-y-2 md:space-y-4">
                <h3 className="text-3xl md:text-5xl font-black text-ableSky tracking-tighter uppercase italic">Active Feeds</h3>
                <p className="text-lg md:text-xl font-medium text-white/80 leading-snug">Currently monitoring <span className="text-white font-black">2 patients</span> with live settings sync.</p>
              </div>
            </motion.div>
            <motion.div 
              variants={cardVariants}
              custom={2}
              className="bg-white/5 border-2 md:border-4 border-white/10 p-6 md:p-12 rounded-3xl md:rounded-huge flex flex-col justify-center space-y-4 md:space-y-6"
            >
              <h4 className="text-[8px] md:text-xs font-black uppercase tracking-widest text-white/30">Doctor Metrics</h4>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 md:p-6 bg-black/40 rounded-xl md:rounded-2xl">
                  <p className="text-2xl md:text-4xl font-black text-ableSky">12</p>
                  <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40">Consultations</p>
                </div>
                <div className="p-4 md:p-6 bg-black/40 rounded-xl md:rounded-2xl">
                  <p className="text-2xl md:text-4xl font-black text-emerald-500">98%</p>
                  <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40">Success Rate</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {user?.role === UserRole.Mentor && (
          <>
            <motion.div 
              variants={cardVariants}
              custom={1}
              className="bg-ableBlack border-4 md:border-8 border-emerald-500 p-6 md:p-12 rounded-3xl md:rounded-huge shadow-huge space-y-6 md:space-y-8 relative overflow-hidden group"
            >
              <div className="text-5xl md:text-7xl">🤝</div>
              <div className="space-y-2 md:space-y-4">
                <h3 className="text-3xl md:text-5xl font-black text-emerald-500 tracking-tighter uppercase italic">Mentee Sync</h3>
                <p className="text-lg md:text-xl font-medium text-white/80 leading-snug">Connected to <span className="text-white font-black">1 Mentee</span>. Real-time guidance loop is active.</p>
              </div>
            </motion.div>
            <motion.div 
              variants={cardVariants}
              custom={2}
              className="bg-white/5 border-2 md:border-4 border-white/10 p-6 md:p-12 rounded-3xl md:rounded-huge flex flex-col justify-center space-y-3 md:space-y-4 text-center"
            >
              <p className="text-xl md:text-2xl font-black text-emerald-500 italic">"Guidance is the ultimate bridge."</p>
              <p className="text-[8px] md:text-xs font-bold text-white/30 uppercase tracking-widest">- ABLE Mentor Manifesto</p>
            </motion.div>
          </>
        )}
      </div>

      {user?.role === UserRole.User && (
        <motion.div 
          variants={cardVariants}
          custom={3}
          className="group bg-ableRed p-6 md:p-12 rounded-3xl md:rounded-huge border-4 md:border-8 border-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-huge relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
          <div className="space-y-1 md:space-y-2 relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-white rounded-full animate-ping"></div>
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">{t("SAFETY RADAR")}</h3>
            </div>
            <p className="text-lg md:text-xl font-bold text-white/80">{t("Real-time GPS & helper sharing ready.")}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#2DD4BF', color: '#171717' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak("Emergency radar is standing by.")}
            className="w-full md:w-auto bg-white text-ableRed px-8 md:px-12 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl shadow-huge transition-all relative z-10 border-2 md:border-4 border-transparent hover:border-white"
          >
            {t("SOS TEST")}
          </motion.button>
        </motion.div>
      )}

      <motion.div 
        variants={cardVariants}
        custom={4}
        className="pt-10 scroll-mt-24"
      >
        <TaskBoard />
      </motion.div>
      
      <motion.footer 
        variants={cardVariants}
        custom={5}
        className="pt-20 border-t-4 border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Built for Ability by Naksh & Lakshita</p>
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Hackathon Build v2.5 // SYNAPTIC CORE</p>
      </motion.footer>
    </motion.div>
  );
};

export default Dashboard;
