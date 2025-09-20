'use client';

import { LoadingStateProps } from '@/types/ui';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '@/utils/cn';

const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  message = 'Please wait while we process your request',
  progress,
  className = ''
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <LoadingSpinner size="lg" className="text-accent-600 mb-4" />
      
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          {title}
        </h3>
        <p className="text-primary-600 mb-4">
          {message}
        </p>
        
        {progress !== undefined && (
          <div className="w-full max-w-xs mx-auto">
            <div className="bg-primary-100 rounded-full h-2 mb-2">
              <div 
                className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-primary-500">{progress}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;