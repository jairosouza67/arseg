import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";
import { useAuthHealthMonitor } from "@/hooks/useAuthHealthMonitor";

type AppRole = Enums<"app_role"> | 'seller' | null;

interface AuthContextType {
  userId: string | null;
  role: AppRole;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    console.log("🔵 AuthProvider: Initializing...");
    let isMounted = true;

    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("🔄 AuthProvider load() - getUser result:", { user: user?.id, email: user?.email });

        if (!isMounted) return;

        if (!user) {
          setUserId(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Query user_roles table
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("📊 AuthProvider Query user_roles:", { 
          userId: user.id, 
          data, 
          error,
          errorDetails: error ? JSON.stringify(error) : null,
          hasData: !!data,
          roleValue: data?.role
        });

        if (!isMounted) {
          console.log("⚠️ Component unmounted before role query completed");
          return;
        }

        if (error) {
          console.error("❌ Erro ao buscar papel do usuário:", error);
          setRole(null);
        } else if (data?.role) {
          console.log("✅ Role encontrada:", data.role);
          setRole(data.role as AppRole);
        } else {
          console.log("⚠️ Nenhuma role encontrada, tentando inferir...");

          // Fallback: try to infer seller from quotes
          try {
            const userEmail = user.email ?? null;
            let quotesRes: any;
            if (userEmail) {
              quotesRes = await supabase
                .from("quotes")
                .select("id")
                .or(`created_by.eq.${user.id},customer_email.eq.${userEmail}`)
                .limit(1);
            } else {
              quotesRes = await supabase
                .from("quotes")
                .select("id")
                .eq("created_by", user.id)
                .limit(1);
            }

            if (!quotesRes.error && quotesRes.data && quotesRes.data.length > 0) {
              setRole("seller");
            } else {
              setRole(null);
            }
          } catch (err) {
            console.error("Erro ao inferir papel do usuário:", err);
            setRole(null);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar papel do usuário:", err);
        setRole(null);
      } finally {
        if (isMounted) {
          console.log("✅ AuthProvider load(): Setting loading to false");
          setLoading(false);
          setInitialLoadComplete(true);
        } else {
          console.log("⚠️ Component unmounted, not setting loading to false");
        }
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 AuthProvider onAuthStateChange:", { event, userId: session?.user?.id, email: session?.user?.email, initialLoadComplete });

      // Ignorar eventos durante a carga inicial
      if (!initialLoadComplete && event !== 'SIGNED_OUT') {
        console.log("⏭️ Ignoring onAuthStateChange during initial load");
        return;
      }

      if (!isMounted) {
        console.log("⚠️ Component unmounted during onAuthStateChange");
        return;
      }

      if (!session?.user) {
        console.log("⚠️ Session lost or signed out, event:", event);
        setUserId(null);
        setRole(null);
        setLoading(false);
      } else {
        setUserId(session.user.id);
        setLoading(true);

        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Erro ao atualizar papel do usuário:", error);
            setRole(null);
          } else if (data?.role) {
            console.log("✅ onAuthStateChange: Role encontrada:", data.role);
            setRole(data.role as AppRole);
          } else {
            // Inferir seller
            try {
              const userEmail = session.user.email ?? null;
              let quotesRes: any;
              if (userEmail) {
                quotesRes = await supabase
                  .from("quotes")
                  .select("id")
                  .or(`created_by.eq.${session.user.id},customer_email.eq.${userEmail}`)
                  .limit(1);
              } else {
                quotesRes = await supabase
                  .from("quotes")
                  .select("id")
                  .eq("created_by", session.user.id)
                  .limit(1);
              }

              if (!quotesRes.error && quotesRes.data && quotesRes.data.length > 0) {
                setRole("seller");
              } else {
                setRole(null);
              }
            } catch (err) {
              console.error("Erro ao inferir papel do usuário:", err);
              setRole(null);
            }
          }
        } catch (err) {
          console.error("Erro ao lidar com onAuthStateChange:", err);
          setRole(null);
        } finally {
          if (isMounted) {
            console.log("✅ onAuthStateChange: Setting loading to false");
            setLoading(false);
          }
        }
      }
    });

    return () => {
      console.log("🧹 AuthProvider cleanup");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const isUser = !role;
  const isAuthenticated = !!userId;

  // Monitor de saúde da autenticação
  const { isHealthy, failureCount } = useAuthHealthMonitor(userId, role, isAuthenticated);

  // Alertar no console se houver problemas
  useEffect(() => {
    if (!isHealthy && failureCount > 0) {
      console.warn(`⚠️ Auth health degraded: ${failureCount} consecutive failures`);
    }
  }, [isHealthy, failureCount]);

  console.log("🔍 AuthProvider state:", 
    "userId:", userId,
    "role:", role,
    "isAdmin:", isAdmin,
    "isSeller:", isSeller,
    "isAuthenticated:", isAuthenticated,
    "loading:", loading,
    "health:", isHealthy ? "✅" : "⚠️"
  );

  return (
    <AuthContext.Provider value={{ userId, role, isAdmin, isSeller, isUser, isAuthenticated, loading }}>
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
