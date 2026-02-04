import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Package, Loader2, Zap, Trash2, Edit3, 
  Truck, Search, AlertCircle, CheckCircle2, TrendingUp,
  ShieldAlert // 1. Importado
} from 'lucide-react';
import { api } from '../../api/api';
import CheckoutModal from './CheckoutModal';
import Swal from 'sweetalert2';

export default function FreightManager({ user }: any) {
  const navigate = useNavigate();
  const [myFreights, setMyFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Lógica centralizada de validação de acesso
  const checkAccessAndRun = (callback: () => void) => {
    const isApproved = user?.role === 'ADMIN' || user?.company_status === 'APPROVED';
    const hasProfile = !!user?.company_name && !!user?.document;

    if (!isApproved) {
      Swal.fire({
        title: '<span class="italic font-black">ACESSO RESTRITO</span>',
        html: `
          <div class="flex flex-col items-center gap-4">
            <div class="text-orange-500 animate-bounce mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m12 8-4 4"/><path d="m8 8 4 4"/></svg>
            </div>
            <p class="text-slate-500 font-medium">
              ${!hasProfile 
                ? "Você precisa completar os dados da sua empresa antes de publicar ou editar cargas." 
                : "Sua conta aguarda aprovação manual de um administrador."}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'IR PARA MEU PERFIL',
        cancelButtonText: 'FECHAR',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#cbd5e1',
        customClass: {
          popup: 'rounded-[2.5rem] p-10',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-4',
          cancelButton: 'rounded-xl font-black uppercase text-xs px-6 py-4'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard/profile');
        }
      });
      return;
    }
    callback();
  };

  const fetchFreights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/list-my-freights');
      const data = res.data.data || [];
      setMyFreights(data);
    } catch (e) {
      console.error("Erro ao carregar cargas:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Tem certeza que deseja excluir esta publicação?");
    if (!confirm) return;

    try {
      await api.delete(`/delete-freight/${id}`);
      setMyFreights(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      alert("Erro ao excluir carga.");
    }
  };

  useEffect(() => { 
    if (user?.id) fetchFreights(); 
  }, [user?.id]);

  const filteredFreights = myFreights.filter(f => 
    f.origin_city?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.dest_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">
            Gestão de <span className="text-orange-500">Cargas</span>
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {myFreights.length} Publicações Ativas
            </p>
            <span className="text-slate-200">|</span>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} fill="currentColor"/> {myFreights.filter(f => Number(f.is_featured) === 1).length} Em Destaque
            </p>
          </div>
        </div>
        
        {/* 3. Botão Novo com Validação */}
        <button 
          onClick={() => checkAccessAndRun(() => navigate('/novo-frete'))}
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
          placeholder="Filtrar por rota ou produto..."
          className="w-full bg-white border border-slate-100 p-4 pl-12 rounded-[1.5rem] outline-none focus:border-orange-500 transition-all font-bold text-slate-600 text-xs uppercase shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sincronizando com a base...</p>
          </div>
        ) : filteredFreights.length === 0 ? (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Truck size={40} />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhuma carga encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredFreights.map((f: any) => {
              const isFeatured = Number(f.is_featured) === 1;
              
              return (
                <div key={f.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                  <div className="flex items-center gap-6">
                    <div className={`relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isFeatured ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-400 border border-transparent group-hover:bg-white group-hover:border-slate-100'}`}>
                      {isFeatured ? <Zap size={24} fill="currentColor" /> : <Package size={24} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isFeatured && <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Top Listagem</span>}
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter italic">ID: #{f.id}</span>
                      </div>

                      <h4 className="font-black text-slate-800 uppercase italic text-lg leading-tight flex items-center gap-2">
                        {f.origin_city} <span className="text-orange-500">→</span> {f.dest_city}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-[9px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase italic tracking-tighter">
                          {f.product || 'Carga Geral'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">
                          {f.weight} TON • R$ {f.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isFeatured ? (
                      <button 
                        onClick={() => { setSelectedFreightId(f.id); setShowCheckout(true); }}
                        className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-sm flex items-center gap-2"
                      >
                        <Zap size={14} /> Impulsionar
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase italic border border-green-100">
                        <CheckCircle2 size={14} /> Ativo
                      </div>
                    )}
                    
                    {/* 4. Editar com Validação */}
                    <button 
                      onClick={() => checkAccessAndRun(() => navigate('/novo-frete', { state: { editData: f } }))} 
                      className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(f.id)}
                      className="p-4 bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CHECKOUT */}
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