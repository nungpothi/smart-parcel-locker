import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

type GuardProps = {
  children: ReactNode;
};

export const RecipientGuard = ({ children }: GuardProps) => {
  const { isAuthenticated, role } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    role: state.role
  }));

  if (!isAuthenticated || role !== "RECIPIENT") {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};

export default RecipientGuard;
