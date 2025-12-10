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
  // Usando fetch nativo com AbortController para diagnóstico e timeout confiável
  const loadUserRole = useCallback(async (userId: string): Promise<AppRole> => {
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 8000; // 8 seconds timeout

    // Obter URL e chave do Supabase para fetch nativo
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("[TEMP DEBUG] ⏰ Aborting request due to timeout");
        controller.abort();
      }, TIMEOUT_MS);

      try {
        if (attempt > 0) {
          console.log(`[TEMP DEBUG] 🔄 Retry attempt ${attempt}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        console.log("[TEMP DEBUG] 📊 Loading role for user:", userId);
        console.log("[TEMP DEBUG] ⏱️ Query start time:", new Date().toISOString());
        console.log("[TEMP DEBUG] 🌐 Network status:", navigator.onLine ? "ONLINE" : "OFFLINE");

        const startTime = performance.now();

        // Usar fetch nativo para ter controle total do AbortController
        const url = `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${userId}`;
        console.log("[TEMP DEBUG] 🔗 Fetching URL:", url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const endTime = performance.now();
        console.log("[TEMP DEBUG] ⏱️ Fetch completed in:", (endTime - startTime).toFixed(2), "ms");
        console.log("[TEMP DEBUG] 📡 Response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[TEMP DEBUG] ❌ HTTP Error:", response.status, errorText);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const data = await response.json();
        console.log("[TEMP DEBUG] 📦 Response data:", data);

        // API retorna array, pegar primeiro item
        if (Array.isArray(data) && data.length > 0 && data[0]?.role) {
          console.log("[TEMP DEBUG] ✅ Role found:", data[0].role);
          return data[0].role as AppRole;
        }

        console.log("[TEMP DEBUG] ⚠️ No role found in database");
        return null;
      } catch (err: any) {
        clearTimeout(timeoutId);

        const isAbortError = err.name === 'AbortError';
        console.error(`[TEMP DEBUG] ❌ Exception (attempt ${attempt + 1}):`, {
          name: err.name,
          message: err.message,
          isAbortError
        });

        if (isAbortError || err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
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
