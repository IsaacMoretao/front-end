import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { PointsProvider } from "./Context/PointsContext.tsx";
import { AuthProvider } from "./Context/AuthProvider";
import { ThemeProvider } from "./Context/ThemeContext.tsx";
import "./Stylles/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
            <PointsProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </PointsProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
