
import React, { useState, useEffect } from 'react';
import { useAbility } from '../context/AbilityContext';
import { MOCK_LOCATIONS } from '../constants';
import { LocationSimulation } from '../types';
import { getSimulationAnalysis } from '../services/geminiService';

const MapModule: React.FC = () => {
  const { pad } = useAbility();
  const [selectedLoc, setSelectedLoc] = useState<LocationSimulation | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const simulateLocation = async (loc: LocationSimulation) => {
    setSelectedLoc(loc);
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await getSimulationAnalysis(pad, loc);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Simulation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-10">
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-5xl font-black text-ableTeal tracking-tighter mb-8 underline decoration-white">LOCATIONS.</h2>
        <div className="space-y-4">
          {MOCK_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => simulateLocation(loc)}
              className={`w-full text-left p-8 rounded-huge border-8 transition-all group ${
                selectedLoc?.id === loc.id ? 'border-ableTeal bg-ableTeal text-ableBlack' : 'bg-white/5 border-white/5 text-white hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-2xl">{loc.name}</span>
                <span className="text-xs font-black bg-black/20 px-2 py-1 rounded">SCORE: {loc.baseAccessibilityScore}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">{loc.type}</p>
              
              <div className="flex flex-wrap gap-2">
                {loc.accessibilityFeatures.slice(0, 2).map(f => (
                  <span key={f} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedLoc?.id === loc.id ? 'bg-black/10' : 'bg-ablePurple text-white'}`}>
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="bg-ableBlack border-8 border-white/5 rounded-huge p-12 min-h-[500px] shadow-huge flex flex-col">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-pulse">
                <div className="text-8xl">🧬</div>
                <h3 className="text-4xl font-black text-ableTeal">SIMULATING DNA...</h3>
                <div className="w-full max-w-md h-4 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-ableTeal w-1/2 animate-shimmer"></div>
                </div>
             </div>
          ) : analysis ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <header>
                <h3 className="text-5xl font-black text-ableTeal tracking-tighter">{selectedLoc?.name}</h3>
                <p className="text-2xl font-bold text-white/60">ADAPTIVE JOURNEY PREVIEW</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-emerald-500/10 border-4 border-emerald-500/30 rounded-huge">
                   <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">ACCESSIBILITY STRENGTHS</h4>
                   <ul className="space-y-2">
                     {selectedLoc?.accessibilityFeatures.map(f => <li key={f} className="font-bold text-lg">✓ {f}</li>)}
                   </ul>
                </div>
                <div className="p-8 bg-ableRed/10 border-4 border-ableRed/30 rounded-huge">
                   <h4 className="text-xs font-black text-ableRed uppercase tracking-widest mb-4">POTENTIAL DNA BARRIERS</h4>
                   <ul className="space-y-2">
                     {selectedLoc?.potentialHazards.map(h => <li key={h} className="font-bold text-lg">⚠ {h}</li>)}
                   </ul>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xl font-black text-ablePurple">SIMULATION ANALYSIS</h4>
                 <p className="text-2xl font-medium leading-relaxed text-white/80">{analysis}</p>
              </div>

              <button className="w-full py-8 bg-ableTeal text-ableBlack rounded-huge font-black text-3xl shadow-huge active:scale-95 transition-all">
                START GUIDED NAVIGATION
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
               <div className="text-9xl opacity-10">📍</div>
               <h3 className="text-3xl font-black text-white/20 uppercase tracking-widest">Select a DNA Zone to begin.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapModule;
