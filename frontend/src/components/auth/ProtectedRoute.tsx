import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const mustChangePassword = useAuthStore((s) => s.user?.mustChangePassword);
  const location = useLocation();

  if (!_hasHydrated) return null; // Wait for localStorage rehydration
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Force redirect to /change-password if the user's password must be changed,
  // UNLESS they are already on the change-password page (to avoid infinite loop).
  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
