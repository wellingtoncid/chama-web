import { MessageCircle, Users, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import GroupCard from "../shared/GroupCard";

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link?: string;
  image_url?: string;
  description?: string;
  is_public: number;
  category: string;
  category_id: number | null;
  category_name: string;
  category_color?: string;
  clicks_count: number;
  group_admin_name?: string;
  is_premium: number;
  is_verified: number;
  status: string;
}

const CommunityGroups = () => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const DISPLAY_LIMIT = 4; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('list-groups', { 
          params: { 
            home: true
          } 
        });

        const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        setGroups(data);

      } catch (error) {
        console.error("Erro na busca de grupos:", error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section id="grupos" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        
        {/* Header da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4">
            <MessageCircle className="w-4 h-4" />
            Comunidades
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
            Grupos por <span className="text-blue-600">Região</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Receba cargas exclusivas direto no seu celular.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-400 font-medium text-sm">Carregando...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {groups.slice(0, DISPLAY_LIMIT).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>Nenhum grupo disponível no momento.</p>
          </div>
        )}

        {/* Call to Action Final */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-blue-600 dark:text-blue-400 font-bold uppercase text-sm tracking-wider hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl px-8 py-6 transition-all"
            onClick={() => navigate('/comunidade')}
          >
            Ver todas as comunidades
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityGroups;
