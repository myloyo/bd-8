import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { type AuthContextType, type UserRole } from '../types/index';

const defaultContext: AuthContextType = {
  role: 'user', // Default role
  setRole: () => {}, // Placeholder function
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('user');

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
