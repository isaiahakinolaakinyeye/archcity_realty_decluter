import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('declutter_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('declutter_token');
      const savedUser = localStorage.getItem('declutter_user');

      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.auth.me();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('declutter_user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.warn('Could not re-verify session with server, retaining local user state:', err);
        // If we have a saved user, retain their session so refreshes never log out
        if (!savedUser) {
          localStorage.removeItem('declutter_token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      localStorage.setItem('declutter_token', data.token);
      localStorage.setItem('declutter_user', JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('declutter_token');
    localStorage.removeItem('declutter_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isStaff: user?.role === 'STAFF',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
