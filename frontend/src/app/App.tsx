import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { useAuthStore } from "./stores/auth.store";

export const App = () => {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe().catch(() => undefined);
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

export default App;
