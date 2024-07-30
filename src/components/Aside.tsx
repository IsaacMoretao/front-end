import { House, Database, SignOut, GearSix, Table, UserCirclePlus } from "phosphor-react";
import Logo from "../../assets/Logo.png";
import { useAuth } from "../Context/AuthProvider";
import { Link } from "react-router-dom";

import { api } from "../lib/axios";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useTheme } from "../Context/ThemeContext";

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Aside() {
  const { darkMode } = useTheme();
  const [server, setServer] = useState(false);
  const { dispatch } = useAuth();

  const [children, setChildren] = useState<Child[]>([]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const verifyServer = async () => {
    try {
      setServer(false);
      const response = await api.get(`/children/`);
      const hasChildren =
        Array.isArray(response.data) && response.data.length > 0;
      setServer(hasChildren);
    } catch (error) {
      setServer(false);
      console.error("Erro ao verificar o servidor:", error);
    }
  };

  let canClick = true;

  const exportPDF = () => {
    if (!canClick) {
      return;
    }
    canClick = false;
    const doc = new jsPDF();
    autoTable(doc, { html: "#my-table" });
    doc.save("table.pdf");
    setTimeout(() => {
      canClick = true;
    }, 3000);
  };

  const fetchChildren = async () => {
    try {
      const response = await api.get(`/children`);
      const data = response.data;
      data.sort((a: Child, b: Child) => a.nome.localeCompare(b.nome));
      setChildren(data);
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
        }`}
      >
        <figure className="max-lg:hidden">
          <img src={Logo} alt="" className="h-12 mb-7 w-auto" />
        </figure>
        <nav className="flex max-lg:w-full max-lg:justify-around lg:flex-col lg:gap-5 ">
          <Link to="/home">
            <House size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </Link>
          <button onClick={verifyServer}>
            <Database
              size={35}
              color={server === true ? "#2cb438" : "#e46962"}
            />
          </button>
          <button onClick={handleLogout}>
            <SignOut size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </button>
          <Link to="/config">
            <GearSix size={35} color={darkMode ? "#fff" : "#1D1D1D"} />
          </Link>
        </nav>
      </aside>
      <div style={{ display: "none" }}>
        <TableContainer>
          <Table id="my-table">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Idade</TableCell>
                <TableCell align="right">Pontos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>{child.nome}</TableCell>
                  <TableCell align="right">{child.idade}</TableCell>
                  <TableCell align="right">{child.pontos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
