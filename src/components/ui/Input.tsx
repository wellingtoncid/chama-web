import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input = ({ label, icon, ...props }: InputProps) => {
  return (
    <div className="w-full group">
      {/* Label com suporte a Dark Mode */}
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2 group-focus-within:text-orange-500 transition-colors">
        {label}
      </label>
      
      <div className="relative">
        <input 
          {...props}
          className={`
            w-full p-5 rounded-[1.5rem] font-bold outline-none transition-all
            /* Modo Claro */
            bg-slate-50 border-2 border-transparent text-slate-700 placeholder:text-slate-300
            focus:border-slate-200 focus:bg-white
            /* Modo Escuro (Tailwind v4) */
            dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600
            dark:focus:border-slate-700 dark:focus:bg-slate-800/50
            /* Estado Desabilitado */
            disabled:opacity-50 disabled:cursor-not-allowed
            ${props.className || ''}
          `}
        />
        
        {/* Ícone opcional (ex: Hash, Calendar, etc) */}
        {icon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-orange-500 transition-colors">
            {React.cloneElement(icon as React.ReactElement, { size: 18 } as any)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;