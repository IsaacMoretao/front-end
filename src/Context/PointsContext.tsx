import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { api } from "../lib/axios";
import { useAuth } from "./AuthProvider";
import { useProductContext } from "./DataContext";

interface PointsAdded {
  [key: number]: number;
}

interface PointsContextType {
  pointsAdded: PointsAdded;
  handleAddPoint: (productId: number) => void;
  handleRemovePoint: (productId: number) => void;
  loading: { [key: number]: boolean };
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePointsContext = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePointsContext must be used within a PointsProvider");
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const { state } = useAuth();

  const [pointsAdded, setPointsAdded] = useState<PointsAdded>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const { DataReload } = useProductContext();


  const handleAddPoint = async (productId: number) => {
    try {
      // Marca o início do carregamento
      setLoading((prev) => ({ ...prev, [productId]: true }));
  
      const response = await api.post(`/addPoint/${productId}/${state.userId}`);
  
      if (response.status === 200 || response.status === 201) {
        // Se a resposta for 200, adicione o ponto
        setPointsAdded((prevPoints) => {
          const currentPoints = prevPoints[productId] || 0;
          if (currentPoints < 4) {
            return { ...prevPoints, [productId]: currentPoints + 1 };

          }
          return prevPoints;
          
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar ponto:", error);
    } finally {
      DataReload();
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };
  
  const handleRemovePoint = async (productId: number) => {
    try {
      const response = await api.delete(`/deletePoint/${productId}`);
  
      if (response.status === 200) {
        setPointsAdded((prevPoints) => {
          const currentPoints = prevPoints[productId] || 0;
  
          // Evita números negativos
          if (currentPoints > 0) {
            return {
              ...prevPoints,
              [productId]: currentPoints - 1,
            };
          }
  
          return prevPoints; // Mantém o estado atual se já for 0
        });
      }
    } catch (error) {
      console.error("Erro ao remover ponto:", error);
    } finally {
      DataReload();
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
    <PointsContext.Provider
      value={{ pointsAdded, handleAddPoint, handleRemovePoint, loading }}
    >
      {children}
    </PointsContext.Provider>
  );
};
