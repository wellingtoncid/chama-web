import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

interface MatchingButtonProps {
  freightId: number;
}

export default function MatchingButton({ freightId }: MatchingButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/encontrar-motoristas/${freightId}`)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-xs uppercase hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200"
    >
      <Users size={16} />
      Encontrar Motoristas
    </button>
  );
}

interface MatchingButtonCompactProps {
  freightId: number;
}

export function MatchingButtonCompact({ freightId }: MatchingButtonCompactProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/encontrar-motoristas/${freightId}`)}
      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg font-bold text-[10px] uppercase hover:bg-orange-200 transition-colors"
    >
      <Users size={12} />
      Matching
    </button>
  );
}
