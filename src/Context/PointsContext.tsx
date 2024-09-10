import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../lib/axios';

interface PointsAdded {
  [key: number]: number[];
}

interface PointsContextType {
  pointsAdded: PointsAdded;
  handleAddPoint: (productId: number) => void;
  handleRemovePoint: (productId: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const POINT_LIMIT_TIME = Number(import.meta.env.VITE_POINT_LIMIT_TIME) || 18000000;

export const usePointsContext = () => {
  const context = useContext(PointsContext);
  // console.log(context); // Adicione isto para verificar o valor
  if (!context) {
    throw new Error('usePointsContext must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const [pointsAdded, setPointsAdded] = useState<PointsAdded>({});

  useEffect(() => {
    const storedPoints = localStorage.getItem('pointsAdded');
    if (storedPoints) {
      setPointsAdded(JSON.parse(storedPoints));
    }
  }, []);
  

  const handleAddPoint = async (productId: number) => {
    try {
      const response = await api.post(`/addPoint/${productId}`);
  
      if (response.status === 200 || response.status === 201) {
        const currentTime = Date.now();
        setPointsAdded((prevPoints) => {
          const updatedPoints = prevPoints[productId]?.filter(
            (timestamp) => currentTime - timestamp <= POINT_LIMIT_TIME
          ) || [];
      
          if (updatedPoints.length < 4) {
            const newPoints = { ...prevPoints, [productId]: [...updatedPoints, currentTime] };
            return newPoints;
          }
          return prevPoints;
        });
        
        setTimeout(() => {
          localStorage.setItem('pointsAdded', JSON.stringify(pointsAdded));
        }, 0);
      }
    } catch (error) {
      console.error('Erro ao adicionar ponto:', error);
    }
  };


  const handleRemovePoint = async (productId: number) => {
    try {
      // Faz a requisição para a API de remover o último ponto
      const response = await api.delete(`/deletePoint/${productId}`);
  
      // Verifica se a resposta foi bem-sucedida (status 200)
      if (response.status === 200) {
        const currentTime = Date.now();
  
        setPointsAdded((prevPoints) => {
          const updatedPoints = prevPoints[productId]?.filter(
            (timestamp) => currentTime - timestamp <= POINT_LIMIT_TIME
          ) || [];
  
          if (updatedPoints.length > 0) {
            updatedPoints.pop(); // Remove o último ponto
            const newPoints = { ...prevPoints, [productId]: updatedPoints };
            return newPoints;
          }
          return prevPoints;
        });
  
        // Atualiza o localStorage após o estado ser atualizado
        setTimeout(() => {
          localStorage.setItem('pointsAdded', JSON.stringify(pointsAdded));
        }, 0);
      }
    } catch (error) {
      console.error('Erro ao remover ponto:', error);
      // Adicione lógica de tratamento de erro se necessário
    }
  };
  
  

  // const handleRemovePoint = async (productId: number) => {
  //   if (!pointsAdded.hasOwnProperty(productId)) return;
  //   try {
  //     const response = await api.delete(`/deletePoint/${productId}`);
  //     if (response.status === 200) {
  //       setPointsAdded((prevPoints) => {
  //         const currentTime = Date.now();
  //         const updatedPoints = prevPoints[productId] || [];
  //         const filteredPoints = updatedPoints.filter(
  //           (timestamp) => currentTime - timestamp <= 60 * 1000 // 5 Horas
  //         );

  //         if (filteredPoints.length > 0) {
  //           filteredPoints.shift();
  //           const newPointsAdded = {
  //             ...prevPoints,
  //             [productId]: filteredPoints,
  //           };
  //           localStorage.setItem('pointsAdded', JSON.stringify(newPointsAdded));
  //           return newPointsAdded;
  //         }
  //         return prevPoints;
  //       });
  //     } else {
  //       alert('O ponto não pode ser excluído após 1 minuto.');
  //     }
  //   } catch (error) {
  //     console.error('Erro ao excluir ponto:', error);
  //   }
  // };

  return (
    <PointsContext.Provider value={{ pointsAdded, handleAddPoint, handleRemovePoint }}>
      {children}
    </PointsContext.Provider>
  );
};