'use client';

import { forwardRef } from 'react';
import { ButtonProps } from '@/types/ui';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';

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
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
    
    const variants = {
      primary: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg hover:shadow-xl focus:ring-accent-500',
      secondary: 'bg-primary-100 hover:bg-primary-200 text-primary-900 focus:ring-primary-500',
      outline: 'border-2 border-accent-500 text-accent-600 hover:bg-accent-50 focus:ring-accent-500',
      ghost: 'text-primary-700 hover:bg-primary-100 focus:ring-primary-500',
      success: 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg focus:ring-success-500',
      warning: 'bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white shadow-lg focus:ring-warning-500',
      error: 'bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg focus:ring-error-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      widthClass,
      className
    );
    
    const handleClick = () => {
      if (!disabled && !loading && onClick) {
        onClick();
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
        {loading && (
          <LoadingSpinner size="sm" className="mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;