import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Class } from "./pages/Class";
import { useTheme } from "./Context/ThemeContext";
import { useAuth } from "./Context/AuthProvider";
import { useEffect, useState } from "react";
import { Loader } from "./pages/loader";
import "./Stylles/Loader.css";
import { PageNotFound } from "./pages/PageNotFound";
import { Header } from "./components/Header";
import { Aside } from "./components/Aside";
import { Config } from "./pages/Config";
import { Admin } from "./pages/Admin";
import { Relatorio } from "./pages/Relatorio";

function App() {
  const { state, dispatch } = useAuth();
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const level = localStorage.getItem("level");
    const userId = localStorage.getItem("userId");

    if (token) {
      dispatch({
        type: "LOGIN",
        payload: {
          token,
          level: level ?? "",
          userId: userId ?? "",
        },
      });
    }
  }, []);
  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-gray-100"} font-Poppins`}>
      <Router>
        {state.token && (
          <>
            <Header />
            <Aside />
          </>
        )}

        <Routes>
          {/* Rota "Relatório" acessível para todos */}
          <Route
            path="/relatorio"
            element={loading ? <Loader /> : <Relatorio />}
          />

          {state.token === null ? (
            <>
              <Route path="/login" element={loading ? <Loader /> : <Login />} />
              <Route path="/*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              {/* Rotas acessíveis com token */}
              <Route path="/home" element={loading ? <Loader /> : <Home />} />
              <Route path="/loader" element={<Loader />} />
              <Route
                path="/sala/9-11"
                element={loading ? <Loader /> : <Class min={9} max={11} />}
              />
              <Route
                path="/sala/6-8"
                element={loading ? <Loader /> : <Class min={6} max={8} />}
              />
              <Route
                path="/sala/3-5"
                element={loading ? <Loader /> : <Class min={3} max={5} />}
              />
              <Route
                path="/sala/8-11"
                element={loading ? <Loader /> : <Class min={8} max={11} />}
              />
              <Route
                path="/sala/4-7"
                element={loading ? <Loader /> : <Class min={4} max={7} />}
              />
              <Route path="/" element={loading ? <Loader /> : <Home />} />
              <Route
                path="/config"
                element={loading ? <Loader /> : <Config />}
              />
              {state.level === "ADMIN" && (
                <Route
                  path="/admin"
                  element={loading ? <Loader /> : <Admin />}
                />
              )}
              <Route path="/*" element={<PageNotFound />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
