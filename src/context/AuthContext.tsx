import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('@ChamaFrete:user');
    const savedToken = localStorage.getItem('@ChamaFrete:token');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  const login = (userData: User, newToken?: string) => {
    localStorage.setItem('@ChamaFrete:user', JSON.stringify(userData));
    setUser(userData);
    if (newToken) {
      localStorage.setItem('@ChamaFrete:token', newToken);
      setToken(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('@ChamaFrete:user');
    localStorage.removeItem('@ChamaFrete:token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};