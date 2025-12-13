import { Outlet } from "react-router-dom";

export const RecipientLayout = () => {
  return (
    <div className="recipient-layout">
      <Outlet />
    </div>
  );
};

export default RecipientLayout;
