import { ReactNode } from "react";

type GuardProps = {
  children: ReactNode;
};

export const RecipientGuard = ({ children }: GuardProps) => {
  return <>{children}</>;
};

export default RecipientGuard;
