import React, { createContext, useContext, useState, useEffect } from "react";
import { deriveClientPasswordHash } from "../services/crypto";

export type UserRole = "viewer" | "editor" | "reviewer" | "administrator";

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  facilityId: string;
}

interface AuthContextType {
  user: UserProfile | null;
  mode: "demo" | "authenticated";
  login: (username: string, password: string, turnstileToken?: string) => Promise<boolean>;
  quickDemoLogin: (role: UserRole) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<"demo" | "authenticated">("demo");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check saved session in local storage for demo state
  useEffect(() => {
    const saved = localStorage.getItem("maintenance_user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setMode(parsed.mode);
      } catch {
        localStorage.removeItem("maintenance_user_session");
      }
    }
  }, []);

  const login = async (username: string, password: string, turnstileToken?: string): Promise<boolean> => {
    try {
      const derivedPasswordHash = await deriveClientPasswordHash(password, username);

      // Attempt Worker login endpoint
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          derivedPasswordHash,
          turnstileToken,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMode("authenticated");
        localStorage.setItem("maintenance_user_session", JSON.stringify({ user: data.user, mode: "authenticated" }));
        setIsLoginModalOpen(false);
        return true;
      }

      // If backend Worker is not deployed yet or returns error, simulate demo login
      if (res.status === 404 || res.status === 503) {
        quickDemoLogin("administrator");
        return true;
      }

      return false;
    } catch {
      // In static demo deployment on GitHub Pages without Worker proxy, fallback to demo login
      quickDemoLogin("administrator");
      return true;
    }
  };

  const quickDemoLogin = (role: UserRole) => {
    const demoUser: UserProfile = {
      id: `USR-DEMO-${role.toUpperCase()}`,
      username: `demo_${role}`,
      role,
      facilityId: "FAC-DEMO-001",
    };
    setUser(demoUser);
    setMode("demo");
    localStorage.setItem("maintenance_user_session", JSON.stringify({ user: demoUser, mode: "demo" }));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setMode("demo");
    localStorage.removeItem("maintenance_user_session");
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        mode,
        login,
        quickDemoLogin,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
