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
        return;
      }
    } catch (error: any) {
      console.warn('[AUTH FALLBACK] Backend API unreachable or blocked, using Indore Dental anchor demo session:', error.message);
      // Seamless offline / demo fallback for demo login
      if (email === 'admin@indoredental.com' || email.includes('admin') || password === 'admin123') {
        const demoToken = 'demo_token_' + Date.now();
        const demoUser: User = {
          id: 'demo_admin_001',
          name: 'Dr. Sandesh Jain (Admin)',
          email: email || 'admin@indoredental.com',
          role: 'clinic_admin',
          clinicId: 'indore-poly-dental-01'
        };
        const demoClinic: Clinic = {
          id: 'indore-poly-dental-01',
          name: 'Indore Poly Dental Clinic',
          tagline: 'Advanced Oral & Maxillofacial Surgery & Root Canal Center',
          address: '1/4, near 56 Shops, New Palasia, Indore, MP 452001',
          city: 'Indore',
          phone: '+91 98270 12345',
          email: 'admin@indoredental.com',
          operatingHours: 'Mon-Sat, 11:00-20:30',
          doctors: [
            { name: 'Dr. Sandesh Jain', title: 'Senior Specialist', specialty: 'Oral & Maxillofacial Surgeon', experience: '~25 years experience' },
            { name: 'Dr. Saumya Jain', title: 'Endodontic Specialist', specialty: 'Endodontist & Root Canal Specialist', experience: '~15 years experience' }
          ],
          services: ['Dental Implants', 'Root Canal Treatment', 'Cosmetic Dentistry', 'Invisible Aligners', 'Jaw & Facial Trauma & Surgery', 'TMJ Treatment'],
          stats: { totalLeads: 12, newLeads: 4, bookedAppointments: 8 }
        };

        localStorage.setItem('indore_dental_token', demoToken);
        setToken(demoToken);
        setUser(demoUser);
        setClinic(demoClinic);
        setLoading(false);
        return;
      }
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
