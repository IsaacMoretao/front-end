import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ButtonHover } from "../components/ButtonHover";
import { useTheme } from "../Context/ThemeContext";

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Home() {
  const { darkMode } = useTheme();
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

  return (
    <div
      className={`bg-cover bg-center min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto lg:pl-20 lg:pr-4">
        <h1
          className={`text-3xl font-bold text-center py-8 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          GALARDÃO DE CRIANÇAS
        </h1>

        <div className="max-lg:flex max-lg:flex-wrap lg:grid lg:grid-cols-3 gap-10 justify-center items-center">
          <Link
            to="/sala/3-5"
            className="text-2xl text-center block text-white"
          >
            <ButtonHover name={"sala de 3 a 5"} />
          </Link>

          <Link
            to="/sala/6-8"
            className="text-2xl text-center block text-white"
          >
            <ButtonHover name={"sala de 6 a 8"} />
          </Link>

          <Link
            to="/sala/9-11"
            className="text-2xl text-center block text-white"
          >
            <ButtonHover name={"sala de 9 a 11"} />
          </Link>

          <Link
            to="/sala/4-7"
            className="text-2xl text-center block text-white"
          >
            <ButtonHover name={"sala de 4 a 7"} />
          </Link>

          <Link
            to="/sala/8-11"
            className="text-2xl text-center block text-white"
          >
            <ButtonHover name={"sala de 8 a 11"} />
          </Link>
        </div>
      </div>
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
    </div>
  );
}
