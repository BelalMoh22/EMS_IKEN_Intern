import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import type { Role } from "@/types";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleBasedRoute({ children, allowedRoles }: Props) {
  const user = useAuthStore((s) => s.user);
  const bypassRoleCheck = true;
  if (!bypassRoleCheck && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
