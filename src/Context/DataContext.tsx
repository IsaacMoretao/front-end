import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import { api } from "../lib/axios";
import { useParams, useSearchParams } from "react-router-dom";

interface Product {
  id: number;
  nome: string;
  birthDate: string;
  avatar: string;
  pontos: number;
  pointsAdded: number;
  dateOfBirth: string;
  points: number;
}

interface ApiResponse {
  total: number;
  pageSize: number;
  currentSkip: number;
  hasNextPage: boolean;
  data: Product[];
}

interface ProductContextType {
  products: Product[];
  DataReload: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasNextPage: boolean;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { salaParams } = useParams<{ salaParams?: string }>();

  const [searchParams] = useSearchParams();
  // min/max da URL
  const { min, max } = useMemo(() => {
    // 1) query string ?min=..&max=..
    const qsMin = searchParams.get("min");
    const qsMax = searchParams.get("max");
    if (qsMin !== null && qsMax !== null) { // <- só entra se ambos existem
      const qMin = Number(qsMin);
      const qMax = Number(qsMax);
      if (!Number.isNaN(qMin) && !Number.isNaN(qMax)) {
        return { min: qMin, max: qMax };
      }
    }

    // 2) segmento /.../:salaParams (ex: "5-10")
    if (salaParams) {
      const [minStr, maxStr] = salaParams.split("-");
      const segMin = Number(minStr);
      const segMax = Number(maxStr);
      return {
        min: Number.isFinite(segMin) ? segMin : 0,
        max: Number.isFinite(segMax) ? segMax : 100,
      };
    }

    // 3) fallback
    return { min: 0, max: 100 };
  }, [salaParams, searchParams]);

  const [skip, setSkip] = useState<number>(0);
  const [take] = useState<number>(10);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // (opcional) trava anti-duplicidade de chamadas
  const inFlight = useRef(false);

  // 🔧 Agora aceitamos skipParam explícito para evitar ler um skip “defasado” da closure
  const fetchProducts = useCallback(
    async (opts?: { isReload?: boolean; skipParam?: number }) => {
      const isReload = opts?.isReload ?? false;
      const effectiveSkip = typeof opts?.skipParam === "number" ? opts!.skipParam : skip;

      if (loading || inFlight.current) return;
      try {
        inFlight.current = true;
        setLoading(true);
        console.log("salaParams =>", salaParams);
        const response = await api.get<ApiResponse>("/children/filterByAge", {
          params: {
            minAge: min,
            maxAge: max,
            skip: effectiveSkip,
            take, ...(searchTerm && { search: searchTerm }),
          },
        });

        const { data: productsArray, hasNextPage: hasNext, currentSkip } = response.data;

        if (!Array.isArray(productsArray)) {
          throw new Error("A propriedade 'data' não é um array");
        }

        const isSearching = searchTerm.trim().length > 0;

        setProducts((prev) => (isReload || isSearching ? productsArray : [...prev, ...productsArray]));

        const nextSkip = (typeof currentSkip === "number" ? currentSkip : effectiveSkip) + take;
        setSkip(isSearching ? 0 : nextSkip);
        setHasNextPage(isSearching ? false : Boolean(hasNext));

      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        if (isReload) {
          setProducts([]);
          setHasNextPage(true);
          setSkip(0);
        }
      } finally {
        setLoading(false);
        inFlight.current = false;
      }
    },
    [skip, take, min, max, loading, searchTerm]
  );

  // 🔄 Recarrega quando min/max mudarem e também no primeiro mount
  useEffect(() => {
    (async () => {
      await DataReload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  const DataReload = useCallback(async () => {
    // zera estado local ANTES e chama fetch com skipParam = 0
    setProducts([]);
    setHasNextPage(true);
    setSkip(0);
    await fetchProducts({ isReload: true, skipParam: 0 });
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;
    await fetchProducts({ isReload: false }); // usa o skip atual
  }, [hasNextPage, loading, fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        DataReload,
        loadMore,
        hasNextPage,
        loading,
        searchTerm,
        setSearchTerm
      }}
    >
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
