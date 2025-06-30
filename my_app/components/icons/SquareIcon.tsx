import React from 'react';

interface SquareIconProps {
  className?: string;
}

const SquareIcon: React.FC<SquareIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        rx="2"
      />
    </svg>
  );
};

export default SquareIcon; 