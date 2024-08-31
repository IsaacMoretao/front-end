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

export const usePointsContext = () => {
  const context = useContext(PointsContext);
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
      if (response.status === 201) {
        setPointsAdded((prevPoints) => {
          const currentTime = Date.now();
          const updatedPoints = prevPoints[productId] || [];
          const filteredPoints = updatedPoints.filter(
            (timestamp) => currentTime - timestamp <= 5 * 60 * 60 * 1000 // 5 Horas
          );

          if (filteredPoints.length < 4) {
            filteredPoints.push(currentTime);
            const newPointsAdded = {
              ...prevPoints,
              [productId]: filteredPoints,
            };
            localStorage.setItem('pointsAdded', JSON.stringify(newPointsAdded));
            return newPointsAdded;
          }
          return prevPoints;
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar ponto:', error);
    }
  };

  const handleRemovePoint = async (productId: number) => {
    try {
      const response = await api.delete(`/deletePoint/${productId}`);
      if (response.status === 200) {
        setPointsAdded((prevPoints) => {
          const currentTime = Date.now();
          const updatedPoints = prevPoints[productId] || [];
          const filteredPoints = updatedPoints.filter(
            (timestamp) => currentTime - timestamp <= 60 * 1000
          );

          if (filteredPoints.length > 0) {
            filteredPoints.shift();
            const newPointsAdded = {
              ...prevPoints,
              [productId]: filteredPoints,
            };
            localStorage.setItem('pointsAdded', JSON.stringify(newPointsAdded));
            return newPointsAdded;
          }
          return prevPoints;
        });
      } else {
        alert('O ponto não pode ser excluído após 1 minuto.');
      }
    } catch (error) {
      console.error('Erro ao excluir ponto:', error);
    }
  };

  return (
    <PointsContext.Provider value={{ pointsAdded, handleAddPoint, handleRemovePoint }}>
      {children}
    </PointsContext.Provider>
  );
};
