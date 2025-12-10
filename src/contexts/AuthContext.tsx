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
  const loadUserRole = useCallback(async (userId: string): Promise<AppRole> => {
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 10000; // 10 seconds timeout

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[TEMP DEBUG] 🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
          // Exponential backoff: wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        console.log("[TEMP DEBUG] 📊 Loading role for user:", userId);
        console.log("[TEMP DEBUG] ⏱️ Query start time:", new Date().toISOString());

        const startTime = performance.now();

        // Criar timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Query timeout after ${TIMEOUT_MS / 1000}s`));
          }, TIMEOUT_MS);
        });

        // Query com timeout
        const queryPromise = supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        const result = await Promise.race([queryPromise, timeoutPromise]);
        const { data, error } = result as any;

        const endTime = performance.now();
        console.log("[TEMP DEBUG] ⏱️ Query completed in:", (endTime - startTime).toFixed(2), "ms");
        console.log("[TEMP DEBUG] Query result:", { data, error });

        // Check for network/offline errors (503 from SW or fetch errors)
        if (error?.message?.includes('offline') || error?.message?.includes('Network')) {
          console.warn("[TEMP DEBUG] ⚠️ Network error detected, will retry");
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        if (error) {
          console.error("[TEMP DEBUG] ❌ Error fetching user role:", error);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        if (data?.role) {
          console.log("[TEMP DEBUG] ✅ Role found:", data.role);
          return data.role as AppRole;
        }

        console.log("[TEMP DEBUG] ⚠️ No role found in database");
        return null;
      } catch (err: any) {
        console.error(`[TEMP DEBUG] ❌ Exception loading user role (attempt ${attempt + 1}):`, err);

        // If timeout or network error, retry
        if (err.message?.includes('timeout') || err.message?.includes('Network')) {
          if (attempt < MAX_RETRIES) {
            console.log("[TEMP DEBUG] 🔄 Will retry after error");
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
      console.log("[TEMP DEBUG] About to load role for:", session.user.id);
      const userRole = await loadUserRole(session.user.id);
      console.log("[TEMP DEBUG] Role loaded:", userRole);
      setRole(userRole);
      console.log("[TEMP DEBUG] Role set in state");
    } catch (err) {
      debugError("❌ Error handling session change:", err);
      setRole(null);
    } finally {
      isLoadingRole.current = false;
      setLoading(false);
    }
  }, [loadUserRole]);

  useEffect(() => {
    console.log("🔵 AuthProvider: Initializing...");
    let isMounted = true;

    const initialize = async () => {
      try {
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Error getting initial session:", error);
          setLoading(false);
          initialLoadComplete.current = true;
          return;
        }

        console.log("🔄 Initial session:", { userId: session?.user?.id, email: session?.user?.email });

        if (!isMounted) return;

        if (session?.user) {
          await handleSessionChange(session, 'INITIAL_LOAD');
        } else {
          setUserId(null);
          setRole(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error initializing auth:", err);
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
      console.log("🔔 Auth state changed:", { event, userId: session?.user?.id });

      if (!isMounted) {
        console.log("⚠️ Component unmounted, ignoring state change");
        return;
      }

      // Ignorar eventos durante carga inicial, exceto SIGNED_IN e SIGNED_OUT
      if (!initialLoadComplete.current && event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') {
        console.log("⏭️ Skipping event during initial load:", event);
        return;
      }

      await handleSessionChange(session, event);
    });

    return () => {
      console.log("🧹 AuthProvider cleanup");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const isUser = !role;
  const isAuthenticated = !!userId;

  // Log do estado atual
  useEffect(() => {
    console.log("🔍 AuthProvider state:",
      "userId:", userId,
      "role:", role,
      "isAdmin:", isAdmin,
      "isSeller:", isSeller,
      "isAuthenticated:", isAuthenticated,
      "loading:", loading
    );
  }, [userId, role, isAdmin, isSeller, isAuthenticated, loading]);

  // Função para forçar refresh da autenticação
  const refreshAuth = useCallback(async () => {
    console.log("🔄 Manually refreshing auth state...");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSessionChange(session, 'MANUAL_REFRESH');
    } catch (err) {
      console.error("❌ Error refreshing auth:", err);
    } finally {
      setLoading(false);
    }
  }, [handleSessionChange]);

  const signOut = async () => {
    console.log("👋 AuthProvider: Signing out...");
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUserId(null);
      setRole(null);
      // Force immediate state update
      initialLoadComplete.current = true;
    } catch (error) {
      console.error("Error signing out:", error);
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
