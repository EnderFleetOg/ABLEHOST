import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAbility } from '../context/AbilityContext';

interface EmergencyQRProps {
  onClose?: () => void;
}

const EmergencyQR: React.FC<EmergencyQRProps> = ({ onClose }) => {
  const { pad } = useAbility();

  // Construct a medical summary for first responders
  const medicalData = {
    info: pad.medicalInfo || 'No info provided',
    blood: pad.bloodType || 'Unknown',
    contacts: pad.emergencyContacts.map(c => `${c.name}: ${c.phone}`).join(', '),
    id: 'ABLE-USER-DNA'
  };

  // Construct a very clean, high-contrast text block for maximum scannability
  const qrValue = `
MEDICAL EMERGENCY INFO
----------------------
BLOOD TYPE: ${pad.bloodType || 'N/A'}
INFO: ${pad.medicalInfo || 'No vital info'}

CONTACTS:
${pad.emergencyContacts.slice(0, 2).map(c => `• ${c.name}: ${c.phone}`).join('\n')}

System: ABLE Humanoid Support
----------------------
  `.trim();

  return (
    <div className="bg-white p-8 rounded-[3rem] flex flex-col items-center justify-center space-y-6 shadow-2xl border-8 border-black relative animate-in zoom-in duration-300">
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-black/20 hover:text-black transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
      <div className="bg-black/5 p-4 rounded-3xl">
        <QRCodeSVG 
          value={qrValue}
          size={240}
          level="M"
          includeMargin={true}
          fgColor="#000000"
        />
      </div>
      <div className="text-center space-y-3">
        <p className="text-2xl font-black text-black uppercase tracking-tighter italic">Emergency Profile</p>
        <p className="text-sm font-bold text-black/60 italic leading-none max-w-[200px]">Black high-contrast QR for reliable mobile scanning.</p>
      </div>
    </div>
  );
};

export default EmergencyQR;
