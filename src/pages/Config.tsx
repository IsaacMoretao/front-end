import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthProvider";
import { useTheme } from "../Context/ThemeContext";
import { api } from "../lib/axios";
import { DownloadSimple, Table } from "phosphor-react";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Config() {
  const { darkMode, toggleTheme } = useTheme();
  const { state } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

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

  async function resetPoints() {
    const confirmReset = window.confirm("Você tem certeza que deseja zerar os pontos das crianças?");
    
    if (confirmReset) {
      try {
        const response = await api.post("/reset/all/points");
        console.log(response.data.message);
      } catch (error) {
        console.error("Erro ao zerar os pontos:", error);
      }
    } else {
      console.log("Ação de resetar pontos foi cancelada.");
    }
  }

  let canClick = true;

  const exportPDF = () => {
    if (!canClick) {
      return;
    }
    canClick = false;

    // Verifica se há dados na tabela
    if (children.length === 0) {
      console.error("No data available to export");
      canClick = true;
      return;
    }

    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nome', 'Idade', 'Pontos']],
      body: children.map((child) => [child.nome, child.idade, child.pontos]),
    });
    doc.save("children.pdf");
    setTimeout(() => {
      canClick = true;
    }, 3000);
  };

  return (
    <>
      <main
        className={`h-screen w-full flex flex-col items-center gap-5 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        }`}
      >
        <strong
          className={`font-bold text-xl py-16  ${
            darkMode ? "text-gray-50" : "text-gray-900"
          }`}
        >
          CONFIGURAÇÕES
        </strong>
        <div
          className={`flex justify-between px-10 py-3 rounded-lg w-[90%] lg:ml-16 shadow-md ${
            darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          }`}
        >
          TEMA
          <button
            className={`relative w-14 h-7 rounded-full p-1 cursor-pointer ${
              darkMode ? "bg-gray-500" : "bg-gray-100"
            }`}
            onClick={toggleTheme}
          >
            <div
              className={`absolute left-2 w-5 top-1 h-5 rounded-full transition-transform transform ${
                darkMode
                  ? "translate-x-full bg-gray-700"
                  : "translate-x-0 bg-gray-400"
              }`}
            />
          </button>
        </div>
        <div
          onClick={exportPDF}
          className={`flex justify-between items-center px-10 py-3 rounded-lg w-[90%] cursor-pointer lg:ml-16 shadow-md ${
            darkMode ? "bg-gray-800 text-gray-100 hover:bg-gray-700" : "bg-white text-gray-900"
          }`}
        >
          BAIXAR PDF
          <DownloadSimple size={35} color={`${
            darkMode ? "#fff" : "#000"
          }`}  />
        </div>
        {state.level === "ADMIN" ? (
          <button className="flex flex-col justify-center gap-5 items-center py-3 rounded-lg border border-red-500 bg-red-500 bg-opacity-10 w-[90%] lg:ml-16">
            <h3 className="font-bold text-lg">ZONA PERIGOSA</h3>
            <button
              onClick={resetPoints}
              className={`py-3 rounded-lg bg-red-500 bg-opacity-10 w-[90%] shadow-md hover:bg-opacity-20 transition-all ${
                darkMode ? "text-gray-300" : "text-gray-900"
              }`}
            >
              RESETAR PONTOS
            </button>
            <button
              onClick={resetPoints}
              className={`py-3 rounded-lg bg-red-500 bg-opacity-10 w-[90%] shadow-md hover:bg-opacity-20 transition-all ${
                darkMode ? "text-gray-300" : "text-gray-900"
              }`}
            >
              RESETAR CRIANÇAS
            </button>
          </button>
        ) : (
          <></>
        )}
      </main>
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
