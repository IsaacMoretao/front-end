import * as XLSX from 'xlsx';
import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthProvider";
import { useTheme } from "../Context/ThemeContext";
import { api } from "../lib/axios";
import { DownloadSimple } from "phosphor-react";


interface Child {
  id: number;
  nome: string;
  idade: number;
  points: Array<Object>;
  totalPoints: number;
}

export function Config() {
  const [canClicked, setCanClicked] = useState(true);

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

  const ajuste = async () => {
    try {
      const response = await api.post(`/admin`);
      const data = response.data;
      console.log(data)
    } catch (error) {
      console.error("Erro ao Fazer ajuste de tabela:", error);
    }
  };

  const exportToExcel = () => {
    if (!canClicked) return;
    setCanClicked(false);

    if (children.length === 0) {
      console.error("Nenhum dado disponível para exportação.");
      setCanClicked(true);
      return;
    }

    // Cabeçalho e corpo da tabela
    const sheetData = [
      ["Nome", "Idade", "Pontos"],
      ...children.map((child) => [
        child.nome,
        child.idade ?? "-", // Evita erro caso idade seja null
        child.totalPoints ?? 0, // Usa o campo do backend
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Crianças");

    XLSX.writeFile(workbook, "children.xlsx");

    setTimeout(() => setCanClicked(true), 3000);
  };


  useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <>
      <main
        className={`h-screen w-full flex flex-col items-center gap-5 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
          }`}
      >
        <strong
          className={`font-bold text-xl py-16  ${darkMode ? "text-gray-50" : "text-gray-900"
            }`}
        >
          CONFIGURAÇÕES
        </strong>
        <div
          className={`flex justify-between px-10 py-3 rounded-lg w-[90%] lg:ml-16 shadow-md ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
        >
          TEMA
          <button
            className={`relative w-14 h-7 rounded-full p-1 cursor-pointer ${darkMode ? "bg-gray-500" : "bg-gray-100"
              }`}
            onClick={toggleTheme}
          >
            <div
              className={`absolute left-2 w-5 top-1 h-5 rounded-full transition-transform transform ${darkMode
                  ? "translate-x-full bg-gray-700"
                  : "translate-x-0 bg-gray-400"
                }`}
            />
          </button>
        </div>
        <div
          onClick={exportToExcel}
          className={`flex justify-between items-center px-10 py-3 rounded-lg w-[90%] cursor-pointer lg:ml-16 shadow-md ${darkMode ? "bg-gray-800 text-gray-100 hover:bg-gray-700" : "bg-white text-gray-900"
            }`}
        >
          BAIXAR EXEl
          <DownloadSimple size={35} color={`${darkMode ? "#fff" : "#000"
            }`} />
        </div>
        {state.level === "ADMIN" ? (
          <button className="flex flex-col justify-center gap-5 items-center py-3 rounded-lg border border-red-500 bg-red-500 bg-opacity-10 w-[90%] lg:ml-16">
            <h3 className="font-bold text-lg">ZONA PERIGOSA</h3>
            <button
              onClick={ajuste}
              className={`py-3 rounded-lg bg-red-500 bg-opacity-10 w-[90%] shadow-md hover:bg-opacity-20 transition-all ${darkMode ? "text-gray-300" : "text-gray-900"
                }`}
            >
              AJUSTAR TABELA
            </button>
            <button
              onClick={resetPoints}
              className={`py-3 rounded-lg bg-red-500 bg-opacity-10 w-[90%] shadow-md hover:bg-opacity-20 transition-all ${darkMode ? "text-gray-300" : "text-gray-900"
                }`}
            >
              RESETAR PONTOS
            </button>
            <button
              onClick={resetPoints}
              className={`py-3 rounded-lg bg-red-500 bg-opacity-10 w-[90%] shadow-md hover:bg-opacity-20 transition-all ${darkMode ? "text-gray-300" : "text-gray-900"
                }`}
            >
              RESETAR CRIANÇAS
            </button>
          </button>
        ) : (
          <></>
        )}
      </main>

    </>
  );
}
