import { ArrowLeft } from 'lucide-react';

interface ModuleDetailLayoutProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  isActive: boolean;
  onBack: () => void;
  toggle?: {
    isActive: boolean;
    onToggle: (activate: boolean) => void;
    toggling: boolean;
    label: string;
    subtitle: string;
    inactiveText?: string;
    color: string;
  };
  children: React.ReactNode;
}

export default function ModuleDetailLayout({
  title,
  icon,
  description,
  isActive,
  onBack,
  toggle,
  children,
}: ModuleDetailLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-emerald-500' : 'bg-orange-500'
            }`}>
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic">{title}</h2>
              <p className="text-slate-300 text-sm font-medium">{description}</p>
            </div>
          </div>

          {isActive && (
            <span className="ml-auto text-[10px] font-black px-3 py-1.5 rounded-lg uppercase bg-emerald-500/20 text-emerald-300">
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* Toggle */}
      {toggle && (
        <div className={`bg-gradient-to-r ${toggle.color} rounded-[2rem] p-6 text-white`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-black uppercase italic text-lg">
                  {toggle.isActive ? `${toggle.label} Ativo` : `${toggle.label} Inativo`}
                </h3>
                <p className={`${toggle.color === 'from-purple-600' ? 'text-purple-100' : toggle.color === 'from-amber-600' ? 'text-amber-100' : 'text-white/70'} text-sm`}>
                  {toggle.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggle.onToggle(!toggle.isActive)}
              disabled={toggle.toggling}
              className={`relative w-16 h-8 rounded-full p-1 transition-all duration-300 ${
                toggle.isActive ? 'bg-white/30' : 'bg-white/20'
              } disabled:opacity-50`}
            >
              <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ${
                toggle.isActive ? 'left-8' : 'left-0.5'
              }`} />
            </button>
          </div>

          {!toggle.isActive && toggle.inactiveText && (
            <p className="text-white/60 text-xs mt-4">{toggle.inactiveText}</p>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}
