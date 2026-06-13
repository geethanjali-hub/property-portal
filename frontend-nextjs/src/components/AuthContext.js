"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser && storedUser !== 'undefined') {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('user');
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const finalUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    try {
      const response = await axios.post(`${finalUrl}/auth/login`, credentials);
      const access_token = response.data.access_token;
      // Handle both flattened and nested response formats
      const userData = response.data.user || {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        phone: response.data.phone,
        role: response.data.role
      };
      
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (formData) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
    const finalUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    try {
      const response = await axios.post(`${finalUrl}/auth/register`, formData);
      const access_token = response.data.access_token;
      const userData = response.data.user || {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        phone: response.data.phone,
        role: response.data.role
      };
      
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
