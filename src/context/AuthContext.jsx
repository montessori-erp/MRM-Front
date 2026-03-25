import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    // Check if a token exists before calling the backend
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await auth.me();
      // Adjust based on your API response structure (response.user or response.data.user)
      setUser(response.user || response);
    } catch (error) {
      console.error("Load user error:", error);
      // If token is invalid/expired, clear it
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Listen for custom logout events from other parts of the app
  useEffect(() => {
    const onLogout = () => {
      localStorage.removeItem('token');
      setUser(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (email, password) => {
    const response = await auth.login(email, password);

    // 1. Save token to localStorage immediately so axios interceptors can use it
    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    // 2. Update user state
    const userData = response.user || response;
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await auth.register(data);

    // Save token if registration automatically logs the user in
    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    const userData = response.user || response;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.warn("Logout API call failed, but clearing local session anyway.", err);
    } finally {
      // 3. Always clear local storage and state on logout
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}