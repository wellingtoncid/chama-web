import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  dark?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, dark, className, ...props }, ref) => {
    return (
      <div className="w-full group">
        <label className={cn(
          'text-[10px] font-black uppercase tracking-widest mb-3 block ml-2 group-focus-within:text-orange-500 transition-colors',
          dark ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'
        )}>
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            {...props}
            className={cn(
              'w-full p-5 rounded-[1.5rem] font-bold outline-none transition-all',
              'bg-slate-50 border-2 border-transparent text-slate-700 placeholder:text-slate-300',
              'focus:border-slate-200 focus:bg-white',
              'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600',
              'dark:focus:border-slate-700 dark:focus:bg-slate-800/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              dark && 'bg-white/5 border-white/5 text-white focus:bg-white/10',
              className,
            )}
          />

          {icon && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
