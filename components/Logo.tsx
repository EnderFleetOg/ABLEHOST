
import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full" }) => {
  return (
    <div className={className}>
      <svg 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
        aria-label="ABLE Logo"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Connection Ring - Abstract Human Connection */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M120 256C120 180.891 180.891 120 256 120C331.109 120 392 180.891 392 256C392 331.109 331.109 392 256 392"
          stroke="url(#logo-grad)"
          strokeWidth="32"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Listening / Wave form inside */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          d="M200 256C200 225.072 225.072 200 256 200C286.928 200 312 225.072 312 256"
          stroke="url(#logo-grad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Support Node - The "Heart" of the interaction */}
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
          cx="256"
          cy="256"
          r="48"
          fill="url(#logo-grad)"
          filter="url(#glow)"
        />

        {/* Subtle motion lines representing sound/patience */}
        <motion.path
          animate={{ x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          d="M420 236L460 236"
          stroke="#2DD4BF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          animate={{ x: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          d="M52 276L92 276"
          stroke="#A855F7"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
