import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useAuthRole } from "@/hooks/useAuthRole";
import { useEffect } from "react";
import { debugLog } from "@/lib/debugUtils";

interface SellerDashboardRouteProps {
  children: React.ReactNode;
  allowAdminAlso?: boolean;
}

export const SellerDashboardRoute = ({
  children,
  allowAdminAlso = true,
}: SellerDashboardRouteProps) => {
  const { isSeller, isAdmin, isAuthenticated, loading, userId, role } = useAuthRole();
  const location = useLocation();

  useEffect(() => {
    debugLog("🛒 SellerDashboardRoute check:", { 
      isSeller, 
      isAdmin, 
      isAuthenticated, 
      loading, 
      userId,
      role,
      path: location.pathname 
    });
  }, [isSeller, isAdmin, isAuthenticated, loading, userId, role, location.pathname]);

  if (loading) {
    debugLog("⏳ SellerDashboardRoute: Loading auth state...");
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

  if (!isAuthenticated) {
    debugLog("❌ SellerDashboardRoute: Not authenticated");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isSeller || (allowAdminAlso && isAdmin)) {
    debugLog("✅ SellerDashboardRoute: Access granted");
    return <>{children}</>;
  }

  debugLog("❌ SellerDashboardRoute: Access denied, role:", role);
  return <Navigate to="/" replace />;
};
