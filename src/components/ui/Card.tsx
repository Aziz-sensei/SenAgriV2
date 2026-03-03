import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div 
      className={cn('bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
