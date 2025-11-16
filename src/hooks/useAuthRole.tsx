import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

type AppRole = Enums<"app_role"> | 'seller' | null;

interface UseAuthRoleResult {
  userId: string | null;
  role: AppRole;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthRole = (): UseAuthRoleResult => {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserId(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Primeiro tenta buscar role explícita na tabela `user_roles`
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("📊 Query user_roles:", { 
          userId: user.id, 
          data, 
          error,
          errorDetails: error ? JSON.stringify(error) : null
        });

        if (error) {
          console.error("❌ Erro ao buscar papel do usuário:", error);
          setRole(null);
        } else if (data?.role) {
          console.log("✅ Role encontrada:", data.role);
          setRole(data.role as AppRole);
        } else {
          console.log("⚠️ Nenhuma role encontrada, tentando inferir...");

          // Se não houver role explícita, tentamos inferir se é seller
          try {
            const userEmail = user.email ?? null;
            const quotesQuery = supabase.from("quotes").select("id");
            // Prefer created_by check; se email existir, também verificamos por customer_email
            let quotesRes: any;
            if (userEmail) {
              quotesRes = await (supabase as any)
                .from("quotes")
                .select("id")
                .or(`created_by.eq.${user.id},customer_email.eq.${userEmail}`)
                .limit(1);
            } else {
              quotesRes = await (supabase as any)
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
        setLoading(false);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
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
            setRole(data.role as AppRole);
          } else {
            // Inferir seller via orçamentos vinculados
            try {
              const userEmail = session.user.email ?? null;
              let quotesRes: any;
              if (userEmail) {
                quotesRes = await (supabase as any)
                  .from("quotes")
                  .select("id")
                  .or(`created_by.eq.${session.user.id},customer_email.eq.${userEmail}`)
                  .limit(1);
              } else {
                quotesRes = await (supabase as any)
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
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const isUser = !role; // Qualquer usuário sem role é considerado 'user'
  const isAuthenticated = !!userId;

  // Log temporário para debug
  console.log("🔍 useAuthRole DEBUG:", 
    "userId:", userId,
    "role:", role,
    "isAdmin:", isAdmin,
    "isSeller:", isSeller,
    "isAuthenticated:", isAuthenticated,
    "loading:", loading
  );

  return {
    userId,
    role,
    isAdmin,
    isSeller,
    isUser,
    isAuthenticated,
    loading,
  };
};
