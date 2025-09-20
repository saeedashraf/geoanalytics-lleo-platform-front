'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    hover = false, 
    glass = false, 
    padding = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const baseClasses = `
      rounded-2xl transition-all duration-300 ease-out
      relative overflow-hidden
    `;
    
    const variants = {
      default: `
        bg-white/90 backdrop-blur-sm
        border border-slate-200/60
        shadow-lg shadow-slate-900/5
        hover:shadow-xl hover:shadow-slate-900/10
      `,
      elevated: `
        bg-white
        shadow-2xl shadow-slate-900/10
        hover:shadow-3xl hover:shadow-slate-900/15
        border-0
      `,
      outlined: `
        bg-white/60 backdrop-blur-sm
        border-2 border-slate-300/60
        shadow-md shadow-slate-900/5
        hover:border-slate-400/80
      `,
      gradient: `
        bg-gradient-to-br from-white/95 via-slate-50/95 to-white/95
        backdrop-blur-md
        border border-white/20
        shadow-xl shadow-slate-900/10
        hover:shadow-2xl hover:shadow-slate-900/15
      `,
    };
    
    const glassClasses = glass ? `
      backdrop-blur-xl bg-white/10 
      border border-white/20
      shadow-2xl shadow-black/10
      before:absolute before:inset-0 
      before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none
    ` : '';
    
    const hoverClasses = hover ? `
      transform hover:scale-[1.02] hover:-translate-y-1
      cursor-pointer
      transition-all duration-300 ease-out
    ` : '';
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const cardClasses = cn(
      baseClasses,
      glass ? glassClasses : variants[variant],
      hoverClasses,
      paddingClasses[padding],
      className
    );
    
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {/* Gradient overlay for visual depth */}
        {!glass && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-100/20 pointer-events-none opacity-60" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Hover effect overlay */}
        {hover && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;