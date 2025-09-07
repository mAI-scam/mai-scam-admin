import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for Supabase user
export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: string;
}

// Helper function to get user data from Supabase session
export const getSupabaseUser = (
  session: {
    user?: {
      email?: string;
      id: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    };
  } | null
): SupabaseUser | null => {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email || "",
    name:
      (session.user.user_metadata?.full_name as string) ||
      (session.user.user_metadata?.name as string) ||
      session.user.email?.split("@")[0] ||
      "User",
    avatar_url: session.user.user_metadata?.avatar_url as string | undefined,
    provider: (session.user.app_metadata?.provider as string) || "google",
  };
};
