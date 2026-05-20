
import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { useAbility } from '../context/AbilityContext';

type LocalEmotion = 'happy' | 'surprised' | 'curious' | 'cool' | 'sleepy' | 'sad';

const CursorBuddy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { aiEmotion } = useAbility();
  const [localEmotion, setLocalEmotion] = useState<LocalEmotion>('happy');

  // Smooth out the pupil movement
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const smoothPupilX = useSpring(pupilX, springConfig);
  const smoothPupilY = useSpring(pupilY, springConfig);

  // Sync global emotion (like error states) with local emotion
  useEffect(() => {
    if (aiEmotion === 'vibrate' || aiEmotion === 'sad') {
      setLocalEmotion('sad');
    } else {
      setLocalEmotion('happy');
    }
  }, [aiEmotion]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const distanceSq = deltaX * deltaX + deltaY * deltaY;
        
        // Skip local emotion overrides if we are in a global state like 'sad'
        if (aiEmotion !== 'vibrate' && aiEmotion !== 'sad') {
          if (distanceSq < 10000) {
            setLocalEmotion('surprised');
          } else if (Math.abs(deltaX) > 500) {
            setLocalEmotion('curious');
          } else {
            if (Math.random() > 0.995) setLocalEmotion('cool');
            else if (Math.random() > 0.99) setLocalEmotion('happy');
          }
        }

        const maxMove = 12;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(Math.sqrt(distanceSq) / 10, maxMove);
        
        pupilX.set(Math.cos(angle) * distance);
        pupilY.set(Math.sin(angle) * distance);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pupilX, pupilY, aiEmotion]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (aiEmotion !== 'vibrate' && aiEmotion !== 'sad') {
        if (Math.random() > 0.8) setLocalEmotion('happy');
        if (Math.random() > 0.95) setLocalEmotion('sleepy');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [aiEmotion]);

  const isVibrating = aiEmotion === 'vibrate';

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-12 right-12 z-50 pointer-events-none hidden lg:block"
    >
      <motion.div
        animate={isVibrating ? {
          x: [0, -10, 10, -10, 10, 0],
          y: [0, -5, 5, -5, 5, 0],
        } : {
          y: [0, -15, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={isVibrating ? {
          duration: 0.1,
          repeat: 10,
        } : {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 blur-[100px] opacity-40 rounded-full transition-colors duration-500 ${localEmotion === 'sad' ? 'bg-red-500' : 'bg-ableTeal'}`} />
        
        {/* The Body - Large and Fixed */}
        <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden border-8 border-white/10 ring-8 ring-ableTeal/5">
          
          {/* Eyebrows */}
          <div className="flex gap-12 md:gap-20 -mb-2 z-20">
            <motion.div 
              animate={{
                rotate: localEmotion === 'surprised' ? -20 : localEmotion === 'curious' ? 20 : localEmotion === 'sad' ? 25 : 0,
                y: localEmotion === 'surprised' ? -5 : localEmotion === 'sad' ? 2 : 0,
              }}
              className="w-8 h-1.5 md:w-12 md:h-2 bg-ableBlack/20 rounded-full" 
            />
            <motion.div 
              animate={{
                rotate: localEmotion === 'surprised' ? 20 : localEmotion === 'curious' ? -20 : localEmotion === 'sad' ? -25 : 0,
                y: localEmotion === 'surprised' ? -5 : localEmotion === 'sad' ? 2 : 0,
              }}
              className="w-8 h-1.5 md:w-12 md:h-2 bg-ableBlack/20 rounded-full" 
            />
          </div>

          {/* Eyes Container */}
          <div className="flex gap-8 md:gap-12 mt-2">
            {[0, 1].map((index) => (
              <div key={index} className="w-8 h-10 md:w-12 md:h-16 bg-black/5 rounded-full relative flex items-center justify-center overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{
                    height: localEmotion === 'sleepy' ? '20%' : '60%',
                    scaleY: localEmotion === 'happy' ? 0.8 : localEmotion === 'sad' ? 1.1 : 1
                  }}
                  style={{
                    x: smoothPupilX,
                    y: smoothPupilY,
                  }}
                  className="w-5 h-8 md:w-7 md:h-12 bg-ableBlack rounded-full relative"
                >
                  <div className="absolute top-1.5 left-1.5 w-2 md:w-3 h-2 md:h-3 bg-white/40 rounded-full" />
                </motion.div>
                
                <motion.div 
                  animate={{ height: ["0%", "0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                  className="absolute top-0 left-0 w-full bg-white z-10"
                />
              </div>
            ))}
          </div>
          
          {/* Mouth */}
          <div className="mt-4 md:mt-6 h-4 md:h-6 flex items-center justify-center">
            <motion.div 
              animate={{
                width: localEmotion === 'happy' ? 40 : (localEmotion === 'surprised' || localEmotion === 'sad') ? 20 : 25,
                height: (localEmotion === 'surprised' || localEmotion === 'sad') ? 15 : 4,
                borderRadius: localEmotion === 'happy' ? '0 0 100px 100px' : (localEmotion === 'sad' ? '100px 100px 0 0' : '100px'),
                backgroundColor: localEmotion === 'sad' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.2)'
              }}
              className="min-w-[20px]"
            />
          </div>

          {/* Subtle blush */}
          <div className="absolute bottom-10 w-full flex justify-around px-8">
            <div className={`w-8 md:w-12 h-3 bg-pink-400/20 blur-[2px] rounded-full transition-opacity duration-500 ${localEmotion === 'happy' ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`w-8 md:w-12 h-3 bg-pink-400/20 blur-[2px] rounded-full transition-opacity duration-500 ${localEmotion === 'happy' ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* ABLE Label */}
          <div className="absolute bottom-4 md:bottom-6 text-[8px] md:text-[10px] font-black text-ableTeal tracking-[0.5em] uppercase opacity-20 italic">
            {localEmotion === 'sleepy' ? 'DREAMING...' : isVibrating ? 'ERROR!' : 'SYNC ACTIVE'}
          </div>
        </div>

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -120],
              x: [(i - 2) * 30, (i - 2) * 60],
              opacity: [0, 0.5, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
            className={`absolute -top-4 left-1/2 w-2 h-2 rounded-full blur-[1px] ${localEmotion === 'sad' ? 'bg-red-400' : 'bg-ableTeal'}`}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default CursorBuddy;
