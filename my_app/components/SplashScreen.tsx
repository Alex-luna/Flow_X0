"use client";

import React, { useEffect, useState } from 'react';
import FlowXLogo from './logos/FlowXLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<'entering' | 'glowing' | 'exiting'>('entering');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('glowing'), 500);
    const timer2 = setTimeout(() => setStage('exiting'), 2500);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-gradient-to-br from-gray-900 via-black to-gray-800
      transition-all duration-1000 ease-out
      ${stage === 'exiting' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
    `}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D73120 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #D73120 0%, transparent 50%)`
        }} />
      </div>

      {/* Main logo container */}
      <div className={`
        relative flex items-center justify-center
        transition-all duration-1000 ease-out
        ${stage === 'entering' ? 'opacity-0 scale-90 translate-y-8' : 'opacity-100 scale-100 translate-y-0'}
      `}>
        {/* Glow effects */}
        <div className={`
          absolute inset-0 transition-all duration-2000 ease-in-out
          ${stage === 'glowing' ? 'opacity-100' : 'opacity-0'}
        `}>
          {/* Outer glow */}
          <div 
            className="absolute -inset-20 rounded-full blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(215, 49, 32, 0.4) 0%, rgba(215, 49, 32, 0.1) 50%, transparent 70%)'
            }}
          />
          
          {/* Inner glow */}
          <div 
            className="absolute -inset-10 rounded-full blur-xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(215, 49, 32, 0.6) 0%, rgba(215, 49, 32, 0.2) 40%, transparent 60%)',
              animationDelay: '0.5s'
            }}
          />
        </div>

        {/* Logo */}
        <div className={`
          relative z-10 transition-all duration-1000 ease-out
          ${stage === 'glowing' ? 'drop-shadow-2xl' : ''}
        `}>
          <FlowXLogo 
            width={300} 
            height={103} 
            className={`
              transition-all duration-1000 ease-out
              ${stage === 'glowing' ? 'brightness-110 contrast-110' : ''}
            `}
          />
        </div>

        {/* Loading dots */}
        <div className={`
          absolute -bottom-16 left-1/2 transform -translate-x-1/2 
          flex gap-2 transition-opacity duration-500
          ${stage === 'entering' ? 'opacity-0' : 'opacity-100'}
        `}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <div className={`
        absolute bottom-8 left-1/2 transform -translate-x-1/2
        text-center transition-all duration-1000 delay-500
        ${stage === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        <p className="text-white/60 text-sm">
          by Luna Labs
        </p>
      </div>
    </div>
  );
};

export default SplashScreen; 