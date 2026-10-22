import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, RegistrationApplication, LocationInfo } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  quickSwitchRole: (roleOrUserId: UserRole | 'pending_chc' | 'rejected_fmc' | 'suspended' | string) => void;
  register: (params: {
    fullName: string;
    email: string;
    mobile: string;
    requestedRole: 'CHC' | 'FMC' | 'Farmer' | 'LivestockShop' | 'Inputstore';
    organizationName?: string;
    location: LocationInfo;
    roleSpecificData?: Record<string, any>;
    documents?: { type: string; docNumber?: string; fileName: string }[];
  }) => { success: boolean; user: User; application: RegistrationApplication; error?: string };
  hasPermission: (permission: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    // Sync with storage on mount
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const refreshUser = () => {
    if (currentUser) {
      const refreshed = userService.getUserById(currentUser.id);
      if (refreshed) {
        authService.setCurrentUser(refreshed);
        setCurrentUser(refreshed);
      }
    }
  };

  const login = (email: string, password?: string) => {
    const res = authService.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const quickSwitchRole = (role: UserRole | 'pending_chc' | 'rejected_fmc' | 'suspended') => {
    const switched = authService.quickSwitchUser(role);
    setCurrentUser(switched);
  };

  const register = (params: Parameters<AuthContextType['register']>[0]) => {
    return authService.registerSelf(params);
  };

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return authService.hasPermission(currentUser.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser && currentUser.accountStatus === 'active' && currentUser.approvalStatus === 'approved',
        login,
        logout,
        quickSwitchRole,
        register,
        hasPermission,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
