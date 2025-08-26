// context/PointsProvider.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { useAddPoint } from "../http/types/useAddPoint";
import { useRemovePoint } from "../http/types/useRemovePoint";


interface PointsAdded {
  [key: number]: number;
}

interface PointsContextType {
  pointsAdded: PointsAdded;
  handleAddPoint: (childId: number) => void;
  animatePoints: { [key: number]: boolean };
  handleRemovePoint: (childId: number) => void;
  setInitialPoints: (initial: PointsAdded) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);



export const usePointsContext = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePointsContext must be used within a PointsProvider");
  }
  return context;
};

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const { state, dispatch } = useAuth();
  const addPointMutation = useAddPoint();
  const removePointMutation = useRemovePoint();

  const [pointsAdded, setPointsAdded] = useState<PointsAdded>({});
  const [animatePoints, setAnimatePoints] = useState<{ [key: number]: boolean }>({});

  const setInitialPoints = (initial: PointsAdded) => {
    setPointsAdded((prev) => {
      const merged: PointsAdded = { ...prev };
      for (const key in initial) {
        const id = Number(key);
        if (merged[id] === undefined) {
          merged[id] = initial[id]; // só seta se ainda não foi definido
        }
      }
      return merged;
    });
  };

  const handleAddPoint = async (childId: number) => {
    const userId = Number(state.userId);
    if (!userId) {
      console.error("Usuário inválido para retirar ponto.");
      dispatch({ type: "LOGOUT" });
      return;
    }

    const current = pointsAdded[childId] || 0;

    if (current >= 4) return; // respeita o limite de 4

    // ✅ Atualização otimista
    setPointsAdded((prev) => ({
      ...prev,
      [childId]: current + 1,
    }));

    setAnimatePoints((prev) => ({ ...prev, [childId]: true }));
    setTimeout(() => {
      setAnimatePoints((prev) => ({ ...prev, [childId]: false }));
    }, 800);

    try {
      const userId = state.userId;
      if (!userId) {
        console.error("Usuário inválido para adicionar ponto.");
        dispatch({ type: "LOGOUT" });
        return;
      }
      await addPointMutation.mutateAsync({ childId, userId });
    } catch (err) {
      // ❌ Reverter se a API falhar
      setPointsAdded((prev) => ({
        ...prev,
        [childId]: Math.max((prev[childId] || 1) - 1, 0),
      }));
      console.error("Erro ao adicionar ponto:", err);
    }
  };


  const handleRemovePoint = async (childId: number) => {
    const current = pointsAdded[childId] || 0;
    if (current <= 0) return;

    // Otimista: decrementa antes da resposta da API
    setPointsAdded((prev) => ({
      ...prev,
      [childId]: Math.max(current - 1, 0),
    }));

    try {
      await removePointMutation.mutateAsync({ childId });
    } catch (err) {
      // Reverte se der erro
      setPointsAdded((prev) => ({
        ...prev,
        [childId]: prev[childId] + 1,
      }));
      console.error("Erro ao remover ponto:", err);
    }
  };

  return (
    <PointsContext.Provider
      value={{ pointsAdded, handleAddPoint, animatePoints, setInitialPoints, handleRemovePoint }}
    >
      {children}
    </PointsContext.Provider>
  );
};

