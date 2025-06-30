import React from 'react';

interface HexagonIconProps {
  className?: string;
}

const HexagonIcon: React.FC<HexagonIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 3H7L2 12L7 21H17L22 12L17 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HexagonIcon; 