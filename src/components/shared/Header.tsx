import { Truck, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo - Chama Frete */}
          <a href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="w-10 h-10 bg-[#1f4ead] rounded-xl flex items-center justify-center shadow-lg shadow-[#1f4ead]/20 group-hover:rotate-3 transition-all">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-[800] text-slate-900 tracking-tighter">
              Chama<span className="text-[#1f4ead]">Frete</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {["Fretes", "Grupos WhatsApp", "Parceiros", "Anuncie"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-semibold text-slate-600 hover:text-[#1f4ead] transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1f4ead] transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/login">
              <Button 
                variant="ghost" 
                className="font-bold text-slate-700 hover:text-[#1f4ead] hover:bg-[#1f4ead]/5 transition-all"
              >
                Entrar
              </Button>
            </a>
            <a href="/register">
              <Button 
                className="bg-[#1f4ead] hover:bg-[#163a82] text-white font-bold px-6 shadow-md hover:shadow-[#1f4ead]/30 hover:-translate-y-0.5 transition-all active:scale-95 flex gap-2"
              >
                Cadastrar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-slate-100 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-4">
              <a href="#fretes" className="text-slate-600 font-semibold py-2">Fretes</a>
              <a href="#grupos" className="text-slate-600 font-semibold py-2">Grupos WhatsApp</a>
              <a href="#parceiros" className="text-slate-600 font-semibold py-2">Parceiros</a>
              <a href="#anuncios" className="text-slate-600 font-semibold py-2">Anuncie</a>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                <a href="/login" className="w-full">
                  <Button variant="outline" className="w-full font-bold border-[#1f4ead] text-[#1f4ead]">Entrar</Button>
                </a>
                <a href="/register" className="w-full">
                  <Button className="w-full bg-[#1f4ead] font-bold shadow-lg shadow-[#1f4ead]/20">Cadastrar</Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;