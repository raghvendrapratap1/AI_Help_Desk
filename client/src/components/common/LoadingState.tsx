import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  rows = 4
}) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center space-y-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-ping"></div>
        <div className="w-10 h-10 rounded-full border-3 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
      <div className="w-full max-w-2xl space-y-3 pt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-900/60 rounded-lg animate-pulse border border-slate-800/40" />
        ))}
      </div>
    </div>
  );
};
