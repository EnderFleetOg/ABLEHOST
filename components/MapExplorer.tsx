
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useAbility } from '../context/AbilityContext';
import { motion } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface Location {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  accessibility: string;
  notes: string;
}

const MOCK_LOCATIONS: Location[] = [
  { id: '1', name: 'Metro Central Station', type: 'Transport', lat: 37.7749, lng: -122.4194, accessibility: 'Full Ramp Access', notes: 'Voice-guided elevators available.' },
  { id: '2', name: 'City Public Library', type: 'Library', lat: 37.7785, lng: -122.4167, accessibility: 'High Contrast Signage', notes: 'Quiet rooms and screen readers ready.' },
  { id: '3', name: 'Echo Park', type: 'Park', lat: 37.7700, lng: -122.4250, accessibility: 'Smooth Pathways', notes: 'Tactile maps at entry points.' },
];

const MarkerWithInfo: React.FC<{ loc: Location }> = ({ loc }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker ref={markerRef} position={{ lat: loc.lat, lng: loc.lng }} onClick={() => setOpen(true)}>
        <Pin 
          background={loc.type === 'Transport' ? '#0EA5E9' : loc.type === 'Library' ? '#10B981' : '#2DD4BF'} 
          glyphColor="#fff" 
          borderColor="#fff"
        />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="bg-white p-2 text-ableBlack min-w-[200px]">
            <h4 className="font-black uppercase tracking-tighter text-lg">{loc.name}</h4>
            <div className="flex gap-1 mb-2">
              <span className="text-[8px] font-black bg-ableTeal/10 px-2 py-0.5 rounded text-ableTeal uppercase">{loc.type}</span>
              <span className="text-[8px] font-black bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500 uppercase">{loc.accessibility}</span>
            </div>
            <p className="text-xs font-medium opacity-60 leading-tight italic">"{loc.notes}"</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapExplorer: React.FC = () => {
  const { speak } = useAbility();

  if (!hasValidKey) {
    return (
      <div className="bg-ableBlack p-8 md:p-12 rounded-huge border-4 border-white/10 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-6xl shadow-inner">🗺️</div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Google Maps Required</h2>
          <p className="text-white/60 max-w-md mx-auto">Please add your <span className="text-ableTeal font-black">GOOGLE_MAPS_PLATFORM_KEY</span> to the Secrets menu in Settings (⚙️) to activate the real map experience.</p>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl text-left space-y-4 max-w-sm border border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">SETUP GUIDE:</p>
          <ol className="text-xs font-medium space-y-3 list-decimal list-inside text-white/80 leading-relaxed">
            <li>Go to <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noreferrer" className="text-ableTeal underline">Google Cloud Console</a></li>
            <li>Get a new API Key</li>
            <li>Open <span className="font-black italic text-white underline">Settings (⚙️)</span> top-right</li>
            <li>Go to <span className="font-black italic text-white underline">Secrets</span> and add it</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-4 h-24 bg-ableTeal rounded-full shadow-glow"></div>
          <div>
            <h2 className="text-3xl font-black text-ableTeal italic uppercase tracking-tighter">Ability Explorer</h2>
            <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Live Accessibility Vectors</p>
          </div>
        </div>
        <button 
          onClick={() => speak("Syncing nearest accessible locations.")}
          className="bg-white/5 hover:bg-white/10 border-2 border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          REFRESH BUFFER
        </button>
      </div>

      <div className="bg-white/5 border-4 border-white/10 rounded-huge p-2 md:p-4 overflow-hidden relative shadow-huge">
        <APIProvider apiKey={API_KEY} version="weekly">
          <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden border-2 border-white/5">
            <Map
              defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
              defaultZoom={13}
              mapId="ABLE_EXPLORER_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={true}
              gestureHandling={'greedy'}
            >
              {MOCK_LOCATIONS.map(loc => (
                <MarkerWithInfo key={loc.id} loc={loc} />
              ))}
            </Map>
          </div>
        </APIProvider>

        {/* Legend */}
        <div className="absolute top-8 right-8 space-y-2">
          {['Transport', 'Library', 'Park'].map((type, i) => (
            <div key={type} className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-ableSky' : i === 1 ? 'bg-emerald-500' : 'bg-ableTeal'}`}></div>
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">{type}</span>
            </div>
          ))}
        </div>

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-none">
          <div className="bg-ableBlack/80 backdrop-blur-xl border-4 border-ableTeal md:rounded-3xl p-6 pointer-events-auto shadow-huge">
             <h4 className="text-xl font-black italic uppercase text-ableTeal tracking-tighter mb-2">NEAREST ACCESSIBILITY</h4>
             <p className="text-xs font-medium text-white/60">Metro Central Station: 500m away. Full ramp access detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
