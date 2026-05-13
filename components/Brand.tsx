import React from 'react';
import { Logo } from './Logo';

interface BrandProps {
  size?: number;
  textColor?: string;
  className?: string;
  variant?: 'primary' | 'white';
}

export const Brand: React.FC<BrandProps> = ({ 
  size = 40, 
  variant = 'primary',
  className = ''
}) => {
  const isWhite = variant === 'white';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col items-start leading-[0.85] select-none">
        <div 
          className={`font-logo tracking-tight ${isWhite ? 'text-white' : 'text-slate-950'}`} 
          style={{ fontSize: size * 0.45, fontFamily: "'Audiowide', cursive" }}
        >
          ielts
        </div>
        <div 
          className={`font-logo tracking-tight ${isWhite ? 'text-white' : 'text-slate-950'}`} 
          style={{ fontSize: size * 0.45, fontFamily: "'Audiowide', cursive" }}
        >
          hub
        </div>
      </div>
      <Logo size={size * 1.1} variant={variant} />
    </div>
  );
};
