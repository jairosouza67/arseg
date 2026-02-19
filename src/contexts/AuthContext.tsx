import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";
import type { Session } from "@supabase/supabase-js";
import { debugLog, debugWarn, debugError } from "@/lib/debugUtils";

type AppRole = Enums<"app_role"> | 'seller' | null;

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

  // Função centralizada para carregar role do usuário
  // Usa o SDK do Supabase com o cliente autenticado (JWT do usuário na sessão)
  const loadUserRole = useCallback(async (userId: string): Promise<AppRole> => {
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 8000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        debugLog("⏰ Aborting role request due to timeout");
        controller.abort();
      }, TIMEOUT_MS);

      try {
        if (attempt > 0) {
          debugLog(`🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        debugLog("📊 Loading user role...");

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) {
          debugError("❌ Role fetch error:", error.message);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        if (data?.role) {
          debugLog("✅ Role found");
          return data.role as AppRole;
        }

        debugLog("⚠️ No role found in database");
        return null;
      } catch (err: any) {
        clearTimeout(timeoutId);

        const isAbortError = err.name === 'AbortError';
        debugError(`❌ Role fetch exception (attempt ${attempt + 1}):`, err.name);

        if (isAbortError || err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
          if (attempt < MAX_RETRIES) {
            debugLog("🔄 Will retry after error");
            continue;
          }
        }

        return null;
      }
    }
    return null;
  }, []);


  // Função para processar mudanças de sessão
  const handleSessionChange = useCallback(async (session: Session | null, event: string) => {
    debugLog("🔄 Processing session change:", { event, sessionId: session?.user?.id });

    // Evitar processamento duplicado da mesma sessão
    if (session?.user?.id === lastSessionId.current && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
      debugLog("⏭️ Skipping duplicate session processing");
      return;
    }

    // Evitar race condition: se já estamos carregando, aguardar
    if (isLoadingRole.current) {
      debugLog("⏳ Already loading role, skipping...");
      return;
    }

    if (!session?.user) {
      debugLog("⚠️ No session, clearing auth state");
      setUserId(null);
      setRole(null);
      setLoading(false);
      lastSessionId.current = null;
      return;
    }

    isLoadingRole.current = true;
    setLoading(true);
    lastSessionId.current = session.user.id;

    try {
      setUserId(session.user.id);
      debugLog("📊 Loading role for session...");
      const userRole = await loadUserRole(session.user.id);
      debugLog("✅ Role loaded");
      setRole(userRole);
    } catch (err) {
      debugError("❌ Error handling session change:", err);
      setRole(null);
    } finally {
      isLoadingRole.current = false;
      setLoading(false);
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
  const isSeller = role === "seller";
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
