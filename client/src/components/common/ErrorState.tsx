import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please try again.',
  onRetry
}) => {
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center bg-rose-950/20 border border-rose-800/40 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-rose-900/30 border border-rose-700/50 flex items-center justify-center mb-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-base font-semibold text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-rose-300/80 max-w-md mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-800/60 hover:bg-rose-700 text-rose-100 font-medium text-xs transition-colors border border-rose-600/50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};
