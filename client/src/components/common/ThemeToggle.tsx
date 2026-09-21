import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
      className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all border flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-400/40 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-teal-500/40 shadow-sm'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 animate-in spin-in-180 duration-300 stroke-[2.2]" />
      ) : (
        <Moon className="w-4 h-4 animate-in spin-in-180 duration-300 stroke-[2.2] text-teal-600" />
      )}
    </button>
  );
};
