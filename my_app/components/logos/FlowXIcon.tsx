"use client";

import React from 'react';

interface FlowXIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const FlowXIcon: React.FC<FlowXIconProps> = ({ 
  width = 176, 
  height = 171, 
  className = "" 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 176 171" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Red X elements */}
      <path 
        d="M128.5 29H95.5L106.5 78.5L65 135.5H72.5L150.5 29H143L131.5 44.5L128.5 29Z" 
        fill="#D73120"
      />
      <path 
        d="M91 116.5L169 11H176L137 64.5L148.5 118H116L111.5 99.5L98.5 116.5H91Z" 
        fill="#D73120"
      />
      
      {/* F text */}
      <path 
        d="M7.81995 125V36.3071H37.362V75.9415H64.6315V93.386H37.362V125H7.81995ZM57.5468 65.7154V54.0189H42.0406V36.3071H87.0888V65.7154H57.5468Z" 
        fill="white"
      />
    </svg>
  );
};

export default FlowXIcon; 