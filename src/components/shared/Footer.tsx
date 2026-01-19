import { Truck, Instagram, Linkedin, Facebook, Youtube, MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Coluna 1: Logo e Social */}
          <div className="lg:col-span-4 space-y-8">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-[900] tracking-tighter text-slate-900 uppercase">
                Chama<span className="text-orange-500 italic">Frete</span>
              </span>
            </a>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
              A plataforma líder em conexão logística no Brasil. Transformando a quilometragem em lucro para motoristas e empresas desde 2024.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all shadow-sm">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Colunas de Links Estilo Portal */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">Plataforma</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Buscar Fretes</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Para Motoristas</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Para Empresas</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Planos Premium</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">Institucional</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Blog e Notícias</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Carreiras</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors tracking-tight">Contato</a></li>
            </ul>
          </div>

          {/* Coluna Contato */}
          <div className="lg:col-span-4 space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">Atendimento VIP</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><Mail size={16}/></div>
                <span className="text-sm font-bold tracking-tight group-hover:text-slate-900">suporte@chamafrete.com.br</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><Phone size={16}/></div>
                <span className="text-sm font-bold tracking-tight group-hover:text-slate-900">0800 591 0000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direitos Autorais Sérios */}
        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Chama Frete - Soluções em Logística LTDA. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;