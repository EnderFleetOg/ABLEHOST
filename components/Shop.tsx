
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { MOCK_SHOP_EXPERTS } from '../constants';

const Shop: React.FC = () => {
  const { speak } = useAbility();
  const [filter, setFilter] = useState<'All' | 'Doctor' | 'Mentor'>('All');

  const filteredExperts = MOCK_SHOP_EXPERTS.filter(e => filter === 'All' || e.role === filter);

  const handleHire = (name: string, specialty: string) => {
    speak(`Initiating hire request for ${name}, your ${specialty} specialist. Synchronizing your Ability DNA for onboarding.`);
    alert(`HIRE REQUEST SENT: ${name} will contact you shortly.`);
  };

  return (
    <div className="space-y-12 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="space-y-6">
        <div className="flex items-center space-x-4 text-ableTeal font-black tracking-[0.3em] uppercase text-xs">
          <span className="w-12 h-1 bg-ableTeal"></span>
          <span>Expert Marketplace</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase">Professional Care.</h1>
        <p className="text-2xl text-white/60 leading-relaxed font-bold max-w-2xl">
          Hire specialized mentors and doctors who understand the ABLE framework. Every expert is synced to your DNA.
        </p>
        
        <div className="flex bg-white/5 border-4 border-white/10 p-2 rounded-3xl w-fit shadow-2xl">
          {['All', 'Doctor', 'Mentor'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-10 py-4 rounded-2xl font-black text-sm tracking-widest transition-all ${filter === f ? 'bg-ableTeal text-ableBlack shadow-huge scale-105' : 'text-white/40 hover:text-white'}`}
            >
              {f}S
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExperts.map(expert => (
          <div key={expert.id} className="group bg-ableBlack rounded-huge border-8 border-white/5 p-10 shadow-2xl hover:border-ableTeal transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-ableTeal/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-ableTeal/10 transition-colors"></div>
            
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border-4 border-white/10 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {expert.avatar}
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Expert Rating</p>
                   <p className="text-xl font-black text-white">★★★★★</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">{expert.name}</h3>
                <p className="text-xs font-black text-ablePurple uppercase tracking-[0.2em]">{expert.specialty}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {expert.needsMet.map(need => (
                  <span key={need} className="text-[9px] font-black uppercase tracking-wider bg-white/5 px-4 py-2 rounded-xl text-white/50 border border-white/10 group-hover:border-ableTeal/30 group-hover:text-ableTeal transition-colors">
                    {need}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full pt-10 mt-10 border-t-4 border-white/5 flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Hourly rate</p>
                <p className="text-3xl font-black text-white">${expert.hourlyRate}<span className="text-sm font-bold text-white/30">/hr</span></p>
              </div>
              <button 
                onClick={() => handleHire(expert.name, expert.specialty)}
                className="bg-white text-ableBlack px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-huge hover:bg-ableTeal hover:scale-105 active:scale-95 transition-all"
              >
                Hire
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-ablePurple p-16 rounded-huge text-white shadow-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10 max-w-3xl space-y-8">
          <h2 className="text-5xl font-black tracking-tighter leading-tight uppercase italic">Need Dedicated Support?</h2>
          <p className="text-white/80 text-2xl leading-relaxed font-bold">Our algorithm identifies specialized experts who match your mobility, vision, and speech communication style.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-white text-ablePurple px-12 py-6 rounded-3xl font-black text-xl hover:bg-ableTeal hover:text-ableBlack transition-all shadow-huge">Start Expert Match</button>
            <button className="bg-black/20 backdrop-blur-md text-white border-4 border-white/20 px-12 py-6 rounded-3xl font-black text-xl hover:bg-black/30 transition-all">Browse Case Studies</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
