import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    // Check if a token exists before even trying to call auth.me()
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await auth.me();
      // Adjust this based on your API response structure 
      // (usually it's response.data.user or just response.user)
      setUser(response.user || response); 
    } catch (error) {
      console.error("Load user error:", error);
      localStorage.removeItem('token'); // Clear invalid token
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Listen for custom logout events
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
    
    // CRITICAL FIX: Save the token to localStorage
    // Ensure your backend returns the token in the login response
    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    setUser(response.user || response);
    return response.user || response;
  };

  const register = async (data) => {
    const response = await auth.register(data);
    
    // Save token if registration also logs the user in
    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    setUser(response.user || response);
    return response.user || response;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local data even if API call fails
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





