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
  
  return (
    <PointsContext.Provider
      value={{ pointsAdded, handleAddPoint, handleRemovePoint, loading }}
    >
      {children}
    </PointsContext.Provider>
  );
};
