interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that allows routes to render.
 * Authentication is handled optimistically - we assume the user is authenticated
 * until proven otherwise by a 401 error from the API.
 * The HTTP interceptor will handle 401 errors and redirect to login automatically.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Allow the route to render - HTTP interceptor will handle 401 errors
  // and redirect to login when authentication is actually required
  return <>{children}</>;
}
