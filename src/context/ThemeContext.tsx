import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    // 1) Prioriza preferência explícita do usuário (@ChamaFrete:theme)
    const savedAppTheme = localStorage.getItem('@ChamaFrete:theme');
    if (savedAppTheme) {
      return savedAppTheme === 'dark';
    }

    // 2) Fallback para chave genérica antiga, se existir
    const legacyTheme = localStorage.getItem('theme');
    if (legacyTheme) {
      return legacyTheme === 'dark';
    }

    // 3) Fallback final: preferência do sistema (apenas no primeiro acesso)
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light'); // Garante que não haja conflito
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('@ChamaFrete:theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('@ChamaFrete:theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);