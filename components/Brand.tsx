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
      <Logo size={size} variant={variant} />
      <div className="flex flex-col items-start leading-none">
        <div className={`font-logo tracking-tight ${isWhite ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: size * 0.55 }}>
          <span className={isWhite ? 'text-white' : 'text-brand-teal'}>ielts</span>
          <span className="font-bold">hub</span>
        </div>
      </div>
    </div>
  );
};
