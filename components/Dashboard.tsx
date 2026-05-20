
import React from 'react';
import { useAbility } from '../context/AbilityContext';
import { UserRole } from '../types';
import TaskBoard from './TaskBoard';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { pad, speak, user } = useAbility();

  const themeColors = {
    [UserRole.Specialist]: { text: 'text-ableSky', bg: 'bg-ableSky', border: 'border-ableSky/20 shadow-ableSky/20' },
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
              {user?.role === UserRole.Specialist ? 'PORTAL.' : user?.role === UserRole.Mentor ? 'GUIDE.' : 'HELLO.'}
            </h1>
            <p className="text-[8px] md:text-xs font-black tracking-[0.4em] md:tracking-[0.8em] text-white/30 uppercase">SYSTEM SYNCED // {user?.name}</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {user?.role === UserRole.User && (
          <>
            <motion.div 
              variants={cardVariants}
              custom={1}
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-ableBlack border-4 md:border-8 border-ableTeal p-6 md:p-12 rounded-3xl md:rounded-huge shadow-huge space-y-6 md:space-y-8 relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-ableTeal/10 rounded-full blur-3xl -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:bg-ableTeal/20 transition-all duration-700"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-500">👂</div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-emerald-500 text-white px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest shadow-lg">IFI™ ACTIVE</span>
                </div>
              </div>
              <div className="space-y-2 md:space-y-4 relative z-10">
                <h3 className="text-3xl md:text-5xl font-black text-ableTeal tracking-tighter uppercase italic">Synaptic Loop</h3>
                <p className="text-lg md:text-xl font-medium text-white/80 leading-snug">Listening with extreme patience. Every pause is respected as part of your rhythm.</p>
              </div>
            </motion.div>

            <motion.div 
              variants={cardVariants}
              custom={2}
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-ableBlack border-4 md:border-8 border-ablePurple p-6 md:p-12 rounded-3xl md:rounded-huge shadow-huge space-y-6 md:space-y-8 relative overflow-hidden group cursor-default"
            >
              <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-ablePurple/10 rounded-full blur-3xl -ml-12 -mb-12 md:-ml-16 md:-mb-16 group-hover:bg-ablePurple/20 transition-all duration-700"></div>
              <div className="text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-500 relative z-10">🔊</div>
              <div className="space-y-2 md:space-y-4 relative z-10">
                <h3 className="text-3xl md:text-5xl font-black text-ablePurple tracking-tighter uppercase italic">Vocal DNA</h3>
                <p className="text-lg md:text-xl font-medium text-white/80 leading-snug">Profile: <span className="text-white font-black">{pad.voicePreference.replace('-', ' ')}</span> at {Math.round(pad.speechRate * 100)}% pace.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => speak("Voice preference active and calibrated.")}
                className="w-full py-4 md:py-6 bg-ablePurple text-white rounded-2xl md:rounded-3xl font-black text-xl md:text-2xl shadow-huge hover:brightness-110 transition-all relative z-10"
              >
                PING AUDIO
              </motion.button>
            </motion.div>
          </>
        )}

        {user?.role === UserRole.Specialist && (
          <>
            <motion.div 
              variants={cardVariants}
              custom={1}
              className="bg-ableBlack border-4 md:border-8 border-ableSky p-6 md:p-12 rounded-3xl md:rounded-huge shadow-huge space-y-6 md:space-y-8 relative overflow-hidden group"
            >
              <div className="text-5xl md:text-7xl">🏥</div>
              <div className="space-y-2 md:space-y-4">
                <h3 className="text-3xl md:text-5xl font-black text-ableSky tracking-tighter uppercase italic">Active DNA Feeds</h3>
                <p className="text-lg md:text-xl font-medium text-white/80 leading-snug">Currently monitoring <span className="text-white font-black">2 patients</span> with live PAD sync.</p>
              </div>
            </motion.div>
            <motion.div 
              variants={cardVariants}
              custom={2}
              className="bg-white/5 border-2 md:border-4 border-white/10 p-6 md:p-12 rounded-3xl md:rounded-huge flex flex-col justify-center space-y-4 md:space-y-6"
            >
              <h4 className="text-[8px] md:text-xs font-black uppercase tracking-widest text-white/30">Specialist Metrics</h4>
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
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">SAFETY RADAR</h3>
            </div>
            <p className="text-lg md:text-xl font-bold text-white/80">Real-time GPS & Ability DNA broadcast ready.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#2DD4BF', color: '#171717' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speak("Emergency radar is standing by.")}
            className="w-full md:w-auto bg-white text-ableRed px-8 md:px-12 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl shadow-huge transition-all relative z-10 border-2 md:border-4 border-transparent hover:border-white"
          >
            SOS TEST
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
