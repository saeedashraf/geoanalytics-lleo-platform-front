'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false, 
    fullWidth = false, 
    className = '', 
    onClick, 
    type = 'button',
    ...props 
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center font-semibold rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-4 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-95 transform hover:scale-105
      shadow-lg hover:shadow-xl
      relative overflow-hidden
      group
    `;
    
    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800
        hover:from-blue-700 hover:via-purple-700 hover:to-blue-900
        text-white shadow-blue-500/25 hover:shadow-blue-500/40
        focus:ring-blue-500/50
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
      `,
      secondary: `
        bg-gradient-to-r from-slate-100 to-slate-200
        hover:from-slate-200 hover:to-slate-300
        text-slate-800 shadow-slate-500/20 hover:shadow-slate-500/30
        focus:ring-slate-500/50 border border-slate-300
      `,
      outline: `
        border-2 border-blue-500 text-blue-600 bg-transparent
        hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700
        focus:ring-blue-500/50 shadow-blue-500/10 hover:shadow-blue-500/20
      `,
      ghost: `
        text-slate-700 bg-transparent hover:bg-slate-100
        focus:ring-slate-500/50 shadow-none hover:shadow-md
      `,
      success: `
        bg-gradient-to-r from-emerald-500 to-teal-600
        hover:from-emerald-600 hover:to-teal-700
        text-white shadow-emerald-500/25 hover:shadow-emerald-500/40
        focus:ring-emerald-500/50
      `,
      warning: `
        bg-gradient-to-r from-amber-500 to-orange-600
        hover:from-amber-600 hover:to-orange-700
        text-white shadow-amber-500/25 hover:shadow-amber-500/40
        focus:ring-amber-500/50
      `,
      error: `
        bg-gradient-to-r from-red-500 to-rose-600
        hover:from-red-600 hover:to-rose-700
        text-white shadow-red-500/25 hover:shadow-red-500/40
        focus:ring-red-500/50
      `,
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      widthClass,
      className
    );
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    };
    
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
        
        {/* Gradient overlay for primary button */}
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;