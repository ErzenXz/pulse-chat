"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  image?: string;
}

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state by checking auth status
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://apis.erzen.tk/v1/auth/info', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const userData = await response.json();
        setUser(userData);
        setToken(localStorage.getItem('accessToken'));
      } catch (error) {
        console.error('Error during auth check:', error);
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!token) return;

    // Refresh token every 15 minutes
    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 9 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [token]);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('https://apis.erzen.tk/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://auth.erzen.tk?return_to=${currentUrl}`;
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Redirect to home page
    router.push('/');
    
    // Show logout toast
    toast.success('Logged out successfully');
  };

  const updateUser = (user: User) => {
    setUser(user);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login: (token: string) => {
      setToken(token);
      localStorage.setItem('accessToken', token);
    },
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};