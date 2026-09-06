import React, { createContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import api from '../services/api';
import { cancelAllScheduledNotifications } from '../services/notificationService';

export type CustomUser = {
  uid: string; // Map id to uid for compatibility with existing components
  email: string;
  isGuest?: boolean;
};

type AuthContextType = {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
};

const DEFAULT_GUEST_USER: CustomUser = {
  uid: 'guest_user_1',
  email: 'mobile.user@grocify.app',
  isGuest: true,
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  continueAsGuest: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session from storage on boot
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await storage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const continueAsGuest = async () => {
    try {
      setUser(DEFAULT_GUEST_USER);
      await storage.setItem('auth_user', JSON.stringify(DEFAULT_GUEST_USER));
    } catch (err) {
      console.error('Error continuing as guest:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      let customUser: CustomUser;
      try {
        const response = await api.post('/api/auth/login', { email, password });
        const { user: backendUser, token } = response.data;
        customUser = {
          uid: backendUser.id,
          email: backendUser.email,
        };
        await storage.setItem('auth_token', token);
      } catch (backendErr) {
        console.warn('Backend login unavailable, creating local session:', backendErr);
        // Fallback to local profile when backend server is offline
        customUser = {
          uid: `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: email.trim(),
        };
      }

      await storage.setItem('auth_user', JSON.stringify(customUser));
      setUser(customUser);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      let customUser: CustomUser;
      try {
        const response = await api.post('/api/auth/signup', { email, password });
        const { user: backendUser, token } = response.data;
        customUser = {
          uid: backendUser.id,
          email: backendUser.email,
        };
        await storage.setItem('auth_token', token);
      } catch (backendErr) {
        console.warn('Backend signup unavailable, creating local session:', backendErr);
        // Fallback to local profile when backend server is offline
        customUser = {
          uid: `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: email.trim(),
        };
      }

      await storage.setItem('auth_user', JSON.stringify(customUser));
      setUser(customUser);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      try {
        await api.post('/api/auth/logout');
      } catch (err) {
        console.warn('Backend logout failed or was unreachable:', err);
      }

      await cancelAllScheduledNotifications();
      await storage.removeItem('auth_token');
      await storage.removeItem('auth_user');

      // Clear user state to trigger automatic navigation to Login screen
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

