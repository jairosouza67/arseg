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
  const initialLoadComplete = useRef(false);
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
    debugLog("🔄 Processing session change:", { event, sessionId: session?.user?.id });

    if (!session?.user) {
      debugLog("⚠️ No session, clearing auth state");
      setUserId(null);
      setRole(null);
      setLoading(false);
      lastSessionId.current = null;
      return;
    }

    // TOKEN_REFRESHED and any other event for the same already-loaded user:
    // silently acknowledge the new session without changing loading state or
    // re-fetching the role — prevents white screen on tab return.
    if (
      session.user.id === lastSessionId.current &&
      event !== 'SIGNED_IN' &&
      event !== 'SIGNED_OUT'
    ) {
      debugLog("⏭️ Silent session update (no role reload needed):", event);
      setUserId(session.user.id);
      return;
    }

    // Full role load: SIGNED_IN or first time seeing this user
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

    const initialize = async () => {
      try {
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          debugError("❌ Error getting initial session:", error);
          setLoading(false);
          initialLoadComplete.current = true;
          return;
        }

        debugLog("🔄 Initial session:", { hasUser: !!session?.user });

        if (!isMounted) return;

        if (session?.user) {
          await handleSessionChange(session, 'INITIAL_LOAD');
        } else {
          setUserId(null);
          setRole(null);
          setLoading(false);
        }
      } catch (err) {
        debugError("❌ Error initializing auth:", err);
        setUserId(null);
        setRole(null);
        setLoading(false);
      } finally {
        if (isMounted) {
          initialLoadComplete.current = true;
        }
      }
    };

    initialize();

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog("🔔 Auth state changed:", { event, hasUser: !!session?.user });

      if (!isMounted) {
        debugLog("⚠️ Component unmounted, ignoring state change");
        return;
      }

      // Ignorar eventos durante carga inicial, exceto SIGNED_IN e SIGNED_OUT
      if (!initialLoadComplete.current && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
        debugLog("⏭️ Skipping event during initial load:", event);
        return;
      }

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
