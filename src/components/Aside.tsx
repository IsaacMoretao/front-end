import { House, Database, SignOut, GearSix } from "phosphor-react";
import Logo from "../../assets/Logo.png";
import { useAuth } from "../Context/AuthProvider";
import { Link, useLocation } from "react-router-dom";

import { api } from "../lib/axios";
import { useEffect, useState } from "react";
import { useTheme } from "../Context/ThemeContext";

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Aside() {
  const { darkMode } = useTheme();
  const { dispatch } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const [server, setServer] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const verifyServer = async () => {
    setIsLoading(true);
    setShowPopup(false); // Garantir que o pop-up não fique visível durante novas tentativas
    try {
      const response = await api.get(`/children/`);
      const hasChildren =
        Array.isArray(response.data) && response.data.length >= 0;
      setServer(hasChildren);
    } catch (error) {
      setServer(false);
      setShowPopup(true); // Mostra o pop-up caso ocorra um erro
      console.error("Erro ao verificar o servidor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  let report = "";
  if (path.endsWith("/Relatorio")) {
    report = "hidden";
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const fetchChildren = async () => {
    try {
      const response = await api.get(`/children`);
      const data = response.data;
      data.sort((a: Child, b: Child) => a.nome.localeCompare(b.nome));
    } catch (error) {
      console.error("Erro ao buscar crianças:", error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    verifyServer();
  }, []);

  return (
    <>
      <aside
        className={`fixed z-50 flex flex-col items-center py-3 left-0 lg:top-0 bottom-0 lg:w-16 max-lg:h-16 max-lg:right-0 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }, ${report}`}
      >
        <figure className="max-lg:hidden">
          <img src={Logo} alt="" className="h-12 mb-7 w-auto" />
        </figure>
        <nav className="flex max-lg:w-full max-lg:justify-around lg:flex-col lg:gap-5 ">
          <Link to="/">
            <House size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </Link>

          {isLoading ? (
            <span
              className={`loader inline-block w-5 h-5 border-2 border-t-2 border-t-transparent ${
                darkMode ? "border-white" : "border-black"
              } rounded-full animate-spin`}
            ></span>
          ) : (
            <button onClick={verifyServer}>
              <Database
                size={35}
                color={server === true ? "#2cb438" : "#e46962"}
              />
            </button>
          )}
          <button onClick={handleLogout}>
            <SignOut size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </button>
          <Link to="/config">
            <GearSix size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </Link>
        </nav>
      </aside>
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="text-red-600 font-bold">
              O servidor não está funcionando!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
