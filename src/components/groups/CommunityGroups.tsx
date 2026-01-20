import { MessageCircle, Users, ArrowRight, Lock, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api"; // Usando sua instância centralizada da API

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

  // Pegando o usuário do localStorage (padronizado com o sistema)
  const user = JSON.parse(localStorage.getItem("@ChamaFrete:user") || "null");
  const userId = user?.id || 0;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        // home=true filtra no PHP apenas is_visible_home = 1
        const response = await api.get(`?endpoint=groups&home=true&user_id=${userId}`);
        const data = response.data;
        setGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro na busca de grupos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userId]);

  return (
    <section id="grupos" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-[10px] font-black tracking-[0.2em] mb-6 uppercase">
            <MessageCircle className="w-4 h-4" />
            <span>Comunidade Oficial</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter italic uppercase">
            Grupos por <span className="text-[#1f4ead]">Região</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Nossos grupos são organizados por região e categoria para que você receba apenas as cargas que realmente interessam ao seu perfil.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#1f4ead] mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sincronizando grupos...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-[#1f4ead]/10 transition-all duration-500 group relative overflow-hidden"
              >
                {/* Tag de Categoria */}
                <div className="absolute top-8 right-8 bg-slate-100 group-hover:bg-blue-600 transition-colors duration-500 px-3 py-1 rounded-full">
                  <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase tracking-tighter">
                    {group.category}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-all duration-500 transform group-hover:rotate-6">
                    <MessageCircle className="w-8 h-8 text-green-600 group-hover:text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter leading-none">
                  {group.region_name}
                </h3>
                
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {group.member_count} Participantes
                    </span>
                  </div>
                </div>

                {/* Lógica de Botão com Link Protegido */}
                {group.invite_link === 'locked' ? (
                  <Button 
                    className="w-full h-16 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 font-black uppercase text-xs tracking-widest flex gap-3 border-none shadow-none"
                    onClick={() => navigate('/auth')}
                  >
                    <Lock className="w-4 h-4" />
                    Acesse para ver o link
                  </Button>
                ) : (
                  <a href={group.invite_link} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button className="w-full h-16 rounded-2xl bg-[#1f4ead] hover:bg-[#163a82] text-white font-black uppercase text-xs tracking-widest flex gap-3 shadow-xl shadow-blue-100 transition-all hover:-translate-y-1">
                      Entrar no Grupo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Call to Action Final */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-[#1f4ead] font-black uppercase text-sm tracking-[0.2em] hover:bg-[#1f4ead]/5 rounded-2xl px-10 py-8 transition-all"
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