import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/axios"; // Ajuste conforme necessário

interface Point {
  value: number;
  date: string;
}

interface Product {
  id: number;
  nome: string;
  birthDate: string;
  pontos: number;
  pointsAdded: number;
  points: Point[];
}

interface ProductContextType {
  products: Product[];
  DataReload: () => Promise<void>;
  setMin: React.Dispatch<React.SetStateAction<number>>;
  setMax: React.Dispatch<React.SetStateAction<number>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(100);

  // Função para buscar produtos, agora recebe min e max como parâmetros
  const fetchProducts = useCallback(async (minAge: number, maxAge: number) => {
    try {
      const response = await api.get("/children/filterByAge", {
        params: { minAge, maxAge },
      });

      if (!Array.isArray(response.data)) {
        throw new Error("Dados retornados não são um array");
      }

      setProducts(response.data);
    } catch (error: unknown) {
      console.error("Erro ao buscar os dados:", error);
      setProducts([]);
    }
  }, []); // Removemos min e max das dependências

  // Atualiza os produtos ao montar o componente ou quando min/max mudam
  useEffect(() => {
    fetchProducts(min, max);
  }, [min, max, fetchProducts]);

  // Função para recarregar os dados
  const DataReload = async (): Promise<void> => {
    await fetchProducts(min, max); // Passa os valores atuais de min e max
  };

  return (
    <ProductContext.Provider value={{ products, DataReload, setMin, setMax }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext deve ser usado dentro de um ProductProvider");
  }
  return context;
};