
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Removed unused FatigueTolerance import
import { PAD, VisionNeed, CognitiveMode } from '../types';
import { DEFAULT_PAD } from '../constants';

interface AccessibilityContextType {
  pad: PAD;
  updatePAD: (updates: Partial<PAD>) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  uiIntensity: 'standard' | 'low-stim';
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pad, setPad] = useState<PAD>(DEFAULT_PAD);
  const [isHighContrast, setIsHighContrast] = useState(false);

  const updatePAD = (updates: Partial<PAD>) => {
    setPad(prev => ({ ...prev, ...updates }));
  };

  const toggleHighContrast = () => setIsHighContrast(!isHighContrast);

  const uiIntensity = pad.cognitive === CognitiveMode.HighFocus ? 'low-stim' : 'standard';

  // Apply global UI changes based on PAD
  useEffect(() => {
    const root = document.documentElement;
    
    // Vision Adjustments
    if (pad.vision === VisionNeed.LowVision) {
      root.style.fontSize = '120%';
    } else if (pad.vision === VisionNeed.Blind) {
      root.style.fontSize = '110%'; // Focus on screen readers
    } else {
      root.style.fontSize = '100%';
    }

    // High Contrast Application
    if (isHighContrast) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [pad, isHighContrast]);

  return (
    <AccessibilityContext.Provider value={{ pad, updatePAD, isHighContrast, toggleHighContrast, uiIntensity }}>
      <div className={`min-h-screen ${isHighContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
