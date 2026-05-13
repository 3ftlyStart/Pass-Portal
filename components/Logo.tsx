
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'primary' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, variant = 'primary' }) => {
  const color = variant === 'primary' ? '#020617' : '#ffffff'; // Slate-950
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Chat Bubble Body - Rounder with specific tail */}
        <path
          d="M 50 12 C 29.01 12 12 29.01 12 50 C 12 58.5 14.8 66.3 19.5 72.6 L 15 88 L 31.2 82.5 C 36.8 86 43.2 88 50 88 C 70.99 88 88 70.99 88 50 C 88 29.01 70.99 12 50 12 Z"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Eyes - Solid and slightly higher */}
        <circle cx="35" cy="45" r="5" fill={color} />
        <circle cx="65" cy="45" r="5" fill={color} />
        {/* Smiley Mouth - Expressive curve */}
        <path
          d="M 28 58 C 35 72 65 72 72 58"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Smile ending "ticks" */}
        <path d="M 25 56 L 31 59" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M 75 56 L 69 59" stroke={color} strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
