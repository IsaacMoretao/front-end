import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import { PointsProvider } from "./Context/PointsContext.tsx";
import { AuthProvider } from "./Context/AuthProvider";
import { ThemeProvider } from "./Context/ThemeContext.tsx";
import "./Stylles/index.css";
import { ProductProvider } from "./Context/DataContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ProductProvider>
          <PointsProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
          </PointsProvider>
        </ProductProvider>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
