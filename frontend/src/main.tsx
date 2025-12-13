import React from "react";
import ReactDOM from "react-dom/client";
import "./app/theme/variables.css";
import App from "./app/App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
