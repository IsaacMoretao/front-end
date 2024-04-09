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
  TableRow,
  IconButton,
  Drawer,
  List,
  ListItemText
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import Logo from "../assets/LogoSmall.svg"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ButtonHover } from '../components/ButtonHover';
import ButtonDowload from '../components/ButtonDowload';
import { useAuth } from '../Context/AuthProvider';
import MenuIcon from '@mui/icons-material/Menu';


interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const [server, setServer] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

const toggleDrawer = () => {
  setDrawerOpen(!drawerOpen);
};

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const verifyServer = async () => {
    try {
      const response = await api.get(`/`);
      const data = response.data;
  
      if (data !== "Hello World"){
        setServer(false);
      } else {
        setServer(true);
      }
    } catch (error) {
      console.error('Erro ao verificar o servidor:', error);
      setServer(false);
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

  const { dispatch } = useAuth();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="bg-cover bg-center h-screen" style={{backgroundImage: "url('src/assets/Background.png')"}}>
      <AppBar position="static" color="inherit">
        <Toolbar className="flex justify-between items-center">
          <Typography variant="h6" component="div" className="flex items-center">
            <img src={Logo} className="h-8 w-auto sm:h-10 md:h-12 lg:h-14" alt="" />
          </Typography>
          <div className="flex items-center">
            <div className="block sm:hidden">
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButton>
            </div>
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
            <List>
              <ListItemButton onClick={exportPDF}>
                <ListItemText primary="Download" />
              </ListItemButton>
              <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
              </ListItemButton>
              <ListItemButton onClick={verifyServer}>
      <ListItemText primary={server ? "Servidor dormindo" : "Servidor acordado"} />
              </ListItemButton>
            </List>
          </Drawer>
          <button onClick={exportPDF} className="mr-2 max-sm:hidden">
            <ButtonDowload />
          </button>
          <div className="max-sm:hidden">
            <Button color="success" onClick={handleLogout}>
              Logout
            </Button>
            {server ? (
              <Button color="error" onClick={verifyServer}>
                Servidor dormindo
              </Button>
            ) : (
              <Button color="success" onClick={verifyServer}>
                Servidor acordado
              </Button>
            )}
          </div>
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