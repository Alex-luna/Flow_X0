import React from 'react';

interface ComposedBlockIconProps {
  base: React.ReactNode;
  overlay: React.ReactNode;
  size?: number;
}

export default function ComposedBlockIcon({ base, overlay, size = 50 }: ComposedBlockIconProps) {
  return (
    <div 
      className="relative"
      style={{ 
        width: size, 
        height: size * 1.15,
      }}
    >
      {/* Base SVG (ScreenIcon) - z-index mais baixo */}
      <div 
        className="absolute"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      >
        <div style={{ width: size, height: size * 1.15 }}>
          {base}
        </div>
      </div>
      
      {/* Overlay SVG (specific icon) - z-index mais alto */}
      <div 
        className="absolute"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.3,
          height: size * 0.3,
          zIndex: 2
        }}
      >
        <div style={{ width: size * 0.3, height: size * 0.3 }}>
          {overlay}
        </div>
      </div>
    </div>
  );
} 