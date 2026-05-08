
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'primary' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40, variant = 'primary' }) => {
  const color = variant === 'primary' ? '#0f172a' : '#ffffff'; // Slate-900 for a sharper brand look
  
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Chat Bubble Body with tail on bottom left */}
        <path
          d="M 50 15 C 30.67 15 15 30.67 15 50 C 15 57.5 17.3 64.3 21.2 69.8 L 15 85 L 30.2 78.8 C 35.7 82.7 42.6 85 50 85 C 69.33 85 85 69.33 85 50 C 85 30.67 69.33 15 50 15 Z"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Eyes */}
        <circle cx="38" cy="48" r="4" fill={color} />
        <circle cx="62" cy="48" r="4" fill={color} />
        {/* Smiley Mouth */}
        <path
          d="M 33 58 Q 50 75 67 58"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small "dimples" at smile ends */}
        <path d="M 31 56 L 35 60" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <path d="M 69 56 L 65 60" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
};
