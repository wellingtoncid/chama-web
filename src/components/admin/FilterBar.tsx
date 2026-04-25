import React from 'react';
import { Search } from 'lucide-react';

interface FilterTab {
  key: string;
  label: string;
}

interface FilterBarProps {
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  tabs?: FilterTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  children?: React.ReactNode;
}

export default function FilterBar({ 
  search, 
  tabs, 
  activeTab, 
  onTabChange,
  children 
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row gap-4">
        {search && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={search.placeholder || 'Buscar...'}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead]"
            />
          </div>
        )}
        
        {tabs && tabs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#1f4ead] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}