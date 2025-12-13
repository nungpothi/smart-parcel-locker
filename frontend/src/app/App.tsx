import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { useAuthStore } from "./stores/auth.store";
import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/variables.css";

export const App = () => {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

export default App;
