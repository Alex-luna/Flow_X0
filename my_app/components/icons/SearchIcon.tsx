import React from 'react';

interface SearchIconProps {
  className?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SearchIcon; 