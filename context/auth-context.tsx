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

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state by checking auth status
  useEffect(() => {
    checkAuthStatus().finally(() => {
      setLoading(false);
    });
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

  const checkAuthStatus = async (): Promise<boolean> => {
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
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

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
      logout();
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

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, checkAuthStatus }}>
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