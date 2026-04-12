import { useState, useEffect } from 'react';
import { useGeocoding } from '@/hooks/useDriverMatching';
import { 
  MapPin, 
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LocationUpdaterProps {
  onSuccess?: () => void;
}

export default function LocationUpdater({ onSuccess }: LocationUpdaterProps) {
  const { geocodeCep, updateLocation, loading } = useGeocoding();
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<{
    lat: number;
    lng: number;
    display_name: string;
  } | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const formatCep = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 8);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setAddress(null);
    setStatus('idle');
  };

  const handleSearch = async () => {
    if (cep.length !== 8) {
      setErrorMsg('CEP deve ter 8 dígitos');
      setStatus('error');
      return;
    }

    setStatus('searching');
    setErrorMsg('');
    
    const result = await geocodeCep(cep);
    
    if (result) {
      setAddress(result);
      setStatus('success');
    } else {
      setErrorMsg('CEP não encontrado');
      setStatus('error');
    }
  };

  const handleSave = async () => {
    if (!address) return;

    // Extract city and state from display_name
    const parts = address.display_name.split(',');
    let city = '';
    let state = '';
    
    // Try to extract city/state from address parts
    if (parts.length >= 2) {
      // Usually: "Street, Neighborhood, City, State, Country"
      const cityPart = parts[parts.length - 3]?.trim() || '';
      const statePart = parts[parts.length - 4]?.trim() || '';
      
      if (statePart && statePart.length === 2) {
        state = statePart;
        city = cityPart;
      }
    }

    const success = await updateLocation(address.lat, address.lng, city, state, cep);
    
    if (success) {
      onSuccess?.();
    } else {
      setErrorMsg('Erro ao salvar localização');
      setStatus('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <MapPin size={20} className="text-orange-600" />
        </div>
        <div>
          <h3 className="font-black uppercase italic text-sm">
            Localização da Base
          </h3>
          <p className="text-xs text-slate-500">
            Informe seu CEP para definir sua região de atuação
          </p>
        </div>
      </div>

      {/* CEP Input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
            onChange={handleCepChange}
            onKeyPress={handleKeyPress}
            placeholder="00000-000"
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            maxLength={9}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={cep.length !== 8 || loading}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && status === 'searching' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          Buscar
        </button>
      </div>

      {/* Status Messages */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Address Found */}
      {status === 'success' && address && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-green-800 mb-1">
                  Endereço encontrado!
                </p>
                <p className="text-xs text-green-600 line-clamp-2">
                  {address.display_name}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            Salvar Localização
          </button>
        </div>
      )}

      {/* Help Text */}
      {status === 'idle' && (
        <p className="text-xs text-slate-400 text-center">
          Sua localização ajuda empresas a encontrarem você para fretes na sua região.
        </p>
      )}
    </div>
  );
}
