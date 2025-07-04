import React from 'react';

export default function ScreenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      width="105" 
      height="135" 
      viewBox="0 0 105 135" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="none"
      {...props}
    >
      <g clipPath="url(#clip0)">
        {/* Main screen body */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M5.25 134.5C3.89117 134.5 2.58785 133.961 1.62607 133.001C0.6643 132.041 0.122649 130.739 0.12 129.38V14.5H104.5V129.38C104.5 130.739 103.961 132.042 103.001 133.004C102.041 133.966 100.739 134.507 99.38 134.51L5.25 134.5Z" 
          fill="white"
        />
        
        {/* Screen border */}
        <path 
          d="M104 15V129.38C104 130.606 103.514 131.782 102.647 132.65C101.781 133.518 100.606 134.007 99.38 134.01H5.25C4.02205 134.01 2.84439 133.522 1.9761 132.654C1.1078 131.786 0.62 130.608 0.62 129.38V15H104ZM105 14H0V129.38C-1.16967e-06 130.119 0.145695 130.85 0.428752 131.533C0.711808 132.215 1.12667 132.835 1.64959 133.357C2.17252 133.879 2.79324 134.293 3.47625 134.575C4.15925 134.857 4.89113 135.001 5.25 135H99.38C100.119 135.001 100.851 134.857 101.534 134.575C102.217 134.293 102.837 133.879 103.36 133.357C103.883 132.835 104.298 132.215 104.581 131.533C104.864 130.85 105.01 130.119 105.01 129.38V14H105Z" 
          fill="#C6CBD5"
        />
        
        {/* Top header */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M0.12 14.5V5.25C0.12 3.88944 0.66048 2.5846 1.62254 1.62254C2.5846 0.66048 3.88944 0.12 5.25 0.12H99.38C100.741 0.12 102.045 0.66048 103.007 1.62254C103.97 2.5846 104.51 3.88944 104.51 5.25V14.5H0.12Z" 
          fill="#E6EAED"
        />
        
        {/* Header border */}
        <path 
          d="M99.38 0.62001C100.606 0.62266 101.781 1.11163 102.647 1.97963C103.514 2.84764 104 4.02379 104 5.25001V14H0.62V5.25001C0.62 4.02206 1.1078 2.8444 1.9761 1.9761C2.84439 1.10781 4.02205 0.62001 5.25 0.62001H99.38ZM99.38 8.91348e-06H5.25C4.51029 -0.00130848 3.77759 0.143417 3.09394 0.425884C2.41028 0.708351 1.78911 1.123 1.26605 1.64606C0.743 2.16912 0.328344 2.79029 0.045876 3.47394C-0.236591 4.1576 -0.381316 4.8903 0.38 5.25001V15H105V5.25001C105.001 4.51114 104.857 3.77926 104.575 3.09626C104.293 2.41325 103.879 1.79253 103.357 1.2696C102.835 0.746677 102.215 0.331817 101.533 0.048761C100.85 -0.234296 100.119 7.7438e-06 99.38 8.91348e-06Z" 
          fill="#C6CBD5"
        />
        
        {/* Traffic light buttons */}
        <circle cx="10" cy="7.5" r="2" fill="#FF6259"/>
        <circle cx="16" cy="7.5" r="2" fill="#FFBD2D"/>
        <circle cx="22" cy="7.5" r="2" fill="#2BCA41"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="105" height="135" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
} 