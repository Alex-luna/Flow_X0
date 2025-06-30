import React from 'react';

interface DiamondIconProps {
  className?: string;
}

const DiamondIcon: React.FC<DiamondIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L20 12L12 22L4 12L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DiamondIcon; 