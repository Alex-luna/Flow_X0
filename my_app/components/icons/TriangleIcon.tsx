import React from 'react';

interface TriangleIconProps {
  className?: string;
}

const TriangleIcon: React.FC<TriangleIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4L20 18H4L12 4Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TriangleIcon; 