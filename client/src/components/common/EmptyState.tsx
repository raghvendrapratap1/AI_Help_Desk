import React from 'react';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no entries available right now.',
  actionLabel,
  onAction,
  icon = <Inbox className="w-10 h-10 text-slate-500" />
}) => {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center glass-panel rounded-2xl border border-slate-800/80">
      <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
