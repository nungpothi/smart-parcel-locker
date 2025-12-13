import { Outlet } from "react-router-dom";

export const CourierLayout = () => {
  return (
    <div className="courier-layout">
      <Outlet />
    </div>
  );
};

export default CourierLayout;
