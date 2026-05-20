
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { CareerPath } from '../types';
import { getCareerGuidance } from '../services/geminiService';
import { MOCK_CAREERS } from '../constants';

const CareerHub: React.FC = () => {
  const { pad, searchQuery } = useAbility();
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [paths, setPaths] = useState<CareerPath[]>(MOCK_CAREERS);

  const fetchGuidance = async () => {
    if (!interests) return;
    setLoading(true);
    try {
      const result = await getCareerGuidance(pad, interests);
      setPaths(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = paths.filter(path => 
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    path.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 py-12 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ableTeal/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-ablePurple/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="space-y-8 relative">
        <div className="flex items-center gap-6 mb-4">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-[10px] font-black text-ableTeal tracking-[0.5em] uppercase italic">Professional Evolution Path</span>
          <div className="h-px w-12 bg-ableTeal"></div>
        </div>

        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl md:text-8xl font-black text-white tracking-tighter italic uppercase leading-[0.9] flex flex-col"
        >
          <span className="text-ableTeal">Career</span>
          <span className="ml-12 md:ml-24">Architect.</span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white/50 max-w-2xl leading-tight"
        >
          Your Personal Accessibility DNA is a professional superpower. We align your traits with roles that value your unique perspective.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative group max-w-4xl pt-8"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-ableTeal to-ablePurple rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
          <div className="relative flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="ENTER PASSIONS (E.G. DESIGN, CODING, ART)"
              className="flex-1 bg-black/60 border-4 border-white/10 rounded-[2rem] px-8 py-6 text-xl md:text-2xl font-black text-white outline-none focus:border-ableTeal transition-all placeholder:text-white/10"
            />
            <button 
              onClick={fetchGuidance}
              disabled={loading}
              className="bg-white text-ableBlack px-12 py-6 rounded-[2rem] font-black text-xl md:text-2xl shadow-2xl active:scale-95 disabled:opacity-50 transition-all hover:bg-ableTeal hover:text-ableBlack"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-ableBlack border-t-transparent rounded-full animate-spin"></div>
                  <span>SCANNING...</span>
                </div>
              ) : 'ALIGN DNA'}
            </button>
          </div>
        </motion.div>
      </header>

      {/* DNA Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[1, 2].map(i => (
              <div key={i} className="bg-white/5 border-4 border-white/5 p-12 rounded-huge animate-pulse flex flex-col gap-6">
                <div className="h-12 w-2/3 bg-white/10 rounded-2xl"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                </div>
                <div className="mt-auto h-16 w-full bg-white/5 rounded-3xl"></div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {!loading && filteredPaths.map((path, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black/40 border-4 border-white/10 p-10 md:p-14 rounded-[3.5rem] hover:border-ableTeal/40 transition-all group flex flex-col space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl"
          >
            {/* Visual DNA Match Score */}
            <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
              <div className="text-[8px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">DNA Match</div>
              <div className="text-4xl font-black text-ableTeal italic flex items-baseline">
                {path.compatibility}
                <span className="text-sm not-italic opacity-40 ml-1">%</span>
              </div>
              <div className="w-16 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${path.compatibility}%` }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-ableTeal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${path.compatibility > 90 ? 'bg-emerald-500 shadow-glow' : 'bg-ableTeal'}`} />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase italic">Verified Path</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.9] uppercase italic group-hover:text-ableTeal transition-colors">{path.title}</h3>
            </div>
            
            <p className="text-lg md:text-xl font-medium text-white/60 leading-tight flex-1">
              {path.description}
            </p>

            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                {path.skills.map(s => (
                  <span key={s} className="bg-white/5 border border-white/10 text-white/80 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:border-ableTeal/30 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Speech Interface</div>
                  <div className="text-sm font-black text-ableTeal uppercase tracking-tighter italic">{path.speechSupportLevel} required</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Visual Layer</div>
                  <div className="text-sm font-black text-ableTeal uppercase tracking-tighter italic">{path.visualAlternativeNeeded ? 'ADAPTED' : 'STANDARD'}</div>
                </div>
              </div>

              <button className="w-full py-6 bg-white text-ableBlack rounded-[2rem] font-black text-xl shadow-xl hover:bg-ableTeal transition-all active:scale-95 flex items-center justify-center gap-4 group/btn overflow-hidden relative">
                <span className="relative z-10">LOCK IN ROLE DNA</span>
                <div className="w-6 h-6 bg-ableBlack rounded-full flex items-center justify-center text-[10px] text-white group-hover/btn:translate-x-2 transition-transform relative z-10">→</div>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="pt-20 text-center">
        <div className="inline-block p-12 border-4 border-white/5 rounded-huge bg-white/2 ring-8 ring-white/1">
          <h4 className="text-2xl font-black text-white/40 italic uppercase tracking-tighter mb-4">DNA ARCHIVE PROTECTED</h4>
          <p className="text-xs font-medium text-white/20 max-w-sm mx-auto uppercase tracking-widest leading-loose">
            All career matching is performed locally within your secure ability buffer. Data remains yours. Forever.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CareerHub;
