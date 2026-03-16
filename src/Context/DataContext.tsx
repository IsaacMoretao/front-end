import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { api } from "../lib/axios";

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

  minAge: number;
  maxAge: number;
  setMinAge: (value: number) => void;
  setMaxAge: (value: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const [skip, setSkip] = useState<number>(0);
  const [take] = useState<number>(10);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");

  // agora controlado pelo usuário (não vem mais da URL)
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(12);

  const inFlight = useRef(false);

  const fetchProducts = useCallback(
    async (opts?: { isReload?: boolean; skipParam?: number }) => {
      const isReload = opts?.isReload ?? false;
      const effectiveSkip = typeof opts?.skipParam === "number" ? opts.skipParam : skip;

      if (loading || inFlight.current) return;

      try {
        inFlight.current = true;
        setLoading(true);

        const response = await api.get<ApiResponse>("/children/filterByAge", {
          params: {
            minAge,
            maxAge,
            skip: effectiveSkip,
            take,
            ...(searchTerm && { search: searchTerm }),
          },
        });

        const { data: productsArray, hasNextPage: hasNext, currentSkip } = response.data;

        if (!Array.isArray(productsArray)) {
          throw new Error("A propriedade 'data' não é um array");
        }

        const isSearching = searchTerm.trim().length > 0;

        setProducts((prev) =>
          isReload || isSearching ? productsArray : [...prev, ...productsArray]
        );

        const nextSkip =
          (typeof currentSkip === "number" ? currentSkip : effectiveSkip) + take;

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
    [skip, take, minAge, maxAge, loading, searchTerm]
  );

  // recarrega quando idade mudar
  useEffect(() => {
    (async () => {
      await DataReload();
    })();
  }, [minAge, maxAge]);

  const DataReload = useCallback(async () => {
    setProducts([]);
    setHasNextPage(true);
    setSkip(0);

    await fetchProducts({ isReload: true, skipParam: 0 });
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loading) return;

    await fetchProducts({ isReload: false });
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
        setSearchTerm,
        minAge,
        maxAge,
        setMinAge,
        setMaxAge,
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