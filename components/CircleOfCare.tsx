
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { MOCK_CIRCLE } from '../constants';
import { CircleMember, UserRole } from '../types';

const CircleOfCare: React.FC = () => {
  const { pad, speak, searchQuery } = useAbility();
  const [activeFilter, setActiveFilter] = useState<'all' | 'home' | 'mentors'>('all');
  const [circle, setCircle] = useState(MOCK_CIRCLE);

  const filteredMembers = circle.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (m.specialty?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (m.relationship?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (activeFilter === 'home') return m.role === UserRole.HomeMember;
    if (activeFilter === 'mentors') return (m as any).isMentor;
    return true;
  });

  const handleMemberAction = (member: CircleMember) => {
    const text = member.role === UserRole.HomeMember 
      ? `Alerting your support lead, ${member.name}. They are synced to your current needs.` 
      : `Requesting guidance session with ${member.name}. Your Ability DNA is already shared.`;
    speak(text);
  };

  const toggleMentorMode = (id: string) => {
    setCircle(prev => prev.map(m => {
      if (m.id === id) {
        const isNowMentor = !(m as any).isMentor;
        speak(`${m.name} is now designated as an Ability Mentor in your circle.`);
        return { ...m, isMentor: isNowMentor };
      }
      return m;
    }));
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    speak(`Sync key generated: ${code.split('').join(' ')}. Give this to someone you trust.`);
    alert(`SYNC KEY: ${code}\nShare this with a new circle member.`);
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

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", bounce: 0.3 }
    }
  };

  return (
    <div className="space-y-12 py-10 pb-20">
      <header className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="w-4 h-12 bg-ablePurple rounded-full shadow-[0_0_20px_#A855F7]"></div>
          <h2 className="text-6xl font-black text-ableTeal tracking-tighter uppercase italic">Support Circle</h2>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white/60 max-w-3xl leading-snug"
        >
          Family, friends, and specialists. One unified loop where everyone speaks your language and understands your DNA.
        </motion.p>
        
        <div className="flex flex-wrap gap-4 pt-4">
          {['all', 'home', 'mentors'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest border-4 transition-all uppercase ${activeFilter === f ? 'bg-ableTeal text-ableBlack border-white shadow-xl scale-105' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              {f === 'mentors' ? 'Ability Mentors' : f}
            </button>
          ))}
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {/* Sync New Member */}
        <motion.button 
          variants={itemVariants}
          onClick={generateInviteCode}
          className="bg-ableBlack border-8 border-dashed border-white/10 p-12 rounded-huge hover:border-ableTeal transition-all flex flex-col items-center justify-center text-center space-y-6 group min-h-[350px]"
        >
          <div className="text-7xl group-hover:scale-125 transition-transform duration-500">🤝</div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white uppercase">Sync Member</h3>
            <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Add to your core DNA loop</p>
          </div>
        </motion.button>

        {filteredMembers.map(member => (
          <motion.div 
            variants={itemVariants}
            key={member.id} 
            className={`bg-ableBlack border-8 p-10 rounded-huge shadow-2xl flex flex-col justify-between transition-all relative overflow-hidden group min-h-[350px] ${member.role === UserRole.HomeMember ? 'border-ablePurple' : 'border-ableTeal'}`}
          >
            {member.isOnline && (
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Live</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-6xl shadow-inner group-hover:rotate-6 transition-transform">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white leading-none mb-2">{member.name}</h3>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-ableTeal uppercase tracking-widest leading-none">
                      {member.role === UserRole.HomeMember ? member.relationship : member.specialty}
                    </span>
                    {(member as any).isMentor && (
                      <span className="w-fit text-[8px] font-black bg-ableTeal text-ableBlack px-2 py-0.5 rounded uppercase tracking-tighter mt-1">Mentor</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {member.needsMet.map(need => (
                  <span key={need} className="text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-white/40">
                    {need}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t-4 border-white/5">
              {member.role === UserRole.HomeMember && (
                <button 
                  onClick={() => toggleMentorMode(member.id)}
                  className={`w-full py-3 rounded-xl text-[10px] font-black tracking-widest border-2 transition-all ${ (member as any).isMentor ? 'bg-ableTeal/10 border-ableTeal text-ableTeal' : 'border-white/10 text-white/30 hover:border-white/30' }`}
                >
                  {(member as any).isMentor ? 'MENTOR MODE ACTIVE' : 'ENABLE MENTOR MODE'}
                </button>
              )}
              
              <button 
                onClick={() => handleMemberAction(member)}
                className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-xl transition-all active:scale-95 ${member.role === UserRole.HomeMember ? 'bg-ablePurple text-white hover:brightness-110' : 'bg-white text-ableBlack hover:bg-ableTeal'}`}
              >
                {member.role === UserRole.HomeMember ? 'REQUEST SYNC' : 'BOOK GUIDANCE'}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white/5 border-8 border-white/5 p-16 rounded-huge space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-ableTeal/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <h3 className="text-5xl font-black text-ableTeal tracking-tighter uppercase italic underline decoration-ablePurple underline-offset-8">Synced Logic</h3>
            <p className="text-2xl font-bold text-white/60 max-w-2xl">ABLE AI summarizes your intent for your circle, so you never have to repeat your needs.</p>
          </div>
          <div className="flex items-center gap-4 bg-emerald-500/20 border-2 border-emerald-500/30 px-8 py-4 rounded-3xl">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em]">Circle DNA Online</span>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CircleOfCare;
