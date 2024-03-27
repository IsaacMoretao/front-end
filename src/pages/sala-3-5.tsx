import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Sala3a5() {
  const [children, setChildren] = useState<Child[]>([]);
  const [open, setOpen] = useState(false);
  const [newChild, setNewChild] = useState<Child>({ id: 0, nome: '', idade: 0, pontos: 0 });

  const fetchChildren = async () => {
    try {
      const response = await fetch('https://backend-kids.onrender.com/children/filterByAge?minAge=3&maxAge=5');
      const data = await response.json();
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://backend-kids.onrender.com/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChild),
      });
      const data = await response.json();
      setChildren([...children, data]);
      handleClose();
    } catch (error) {
      console.error('Erro ao inserir criança:', error);
    }
  };

  const addPoints = async (childId: number, pointsToAdd: number) => {
    try {
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
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    autoTable(doc, { html: '#my-table' });
    doc.save('table.pdf');
  };

  return (
    <Paper className="container mx-auto px-4">
      <h1 className="text-3xl text-black font-bold text-center my-8">Sala 3 a 5</h1>

      <TableContainer className="my-4">
        <Table>
          <TableHead className='bg-gray-200 w-full'>
          <TableRow className="text-gray-600 uppercase text-sm leading-normal">

            <TableCell align="center">
              <Button variant="contained" startIcon={<AddCircleOutline />} color="primary" className="mt-4 w-full sm:w-auto" onClick={handleOpen}>
                Adicionar Criança
              </Button>
            </TableCell>
            <TableCell align="center">
              <Button variant="contained" color="secondary" className="mt-4 w-full sm:w-auto" onClick={exportPDF}>
                Baixar Excel
              </Button>
            </TableCell>
            <TableCell/>
            <TableCell/> 

          </TableRow>
            <TableRow className="text-gray-600 uppercase text-sm leading-normal">
              <TableCell align="center">Nome</TableCell>
              <TableCell align="center">Idade</TableCell>
              <TableCell align="center">Pontos</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {children.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Não foi encontrada nenhuma criança.
                </TableCell>
              </TableRow>
            ) : (

              children.map((child) => (
                
                <TableRow key={child.id} className="bg-white py-10">
                  <TableCell align="center">{child.nome}</TableCell>
                  <TableCell align="center">{child.idade}</TableCell>
                  <TableCell align="center">{child.pontos}</TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center gap-2">
                      <Button variant="contained" color="primary" onClick={() => addPoints(child.id, 1)}>+1</Button>
                      <Button variant="contained" color="primary" onClick={() => addPoints(child.id, 2)}>+2</Button>
                      <Button variant="contained" color="primary" onClick={() => addPoints(child.id, 3)}>+3</Button>
                      <Button variant="contained" color="primary" onClick={() => addPoints(child.id, 4)}>+4</Button>
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
          <Button onClick={handleSubmit} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}