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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col items-start leading-[0.9]">
        <div className={`font-logo tracking-tight ${isWhite ? 'text-white' : 'text-brand-teal'}`} style={{ fontSize: size * 0.5 }}>
          ielts
        </div>
        <div className={`font-logo font-bold tracking-tight ${isWhite ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: size * 0.5 }}>
          hub
        </div>
      </div>
      <Logo size={size} variant={variant} />
    </div>
  );
};
