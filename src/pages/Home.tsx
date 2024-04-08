import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { api } from '../lib/axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Table,
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableHead, 
  TableRow
} from '@mui/material';
import Logo from "../assets/Logo.png"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ButtonHover } from '../components/ButtonHover';
import ButtonDowload from '../components/ButtonDowload';

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const [server, setServer] = useState(false)

  const verifyServer = async () => {
    try {
      const response = await api.get(`/`);
      const data = response.data;

      if (data === "Hello World"){
        setServer(true)
      } else {
        setServer(false)
      }
    } catch (error) {
      console.error('Erro ao buscar crianças:', error);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await api.get(`/children`);
      const data = response.data;

      data.sort((a: Child, b: Child) => a.nome.localeCompare(b.nome));

      setChildren(data);
    } catch (error) {
      console.error('Erro ao buscar crianças:', error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  let canClick = true;

  const exportPDF = () => {
    if (!canClick) {
      return; // Impede a ação se ainda estiver dentro do período de espera
    }
  
    canClick = false; // Bloqueia futuros cliques
  
    const doc = new jsPDF();
    autoTable(doc, { html: '#my-table' });
    doc.save('table.pdf');
  
    setTimeout(() => {
      canClick = true; // Permite cliques novamente após 3 segundos
    }, 3000); // 3000 milissegundos = 3 segundos
  };

  return (
    <div>
      <AppBar position="static" color="inherit">
        <Toolbar className="flex items-center justify-between">
          <Typography variant="h6" component="div">
            <img src={Logo} className="h-10 sm:h-12 md:h-14 lg:h-16" alt="" />
          </Typography>
          <div className="flex items-center">
            <button onClick={exportPDF} className="mr-2 sm:mr-4">
              <ButtonDowload/>
            </button>
            {server ? (
              <Button color="error" onClick={verifyServer} className="hidden sm:block">
                Servidor dormindo
              </Button>
            ) : (
              <Button color="success" onClick={verifyServer} className="hidden sm:block">
                Servidor acordado
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl text-black font-bold text-center my-8">ADMINISTRAÇÃO DE CRIANÇAS</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-center items-center">
            <Link to="/sala-3-5" className="text-2xl text-center block text-white">
            <ButtonHover name={"sala de 3 a 5"} />
            </Link>

            <Link to="/sala-6-8" className="text-2xl text-center block text-white">
              <ButtonHover name={"sala de 6 a 8"} />
            </Link>

            <Link to="/sala-9-11" className="text-2xl text-center block text-white">
              <ButtonHover name={"sala de 9 a 11"} />
            </Link>

            <Link to="/sala-4-7" className="text-2xl text-center block text-white">
              <ButtonHover name={"sala de 4 a 7"} />
            </Link>

            <Link to="/sala-8-11" className="text-2xl text-center block text-white">
              <ButtonHover name={"sala de 8 a 11"} />
            </Link>

          
        </div>
      </div>
      <div style={{ display: 'none' }}>
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