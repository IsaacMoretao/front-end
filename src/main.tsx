import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { PointsProvider } from "./Context/PointsContext.tsx";
import { AuthProvider } from "./Context/AuthProvider";
import { ThemeProvider } from "./Context/ThemeContext.tsx";
import "./Stylles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <PointsProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PointsProvider>
    </AuthProvider>
  </React.StrictMode>
);
