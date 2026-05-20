
import React from 'react';
import { motion } from 'motion/react';
import { CREATORS, TAGLINE, CONTACT_EMAIL } from '../constants';
import Logo from './Logo';

const InfoPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-ableBlack border-8 border-ableTeal p-12 rounded-huge shadow-2xl text-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#2DD4BF10_0%,_transparent_70%)]"></div>
        <div className="w-32 h-32 bg-white rounded-huge mx-auto flex items-center justify-center p-3 relative z-10 shadow-glow">
          <Logo />
        </div>
        <div className="space-y-2 relative z-10">
          <h1 className="text-7xl font-black text-ableTeal tracking-tighter uppercase italic">ABLE</h1>
          <p className="text-xl font-black text-white uppercase tracking-[0.4em] opacity-40">{TAGLINE}</p>
        </div>
        
        <div className="p-8 bg-white/5 rounded-3xl border-4 border-white/10 text-left space-y-6 relative z-10">
          <p className="text-xl font-medium leading-relaxed italic text-white/80">
            ABLE is an adaptive infrastructure built for those who experience the world with low vision and those who speak with unique rhythms. We believe technology should wait for the human, not the other way around.
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-white/5">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-ablePurple uppercase tracking-widest leading-none">Architects</p>
              <p className="text-2xl font-black text-white">{CREATORS}</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-[10px] font-black text-ablePurple uppercase tracking-widest leading-none">Connect</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg font-black text-ableTeal hover:underline transition-all underline-offset-4">{CONTACT_EMAIL}</a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ablePurple p-10 rounded-huge text-white space-y-4 shadow-xl"
        >
           <h3 className="text-3xl font-black uppercase tracking-tighter italic">Our Philosophy</h3>
           <p className="text-lg font-bold opacity-90 italic">"Do not build for disability. Build for adaptation."</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-ableBlack p-10 rounded-huge text-white space-y-4 shadow-xl border-4 border-ableTeal"
        >
           <h3 className="text-3xl font-black uppercase tracking-tighter italic">Security</h3>
           <p className="text-lg font-bold opacity-90">Your PAD data never leaves this device unless shared for emergency support.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoPage;
