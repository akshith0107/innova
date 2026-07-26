import React from 'react';

interface ChromeIconProps {
  className?: string;
  size?: number;
}

export const ChromeIcon: React.FC<ChromeIconProps> = ({ className = "w-5 h-5", size }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="none" />
      {/* Outer Red Top Segment */}
      <path
        d="M12 2C7.3 2 3.38 5.23 2.37 9.57L7.6 18.63C7.22 17.5 7 16.28 7 15C7 11.23 9.4 8.02 12.8 6.81L12 2Z"
        fill="#EA4335"
      />
      {/* Outer Green Bottom Right Segment */}
      <path
        d="M12 22C16.7 22 20.62 18.77 21.63 14.43L16.4 5.37C16.78 6.5 17 7.72 17 9C17 12.77 14.6 15.98 11.2 17.19L12 22Z"
        fill="#34A853"
      />
      {/* Outer Yellow Bottom Left Segment */}
      <path
        d="M2.37 9.57C1.49 11.87 1.49 14.39 2.37 16.69L11.2 17.19C9.72 16.66 8.5 15.61 7.72 14.24L2.37 9.57Z"
        fill="#FBBC05"
      />
      {/* Top Red Arc */}
      <path
        d="M12 2C15.84 2 19.16 4.15 20.89 7.37L12 12V2Z"
        fill="#EA4335"
      />
      {/* Right Green Arc */}
      <path
        d="M22 12C22 15.84 19.85 19.16 16.63 20.89L12 12H22Z"
        fill="#34A853"
      />
      {/* Left Yellow Arc */}
      <path
        d="M2 12C2 8.16 4.15 4.84 7.37 3.11L12 12H2Z"
        fill="#FBBC05"
      />
      {/* Inner Blue Circle */}
      <circle cx="12" cy="12" r="4.5" fill="#4285F4" />
      {/* Center White Ring Accent */}
      <circle cx="12" cy="12" r="5.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.9" />
    </svg>
  );
};
