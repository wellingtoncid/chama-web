import { Truck, Instagram, Linkedin, Facebook, Youtube, MapPin, Mail, Phone } from "lucide-react";
import AdCard from "../shared/AdCard"; // Certifique-se de que o caminho está correto

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 pt-16 pb-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* --- SEÇÃO DE ANÚNCIOS (FOOTER ADS) --- */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Parceiros Oficiais</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdCard position="footer" variant="horizontal" />
            <AdCard position="footer" variant="horizontal" />
            <AdCard position="footer" variant="horizontal" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Coluna 1: Logo e Social */}
          <div className="lg:col-span-4 space-y-8">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-[900] tracking-tighter text-slate-900 dark:text-white uppercase">
                Chama<span className="text-orange-500 italic">Frete</span>
              </span>
            </a>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              A plataforma líder em conexão logística no Brasil. Transformando a quilometragem em lucro para motoristas e empresas desde 2024.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Facebook, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500 dark:hover:border-orange-400 transition-all shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Colunas de Links */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Plataforma</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Buscar Fretes</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Para Motoristas</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Para Empresas</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Planos Premium</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Institucional</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Blog e Notícias</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Carreiras</a></li>
              <li><a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors tracking-tight">Contato</a></li>
            </ul>
          </div>

          {/* Coluna Contato - Card VIP */}
          <div className="lg:col-span-4 space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Atendimento VIP</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500 transition-colors">
                  <Mail size={16}/>
                </div>
                <span className="text-sm font-bold tracking-tight group-hover:text-slate-900 dark:group-hover:text-white">suporte@chamafrete.com.br</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500 transition-colors">
                  <Phone size={16}/>
                </div>
                <span className="text-sm font-bold tracking-tight group-hover:text-slate-900 dark:group-hover:text-white">0800 591 0000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            © 2026 Chama Frete - Soluções em Logística LTDA. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;