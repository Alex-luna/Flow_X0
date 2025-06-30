import React from 'react';

interface PentagonIconProps {
  className?: string;
}

const PentagonIcon: React.FC<PentagonIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L20 8L17 18H7L4 8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PentagonIcon; 