"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, getSupabaseUser, SupabaseUser } from "@/lib/supabase";

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  authType: "test" | "google";
  provider?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  testLogin: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing sessions
    const initializeAuth = async () => {
      try {
        // Check for test user in localStorage first
        const testUser = localStorage.getItem("testUser");
        if (testUser) {
          try {
            const parsedUser = JSON.parse(testUser);
            setUser(parsedUser);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Error parsing test user:", error);
            localStorage.removeItem("testUser");
          }
        }

        // Check for Supabase session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        } else if (session?.user) {
          const supabaseUser = getSupabaseUser(session);
          if (supabaseUser) {
            const user: User = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: supabaseUser.name,
              avatar: supabaseUser.avatar_url,
              authType: "google",
              provider: supabaseUser.provider,
            };
            setUser(user);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (event === "SIGNED_IN" && session?.user) {
        const supabaseUser = getSupabaseUser(session);
        if (supabaseUser) {
          const user: User = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.name,
            avatar: supabaseUser.avatar_url,
            authType: "google",
            provider: supabaseUser.provider,
          };
          setUser(user);
          // Remove test user if exists
          localStorage.removeItem("testUser");
        }
      } else if (event === "SIGNED_OUT") {
        // Only clear if it's a Google user being signed out
        if (user?.authType === "google") {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.authType]);

  // Test login function
  const testLogin = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check test credentials
      if (username === "test" && password === "1234") {
        const testUser: User = {
          id: "test-user-id",
          email: "test@admin.com",
          name: "Test Admin",
          avatar: "🧪",
          authType: "test",
        };

        setUser(testUser);
        localStorage.setItem("testUser", JSON.stringify(testUser));

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Invalid credentials. Use username "test" and password "1234"',
        };
      }
    } catch (error) {
      console.error("Test login error:", error);
      return {
        success: false,
        error: "An error occurred during login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google login error:", error);
        return {
          success: false,
          error: `Authentication failed: ${error.message}`,
        };
      }

      // Success - the auth state change listener will handle setting the user
      return { success: true };
    } catch (error) {
      console.error("Google login error:", error);
      return {
        success: false,
        error: "An error occurred during Google authentication",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (user?.authType === "google") {
        await supabase.auth.signOut();
      } else if (user?.authType === "test") {
        localStorage.removeItem("testUser");
      }
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      setUser(null);
      localStorage.removeItem("testUser");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    testLogin,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
