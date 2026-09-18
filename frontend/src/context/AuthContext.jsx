import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const savedToken = authService.getToken();
      if (savedToken) {
        try {
          const res = await authService.verifySession();
          setUser(res.user);
        } catch (err) {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    checkAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
