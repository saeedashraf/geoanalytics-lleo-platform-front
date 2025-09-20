'use client';

import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  const spinnerClasses = cn(
    'animate-spin border-2 border-current border-t-transparent rounded-full',
    sizes[size],
    className
  );
  
  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;