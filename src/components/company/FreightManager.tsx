import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Package, Loader2, Zap, Trash2, Edit3, 
  Truck, Search
} from 'lucide-react';
import { api } from '../../api/api';
import CheckoutModal from './CheckoutModal';

export default function FreightManager({ user }: any) {
  const navigate = useNavigate();
  const [myFreights, setMyFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFreights = async () => {
    try {
      setLoading(true);
      
      /**
       * CORREÇÃO 1: Rota amigável.
       * O 404 ocorria porque o PHP espera /list-my-freights e não /?endpoint=...
       * O user_id não precisa ir na URL pois o PHP o extrai do Token (Bearer).
       */
      const res = await api.get('/list-my-freights');
      
      // Ajuste para pegar os dados do padrão de resposta do seu Controller { success: true, data: [...] }
      const data = res.data.data || [];
      setMyFreights(data);
    } catch (e) {
      console.error("Erro ao carregar cargas reais do banco:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user?.id) fetchFreights(); 
  }, [user?.id]);

  /**
   * CORREÇÃO 2: Mapeamento de campos.
   * Seu banco usa 'origin_city', 'dest_city' e 'product'.
   */
  const filteredFreights = myFreights.filter(f => 
    f.origin_city?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.dest_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">
            Gestão de <span className="text-orange-500">Cargas</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Administre suas publicações no marketplace</p>
        </div>
        <button 
          onClick={() => navigate('/novo-frete')}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic flex items-center gap-3 shadow-xl hover:bg-orange-500 transition-all group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" /> 
          Nova Publicação
        </button>
      </div>

      {/* BUSCA */}
      <div className="relative max-w-md mx-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por cidade ou produto..."
          className="w-full bg-white border border-slate-100 p-4 pl-12 rounded-[1.5rem] outline-none focus:border-orange-500 transition-all font-bold text-slate-600 text-xs uppercase"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acessando Banco de Dados...</p>
          </div>
        ) : filteredFreights.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Truck size={40} />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhuma carga ativa encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredFreights.map((f: any) => (
              <div key={f.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                <div className="flex items-center gap-6">
                  {/* FEATURED ICON */}
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${Number(f.is_featured) === 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-100'}`}>
                    {Number(f.is_featured) === 1 ? <Zap size={24} fill="currentColor" /> : <Package size={24} />}
                  </div>

                  <div>
                    {/* CIDADES ORIGEM -> DESTINO */}
                    <h4 className="font-black text-slate-800 uppercase italic text-lg leading-tight">
                      {f.origin_city} <span className="text-orange-500 mx-1">→</span> {f.dest_city}
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase italic tracking-tighter">
                        {f.product || 'Carga Geral'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                        {f.weight} TON • R$ {f.price}
                      </span>
                      {/* MÉTRICA DE CLIQUES VINDA DO REPO */}
                      <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg uppercase italic">
                        {f.click_count || 0} CLIQUES
                      </span>
                    </div>
                  </div>
                </div>

                {/* AÇÕES */}
                <div className="flex items-center gap-3">
                  {Number(f.is_featured) !== 1 && (
                    <button 
                      onClick={() => { setSelectedFreightId(f.id); setShowCheckout(true); }}
                      className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm"
                    >
                      Impulsionar
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/novo-frete', { state: { editData: f } })} 
                    className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    className="p-4 bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCheckout && selectedFreightId !== null && (
        <CheckoutModal 
          freightId={selectedFreightId} 
          onClose={() => {
            setShowCheckout(false);
            setSelectedFreightId(null);
          }}
          onSuccess={() => {
            setShowCheckout(false);
            setSelectedFreightId(null);
            fetchFreights();
          }} 
          plans={[]} 
        />
      )}
    </div>
  );
}