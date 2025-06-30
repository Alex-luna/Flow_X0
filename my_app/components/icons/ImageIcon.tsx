import React from 'react';

export default function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="108" height="144" viewBox="0 0 108 144" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0)">
        {/* Lines below for text representation */}
        <path d="M16.692 104C16.692 103.47 16.9027 102.961 17.2778 102.586C17.6529 102.211 18.1616 102 18.692 102H89.4C89.9305 102 90.4392 102.211 90.8142 102.586C91.1893 102.961 91.4 103.47 91.4 104C91.4 104.53 91.1893 105.039 90.8142 105.414C90.4392 105.789 89.9305 106 89.4 106H18.692C18.1616 106 17.6529 105.789 17.2778 105.414C16.9027 105.039 16.692 104.53 16.692 104Z" fill="#A0AEC0"/>
        
        {/* Main image frame */}
        <rect x="36" y="38" width="36" height="36" rx="4" stroke="#A0AEC0" strokeWidth="2" fill="white"/>
        
        {/* Mountain/landscape icon inside the frame */}
        <path d="M40 66L46 56L52 63L58 53L68 66V68C68 69.1046 67.1046 70 66 70H42C40.8954 70 40 69.1046 40 68V66Z" fill="#A0AEC0"/>
        
        {/* Sun/circle in top corner */}
        <circle cx="44" cy="46" r="4" fill="#F59E0B"/>
        
        {/* Image corner indicator */}
        <path d="M64 44L68 44L68 48" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Image placeholder title */}
        <path d="M74.5 91H33.5C32.1193 91 31 92.1193 31 93.5C31 94.8807 32.1193 96 33.5 96H74.5C75.8807 96 77 94.8807 77 93.5C77 92.1193 75.8807 91 74.5 91Z" fill="#4A5568"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="108" height="144" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
} 