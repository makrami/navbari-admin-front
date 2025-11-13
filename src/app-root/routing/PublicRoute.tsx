import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // If already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
