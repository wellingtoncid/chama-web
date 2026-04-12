import { useEffect, useState } from 'react';
import { useProfileCompleteness } from '@/hooks/useDriverMatching';
import { 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Truck, 
  MapPin, 
  ShieldCheck,
  Camera,
  FileText,
  X
} from 'lucide-react';

const FIELD_ICONS: Record<string, React.ReactNode> = {
  name: <User size={16} />,
  bio: <FileText size={16} />,
  avatar: <Camera size={16} />,
  vehicle_type: <Truck size={16} />,
  body_type: <Truck size={16} />,
  location: <MapPin size={16} />,
  rntrc: <FileText size={16} />,
  verification: <ShieldCheck size={16} />
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome completo',
  bio: 'Biografia',
  avatar: 'Foto de perfil',
  vehicle_type: 'Tipo de veículo',
  body_type: 'Carroceria',
  location: 'Sua localização',
  rntrc: 'RNTRC',
  verification: 'Verificação'
};

interface ProfileCompletenessAlertProps {
  variant?: 'banner' | 'card' | 'inline';
  onDismiss?: () => void;
}

const DISMISS_KEY = '@ChamaFrete:profileAlertDismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function ProfileCompletenessAlert({ 
  variant = 'card',
  onDismiss 
}: ProfileCompletenessAlertProps) {
  const { completeness, checkCompleteness, loading, score, isComplete } = useProfileCompleteness();
  
  const [visible, setVisible] = useState(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const { timestamp } = JSON.parse(dismissed);
      if (Date.now() - timestamp < DISMISS_DURATION) {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    checkCompleteness();
  }, [checkCompleteness]);

  if (loading || !completeness || isComplete || !visible) {
    return null;
  }

  const missingCount = completeness.missing.length;
  const priorityFields = completeness.missing.slice(0, 3);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ timestamp: Date.now() }));
    onDismiss?.();
  };

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Complete seu perfil para encontrar fretes</p>
              <p className="text-xs text-white/80">
                {missingCount} informação{missingCount > 1 ? 's' : ''} pendente{missingCount > 1 ? 's' : ''}: {priorityFields.map(f => FIELD_LABELS[f]).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="/dashboard/perfil"
              className="px-4 py-2 bg-white text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors"
            >
              Completar
            </a>
            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <AlertTriangle size={16} />
        <span className="text-xs font-medium">
          Perfil {score}% completo
        </span>
        <span className="text-xs text-orange-500">
          • Faltam: {completeness.missing.map(f => FIELD_LABELS[f]).join(', ')}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase italic text-sm mb-1">
              Complete seu perfil
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Para ser encontrado por empresas, complete pelo menos 80% do seu perfil.
            </p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Progresso</span>
                <span className="font-bold text-orange-600">{score}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {completeness.missing.map((field) => (
                <div 
                  key={field}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  {FIELD_ICONS[field] || <CheckCircle2 size={14} className="text-orange-400" />}
                  <span>{FIELD_LABELS[field]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <a
        href="/dashboard/perfil"
        className="mt-4 w-full block text-center px-4 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase hover:bg-orange-600 transition-colors"
      >
        Completar Perfil Agora
      </a>
    </div>
  );
}
