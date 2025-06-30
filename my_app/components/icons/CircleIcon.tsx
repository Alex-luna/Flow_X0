import React from 'react';

interface CircleIconProps {
  className?: string;
}

const CircleIcon: React.FC<CircleIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default CircleIcon; 