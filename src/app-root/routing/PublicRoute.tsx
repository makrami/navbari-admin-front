import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute component for public pages like login.
 * Only redirects to dashboard if explicitly authenticated (after successful login).
 * Since we use optimistic auth, we check if user data exists to determine
 * if it's a real authentication vs just the default optimistic state.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Only redirect if explicitly authenticated (has user data from successful login)
  // This prevents redirecting when auth state is just optimistic default
  if (isAuthenticated && user) {
    // If already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
