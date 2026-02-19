import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";
import type { Session } from "@supabase/supabase-js";
import { debugLog, debugWarn, debugError } from "@/lib/debugUtils";

type AppRole = Enums<"app_role"> | null;

interface AuthContextType {
  userId: string | null;
  role: AppRole;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const isLoadingRole = useRef(false);
  const lastSessionId = useRef<string | null>(null);
  const loadGeneration = useRef(0);

  // Função centralizada para carregar role do usuário (sem retries — falha rápida)
  const loadUserRole = useCallback(async (userId: string, generation: number): Promise<AppRole> => {
    if (loadGeneration.current !== generation) {
      debugLog("🚫 Role load cancelled (superseded by newer request)");
      return null;
    }

    debugLog("📊 Loading user role...");

    try {
      const queryPromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("⏰ Role request timeout")), 5000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        debugError("❌ Role fetch error:", error.message);
        return null;
      }

      if (data?.role) {
        debugLog("✅ Role found");
        return data.role as AppRole;
      }

      debugLog("⚠️ No role found in database");
      return null;
    } catch (err: any) {
      debugError("❌ Role fetch exception:", err.message);
      return null;
    }
  }, []);


  const handleSessionChange = useCallback(async (session: Session | null, event: string) => {
    debugLog("🔄 Processing session change:", { event, userId: session?.user?.id });

    if (!session?.user) {
      // No session — authoritative empty state (INITIAL_SESSION with null, SIGNED_OUT)
      setUserId(null);
      setRole(null);
      setLoading(false);
      lastSessionId.current = null;
      return;
    }

    // Same user, non-login event (TOKEN_REFRESHED, USER_UPDATED, etc.):
    // The JWT was silently renewed — no need to reload the role or flash loading.
    if (session.user.id === lastSessionId.current && event !== 'SIGNED_IN') {
      debugLog("⏭️ Silent session update:", event);
      return;
    }

    // Full role load: first time seeing this user OR explicit SIGNED_IN
    const generation = ++loadGeneration.current;
    setLoading(true);
    lastSessionId.current = session.user.id;
    setUserId(session.user.id);

    try {
      debugLog("📊 Loading role for session...");
      const userRole = await loadUserRole(session.user.id, generation);

      if (loadGeneration.current !== generation) {
        debugLog("🚫 Role result discarded (superseded)");
        return;
      }

      debugLog("✅ Role loaded:", userRole);
      setRole(userRole);
    } catch (err) {
      debugError("❌ Error handling session change:", err);
      setRole(null);
    } finally {
      if (loadGeneration.current === generation) {
        isLoadingRole.current = false;
        setLoading(false);
      }
    }
  }, [loadUserRole]);

  useEffect(() => {
    debugLog("🔵 AuthProvider: Initializing...");
    let isMounted = true;

    // Supabase v2 fires INITIAL_SESSION as the very first event with the
    // fully-resolved session (after any background token refresh).
    // Using onAuthStateChange alone avoids the race where getSession()
    // returns null before the refresh completes, which used to trigger
    // loading=false → redirect to /login on every page reload.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog("🔔 Auth state changed:", { event, hasUser: !!session?.user });
      if (!isMounted) return;
      await handleSessionChange(session, event);
    });

    return () => {
      debugLog("🧹 AuthProvider cleanup");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const isAdmin = role === "admin";
  const isSeller = role === "user";
  const isUser = !role;
  const isAuthenticated = !!userId;

  // Log do estado atual (apenas em desenvolvimento)
  useEffect(() => {
    debugLog("🔍 AuthProvider state:",
      "hasUser:", !!userId,
      "role:", role,
      "isAuthenticated:", isAuthenticated,
      "loading:", loading
    );
  }, [userId, role, isAdmin, isSeller, isAuthenticated, loading]);

  // Função para forçar refresh da autenticação
  const refreshAuth = useCallback(async () => {
    debugLog("🔄 Manually refreshing auth state...");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSessionChange(session, 'MANUAL_REFRESH');
    } catch (err) {
      debugError("❌ Error refreshing auth:", err);
    } finally {
      setLoading(false);
    }
  }, [handleSessionChange]);

  const signOut = async () => {
    debugLog("👋 AuthProvider: Signing out...");
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUserId(null);
      setRole(null);
      // Force immediate state update
      initialLoadComplete.current = true;
    } catch (error) {
      debugError("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userId, role, isAdmin, isSeller, isUser, isAuthenticated, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
