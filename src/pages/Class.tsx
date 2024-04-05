import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

interface Period {
  minAge: number;
  maxAge: number;
}

type ClickedCountState = {
  [key: number]: number;
}

export function Class( props:Period ){
  const [children, setChildren] = useState<Child[]>([]);
  const [open, setOpen] = useState(false);
  const [newChild, setNewChild] = useState<Child>({ id: 0, nome: '', idade: 0, pontos: 0 });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [clickedCount, setClickedCount] = useState<ClickedCountState>({});
  const [isCreating, setIsCreating] = useState<boolean>(false);


  const fetchChildren = async () => {
    try {
      const response = await fetch(`https://backend-kids.onrender.com/children/filterByAge?minAge=${props.minAge}&maxAge=${props.maxAge}`);
      const data = await response.json();
      
      data.sort((a: Child, b: Child) => a.nome.localeCompare(b.nome));
      
      setChildren(data);
    } catch (error) {
      console.error('Erro ao buscar crianças:', error);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChild({
      ...newChild,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsCreating(true); // Defina isCreating como true ao iniciar a criação da criança

      // Verificar se a criança já existe na lista pelo nome
      const existingChild = children.find(child => child.nome === newChild.nome);
      if (existingChild) {
        throw new Error('Esta criança já existe.');
      }

      // Se a criança não existir, adicione-a
      const response = await fetch('https://backend-kids.onrender.com/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChild),
      });
      const data: Child = await response.json();
      setChildren([...children, data]);
      handleClose();
    } catch (error: any) {
      console.error('Erro ao inserir criança:', error.message);
      // Exibir mensagem de erro ao usuário
      alert(error.message);
    } finally {
      setIsCreating(false); // Defina isCreating como false após a operação de criação, independentemente de ser bem-sucedida ou não
    }
  };

const addPoints = async (childId: number, pointsToAdd: number) => {
  try {
    // Verifica se a criança já clicou 4 vezes
    if (clickedCount[childId] && clickedCount[childId] >= 4) {
      return; // Sai da função sem fazer nada se já tiver clicado 4 vezes
    }

    const response = await fetch(`https://backend-kids.onrender.com/children/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pontos: pointsToAdd,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao adicionar pontos');
    }

    // Atualiza o estado local após a chamada API bem-sucedida
    setChildren(prevChildren =>
      prevChildren.map(child =>
        child.id === childId ? { ...child, pontos: child.pontos + pointsToAdd } : child
      )
    );

    // Atualiza o contador de cliques para a criança
    setClickedCount(prevClickedCount => ({
      ...prevClickedCount,
      [childId]: (prevClickedCount[childId] || 0) + 1,
    }));

  } catch (error) {
    console.error('Erro ao adicionar pontos:', error);
  }
};

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    autoTable(doc, { html: '#my-table' });
    doc.save('table.pdf');
  };

  const filteredChildren = children.filter(child =>
    child.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper className="container mx-auto px-4">
      <h1 className="text-3xl text-black font-bold text-center my-8">Sala {props.minAge} a {props.maxAge}</h1>

      <TextField
        label="Buscar por nome"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TableContainer className="my-4">
        <Table>
          <TableHead className='bg-gray-200 w-full'>
            <TableRow className="text-gray-600 uppercase text-sm leading-normal">
              <TableCell align="center">
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  color="primary"
                  className="mt-4 w-full sm:w-auto"
                  onClick={handleOpen}
                >
                  Adicionar Criança
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button variant="contained" color="secondary" className="mt-4 w-full sm:w-auto" onClick={exportPDF}>
                  Baixar Excel
                </Button>
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
            <TableRow className="text-gray-600 uppercase text-sm leading-normal">
              <TableCell align="center">Nome</TableCell>
              <TableCell align="center">Idade</TableCell>
              <TableCell align="center">Pontos</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChildren.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Não foi encontrada nenhuma criança.
                </TableCell>
              </TableRow>
            ) : (
              filteredChildren.map((child) => (
                <TableRow key={child.id} className="bg-white py-10">
                  <TableCell align="center">{child.nome}</TableCell>
                  <TableCell align="center">{child.idade}</TableCell>
                  <TableCell align="center">{child.pontos}</TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="contained" 
                        className={`points${clickedCount[child.id] || 0}`} 
                        disabled={clickedCount[child.id] >= 4}
                        onClick={() => addPoints(child.id, 1)}
                      >+1</Button>
                      <Button variant="contained" color="error" onClick={() => addPoints(child.id, (-1))}>-1</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Adicionar Criança</DialogTitle>
      <DialogContent>
        <DialogContentText>Preencha os detalhes da criança:</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="nome"
          name="nome"
          label="Nome"
          type="text"
          fullWidth
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="idade"
          name="idade"
          label="Idade"
          type="number"
          fullWidth
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          id="pontos"
          name="pontos"
          label="Pontos"
          type="number"
          fullWidth
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" disabled={isCreating}>Salvar</Button>
      </DialogActions>
    </Dialog>
    </Paper>
  )
}