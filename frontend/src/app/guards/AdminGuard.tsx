import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

type GuardProps = {
  children: ReactNode;
};

export const AdminGuard = ({ children }: GuardProps) => {
  const role = useAuthStore((state) => state.role);

  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};

export default AdminGuard;
