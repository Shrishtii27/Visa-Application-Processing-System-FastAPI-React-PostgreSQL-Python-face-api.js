import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    // Only try if we have a token stored
    if (!tokenStorage.get()) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      // Token is invalid or expired — clear it
      tokenStorage.remove();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    tokenStorage.set(data.access_token);
    setUser(data.user);
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    // Don't auto-login — user will be redirected to login page
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
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
