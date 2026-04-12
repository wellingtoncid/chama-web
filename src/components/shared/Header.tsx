import { Menu, X, Sun, Moon, ChevronDown, Building2, User } from "lucide-react";
import { Button } from "../ui/button";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdCard from "../shared/AdCard";
import logoImg from '../../assets/chama-thumb-blue-rbg.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('@ChamaFrete:theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('@ChamaFrete:theme', 'light');
    }
  };

  const navLinks = [
    { name: "Fretes", href: "/fretes" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Comunidades", href: "/comunidade" },
    { name: "Seja Visto", href: "/seja-visto" },
    { name: "Como Funciona", href: "/como-funciona" }
  ];

  // Auth state
  const { user, logout, loading } = useAuth();
  const displayName = user?.name ?? user?.displayName ?? user?.email ?? 'Usuário';
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUserMobileOpen, setIsUserMobileOpen] = useState(false);
  const desktopWrapperRef = useRef<HTMLDivElement | null>(null);
  const mobileWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    // Redireciona para a home após logout (evita ficar em página protegida)
    window.location.assign('/');
  };

  const goToProfile = () => {
    const slug = user?.slug ?? user?.id ?? 'me';
    // If there's a slug, navigate to perfil/slug, otherwise fallback
    navigate(`/perfil/${slug}`);
  };

  const goToSettings = () => {
    // Ajuste conforme as rotas internas; usar dashboard como configuracoes
    navigate('/dashboard');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (desktopWrapperRef.current && !desktopWrapperRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileWrapperRef.current && !mobileWrapperRef.current.contains(target)) {
        setIsUserMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* 1. TOP BAR (Variante 'bar') 
          Esta barra é injetada no topo. Se o AdCard não encontrar anúncio, ele mostrará o DEFAULT_AD ou pode tratar para sumir.
      */}
      <div className="w-full overflow-hidden shadow-sm relative z-10">
        <AdCard position="header" variant="bar" />
      </div>

      {/* 2. MENU PRINCIPAL */}
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18">
            
          {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02] outline-none">
              <div className="w-10 h-10 flex items-center justify-center transition-all group-hover:rotate-6">
                <img 
                  src={logoImg} 
                  alt="Logo ChamaFrete" 
                  className="w-full h-full object-contain" 
                />
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-3xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                  <span className="text-orange-500">Chama</span><span className="text-[#1f4ead]">Frete</span>
                </h1>
                <span className="text-[8.5px] font-[900] text-slate-400 dark:text-slate-500 uppercase tracking-[0.48em] ml-0.5 -mt-.5 leading-none">
                  A Coligação Logística
                </span>
              </div>
            </a>

            {/* Desktop Navigation - Ajustado para hover Laranja */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>

              {loading ? null : user ? (
                <div className="relative group inline-flex items-center gap-2" ref={desktopWrapperRef}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover"/>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <button
                    onClick={() => setIsUserMenuOpen((s) => !s)}
                    aria-expanded={isUserMenuOpen}
                    className="flex items-center gap-1 pl-1 pr-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">{displayName}</span>
                    <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-10 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md shadow-lg z-50" role="menu" aria-label="Opções do usuário">
                      <button onClick={() => { goToProfile(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Perfil</button>
                      <button onClick={() => { goToSettings(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">Configurações</button>
                      <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600">Sair</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a href="/login">
                    <Button
                      variant="ghost"
                      className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:text-[#1f4ead] dark:hover:text-white"
                    >Entrar</Button>
                  </a>
                  {/* Dropdown de Criar Conta - Melhorado */}
                  <div className="relative group">
                    <Button
                      className="bg-[#1f4ead] hover:bg-[#163a82] text-white font-black text-[10px] uppercase tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-blue-500/10 transition-all flex gap-2"
                    >
                      Criar Conta
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    </Button>

                    {/* O 'invisible' e 'opacity-0' ajudam na performance da animação */}
                    <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all p-2 z-[60]">
                      {/* Item Motorista */}
                      <a href="/register?type=driver" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group/item">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover/item:bg-white dark:group-hover/item:bg-slate-700">
                          <User size={14} className="text-slate-500" />
                        </div>
                        <span className="text-[10px] font-bold uppercase dark:text-slate-200">Sou Motorista</span>
                      </a>
                      
                      {/* Item Empresa - Destaque em Azul */}
                      <a href="/register?type=company" className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group/item">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Building2 size={14} className="text-[#1f4ead]" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-[#1f4ead] dark:text-blue-400">Sou Empresa</span>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button onClick={toggleTheme} className="p-2 text-slate-500">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                className="p-2 text-slate-900 dark:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="lg:hidden py-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                <nav className="flex flex-col gap-5">
                  {navLinks.map((item) => (
                  <a 
                    key={item.name}
                    href={item.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-600 dark:text-slate-300 font-bold uppercase text-xs tracking-widest py-1"
                  >
                    {item.name}
                  </a>
                ))}
                
                { /* Mobile user options: hide login/signup when user is logged in */ }
                {!user && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <a href="/login" className="w-full">
                      <Button variant="outline" className="w-full font-black uppercase text-[10px] h-12 border-[#1f4ead] text-[#1f4ead]">Entrar</Button>
                    </a>
                    <a href="/register?type=company" className="w-full">
                      <Button className="w-full bg-[#1f4ead] font-black uppercase text-[10px] h-12">Sou Empresa</Button>
                    </a>
                  </div>
                )}
                {user && (
                  <div ref={mobileWrapperRef} className="px-4 py-2 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2" role="button" onClick={() => setIsUserMobileOpen(!isUserMobileOpen)} aria-expanded={isUserMobileOpen}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover"/>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">{displayName.charAt(0)}</span>
                      )}
                      <span className="font-bold text-sm">{displayName}</span>
                      <ChevronDown size={14} className="ml-auto" />
                    </div>
                    {isUserMobileOpen && (
                      <div className="mt-2 flex flex-col pl-6 space-y-1">
                        <button onClick={goToProfile} className="text-left w-full text-sm">Perfil</button>
                        <button onClick={goToSettings} className="text-left w-full text-sm">Configurações</button>
                        <button onClick={handleLogout} className="text-left w-full text-sm text-red-600">Sair</button>
                      </div>
                    )}
                  </div>
                )}
            </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
