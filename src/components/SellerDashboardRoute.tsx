import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useAuthRole } from "@/hooks/useAuthRole";

interface SellerDashboardRouteProps {
  children: React.ReactNode;
  allowAdminAlso?: boolean;
}

export const SellerDashboardRoute = ({
  children,
  allowAdminAlso = true,
}: SellerDashboardRouteProps) => {
  const { isSeller, isAdmin, isAuthenticated, loading } = useAuthRole();
  const location = useLocation();

  if (loading) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isSeller || (allowAdminAlso && isAdmin)) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};
