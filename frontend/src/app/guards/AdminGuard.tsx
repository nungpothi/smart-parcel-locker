import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { mockRole } from "../stores/auth.store";

type GuardProps = {
  children: ReactNode;
};

export const AdminGuard = ({ children }: GuardProps) => {
  const role = mockRole;

  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};

export default AdminGuard;
