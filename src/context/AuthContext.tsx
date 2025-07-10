import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'company_admin' | 'affiliate_admin' | 'affiliate_user';
  affiliateId?: string;
}

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  role: 'company_admin' | 'affiliate_admin' | 'affiliate_user';
  affiliateId?: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (token && isAuthenticated === 'true') {
        try {
          // Verify the token is still valid
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // Set the token on the API instance
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Set user from decoded token
            setUser({
              id: decoded.userId,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
              affiliateId: decoded.affiliateId
            });
          }
        } catch (error) {
          // For demo purposes, create a mock user if token decode fails
          const mockUser = {
            id: '2',
            name: 'Affiliate Admin',
            email: 'admin@affiliate.com',
            role: 'affiliate_admin' as const,
            affiliateId: 'aff1'
          };
          setUser(mockUser);
        }
      } else if (isAuthenticated === 'true') {
        // Create a mock user for demo purposes
        const mockUser = {
          id: '2',
          name: 'Affiliate Admin',
          email: 'admin@affiliate.com',
          role: 'affiliate_admin' as const,
          affiliateId: 'aff1'
        };
        setUser(mockUser);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock authentication for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine user role based on email for demo
      let mockUser;
      if (email.includes('affiliate')) {
        mockUser = {
          id: '2',
          name: 'Affiliate Admin',
          email: 'admin@affiliate.com',
          role: 'affiliate_admin' as const,
          affiliateId: 'aff1'
        };
      } else {
        mockUser = {
          id: '1',
          name: 'Company Admin',
          email: 'admin@company.com',
          role: 'company_admin' as const
        };
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      setUser(mockUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};