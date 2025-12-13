import { Outlet } from "react-router-dom";

export const App = () => {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
};

export default App;
