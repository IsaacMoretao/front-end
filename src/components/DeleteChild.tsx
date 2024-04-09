import { Button } from "@mui/material";
import { api } from "../lib/axios";
import { useState } from "react";

interface Child {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

interface excluseId {
  childId: number;
}

export function DeleteChild(props: excluseId) {
  const [children, setChildren] = useState<Child[]>([]);

  let Child = props.childId


  const handleDeleteChild = async (childId: number) => {
    const confirmDelete = window.confirm("Você tem certeza que quer excluir essa criança?");
    if (!confirmDelete) return;
  
    try {
      const response = await api.delete(`/delete/${childId}`);
      if (response.status === 200) {
        alert("Criança excluída com sucesso");
        setChildren(prevChildren => prevChildren.filter(child => props.childId !== childId));
      } else {
        throw new Error('Falha ao excluir a criança');
      }
    } catch (error) {
      console.error('Erro ao excluir a criança:', error);
    }
  };

  return(
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleDeleteChild(Child)}
      >
        Excluir
      </Button>
    </>
  )
}