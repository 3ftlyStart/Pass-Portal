
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'primary' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, variant = 'primary' }) => {
  const color = variant === 'primary' ? '#4d40ff' : '#ffffff';
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Chat Bubble Body */}
        <path
          d="M 50 15 C 30.67 15 15 30.67 15 50 C 15 69.33 30.67 85 50 85 C 57.5 85 64.5 82.5 70 78.5 L 85 85 L 78.5 70 C 82.5 64.5 85 57.5 85 50 C 85 30.67 69.33 15 50 15 Z"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Smiley Mouth */}
        <path
          d="M 35 55 Q 50 70 65 55"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
