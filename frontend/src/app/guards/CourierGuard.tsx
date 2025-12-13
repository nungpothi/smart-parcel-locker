import { ReactNode } from "react";

type GuardProps = {
  children: ReactNode;
};

export const CourierGuard = ({ children }: GuardProps) => {
  return <>{children}</>;
};

export default CourierGuard;
