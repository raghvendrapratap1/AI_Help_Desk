import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
}

export interface Clinic {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  operatingHours: string;
  doctors: Array<{ name: string; title: string; specialty: string; experience: string }>;
  services: string[];
  knowledgeBaseSnippet?: string;
  stats?: {
    totalLeads: number;
    newLeads: number;
    bookedAppointments: number;
  };
}

interface AuthContextType {
  user: User | null;
  clinic: Clinic | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  fetchClinicInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('indore_dental_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClinicInfo = async () => {
    try {
      const res = await API.get('/clinic');
      if (res.data.success) {
        setClinic(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch clinic data:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setClinic(res.data.data.clinic);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      } else {
        await fetchClinicInfo();
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password = 'admin123') => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData, clinic: clinicData } = res.data.data;
        localStorage.setItem('indore_dental_token', newToken);
        setToken(newToken);
        setUser(userData);
        setClinic(clinicData);
      } else {
        throw new Error(res.data.error || 'Login failed');
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('indore_dental_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, clinic, token, loading, login, logout, fetchClinicInfo }}>
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
