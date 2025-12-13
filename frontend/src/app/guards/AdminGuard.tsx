import { ReactNode } from "react";

type GuardProps = {
  children: ReactNode;
};

export const AdminGuard = ({ children }: GuardProps) => {
  return <>{children}</>;
};

export default AdminGuard;
