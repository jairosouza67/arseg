import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useAuthRole } from "@/hooks/useAuthRole";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading, isAuthenticated } = useAuthRole();
  const location = useLocation();

  console.log("🛡️ AdminRoute check:", { isAdmin, loading, isAuthenticated, path: location.pathname });

  if (loading) {
    console.log("⏳ AdminRoute: Still loading...");
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

  if (!isAuthenticated || !isAdmin) {
    console.log("❌ AdminRoute: Access denied, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ AdminRoute: Access granted");
  return <>{children}</>;
};
