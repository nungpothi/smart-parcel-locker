import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
};

export default AdminLayout;
