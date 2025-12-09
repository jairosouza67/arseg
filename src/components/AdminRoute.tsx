import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useEffect } from "react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated, userId, role } = useAuthRole();
  const location = useLocation();

  useEffect(() => {
    console.log("🛡️ AdminRoute check:", { 
      isAdmin, 
      loading, 
      isAuthenticated, 
      userId, 
      role,
      path: location.pathname 
    });
  }, [isAdmin, loading, isAuthenticated, userId, role, location.pathname]);

  // Aguardar carregamento
  if (loading) {
    console.log("⏳ AdminRoute: Loading auth state...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Verificar autenticação
  if (!isAuthenticated) {
    console.log("❌ AdminRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permissão de admin
  if (!isAdmin) {
    console.log("❌ AdminRoute: Not admin (role:", role, "), redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ AdminRoute: Access granted");
  return <>{children}</>;
};
