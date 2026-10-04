"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  login as authLogin,
  signup as authSignup,
  loginAsDemo as authLoginAsDemo,
  logout as authLogout,
  getCurrentUser,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Handle redirects separately after auth state is set
  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === "/login";
    
    if (user && isLoginPage) {
      router.replace("/");
    } else if (!user && !isLoginPage) {
      router.replace("/login");
    }
  }, [user, loading, pathname, router]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authLogin(credentials);
    if (response.success && response.user) {
      setUser(response.user);
      router.push("/");
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const signup = async (credentials: SignupCredentials) => {
    const response = await authSignup(credentials);
    if (response.success && response.user) {
      setUser(response.user);
      router.push("/");
      return { success: true };
    }
    return { success: false, error: response.error };
  };

  const loginAsDemo = async () => {
    const response = await authLoginAsDemo();
    if (response.success && response.user) {
      setUser(response.user);
      router.push("/");
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginAsDemo,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
