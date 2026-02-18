import { MessageCircle, Users, ArrowRight, Lock, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api"; 

// Interface sincronizada com o banco de dados e o Admin
interface WhatsAppGroup {
  id: number;
  region_name: string;
  member_count: number;
  invite_link: string;
  is_public: number;
  category: string;
}

const CommunityGroups = () => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Constante para definir quantos grupos mostrar na Home
  const DISPLAY_LIMIT = 5; 

  const user = JSON.parse(localStorage.getItem("@ChamaFrete:user") || "null");
  const userId = user?.id || 0;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('list-groups', { 
          params: { 
            home: true,      // O axios transforma em &home=true
            user_id: userId  // O axios transforma em &user_id=...
          } 
        });

        // Se o seu backend retorna os dados dentro de uma propriedade 'data' ou direto no array:
        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        setGroups(data);

      } catch (error) {
        console.error("Erro na busca de grupos:", error);
        setGroups([]); // Evita que o estado fique sujo em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

  return (
    <section id="grupos" className="py-24 bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-500">
      <div className="container mx-auto px-4">
        
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-4 py-1.5 text-[10px] font-black tracking-[0.2em] mb-6 uppercase">
            <MessageCircle className="w-4 h-4" />
            <span>Comunidade Oficial</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter italic uppercase">
            Grupos por <span className="text-[#1f4ead] dark:text-blue-500">Região</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Receba cargas exclusivas direto no seu celular. Entre no grupo da sua região.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#1f4ead] dark:text-blue-500 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando grupos...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Mapeia apenas os primeiros 5 grupos */}
            {groups.slice(0, DISPLAY_LIMIT).map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-[#1f4ead]/10 transition-all duration-500 group relative overflow-hidden"
              >
                {/* ... (Conteúdo do card do grupo igual ao anterior) ... */}
                <div className="absolute top-8 right-8 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 transition-colors px-3 py-1 rounded-full">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 group-hover:text-white uppercase tracking-tighter">
                    {group.category}
                  </span>
                </div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-500 transition-all duration-500 transform group-hover:rotate-6">
                    <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400 group-hover:text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter leading-none">{group.region_name}</h3>
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">{group.member_count} Participantes</span>
                  </div>
                </div>
                {group.invite_link === 'locked' ? (
                  <Button className="w-full h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500" onClick={() => navigate('/auth')}>
                    <Lock className="w-4 h-4 mr-2" /> Acesse para ver
                  </Button>
                ) : (
                  <a href={group.invite_link} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-16 rounded-2xl bg-[#1f4ead] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 dark:shadow-none transition-all hover:-translate-y-1">
                      Entrar no Grupo <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                )}
              </div>
            ))}

            {/* CARD ESPECIAL: "VER TODOS" */}
            {groups.length > DISPLAY_LIMIT && (
              <div 
                onClick={() => navigate('/comunidade')}
                className="bg-blue-600 dark:bg-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-200 dark:shadow-none flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-all group border-4 border-white dark:border-slate-800"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-[1000] text-white uppercase italic leading-none mb-2">
                  +{groups.length - DISPLAY_LIMIT} GRUPOS
                </h3>
                <p className="text-blue-100 font-bold text-sm mb-8 uppercase tracking-widest">
                  Disponíveis na sua região
                </p>
                <div className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">
                  Ver Todos
                </div>
              </div>
            )}

          </div>
        )}

        {/* Call to Action Final */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-[#1f4ead] dark:text-blue-400 font-black uppercase text-sm tracking-[0.2em] hover:bg-[#1f4ead]/5 rounded-2xl px-10 py-8 transition-all"
            onClick={() => navigate('/comunidade')}
          >
            Explorar todas as regiões
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityGroups;