import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "landlord" | "tenant" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  landlord: {
    id: "l1",
    name: "Nguyễn Văn An",
    email: "chutro@demo.com",
    phone: "0901234567",
    role: "landlord",
  },
  tenant: {
    id: "t1",
    name: "Trần Thị Bình",
    email: "nguoithue@demo.com",
    phone: "0912345678",
    role: "tenant",
  },
  admin: {
    id: "a1",
    name: "Admin Hệ Thống",
    email: "admin@demo.com",
    phone: "0900000000",
    role: "admin",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string, role: UserRole) => {
    setUser(DEMO_USERS[role]);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
