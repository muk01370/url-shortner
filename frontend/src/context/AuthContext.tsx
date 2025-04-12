import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Configure axios to use backend API URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      navigate('/');
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

const register = async (username: string, password: string) => {
    console.log('Register function called with:', { username, password });
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/signup', { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      navigate('/');
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
