import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { api } from "../lib/axios";
import { useTheme } from "../Context/ThemeContext";
// import usePoints from "../Context/UsePoints";
import { DotsThreeOutline } from "phosphor-react";
import { PopupDetails } from "./PopupDetails";
import { usePointsContext } from "../Context/PointsContext";

interface Product {
  id: number;
  nome: string;
  idade: number;
  pointsAdded: number;
  points: Array<Object>;
}

const ITEMS_PER_PAGE = 10;

interface Class {
  min: number;
  max: number;
}

const fetchProducts = async (props: Class): Promise<Product[]> => {
  try {
    const response = await api.get("/children/filterByAge", {
      params: {
        minAge: props.min,
        maxAge: props.max,
      },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Os dados retornados não são um array:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    return [];
  }
};

interface ProductTableProps {
  selectedItems: number[];
  setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>;
  onSelectItem: (id: number) => void;
  minAge: number;
  maxAge: number;
}

export function Table({
  setSelectedItems,
  selectedItems,
  minAge,
  maxAge,
  onSelectItem,
}: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [searchNome, setSearchNome] = useState("");
  const { pointsAdded, handleAddPoint, handleRemovePoint, loading } = usePointsContext();
  const [selectAll, setSelectAll] = useState(false);
  const { darkMode } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const handleOpenPopup = (id: number) => {
    setSelectedProductId(id);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedProductId(null); // Limpa o ID quando o popup é fechado
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allItemIds = displayedProducts.map((product) => product.id);
      setSelectedItems(allItemIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await fetchProducts({ min: minAge, max: maxAge });
      if (Array.isArray(allProducts)) {
        const sortedProducts = allProducts.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setProducts(sortedProducts);
        setDisplayedProducts(sortedProducts.slice(0, ITEMS_PER_PAGE));
        setHasMore(sortedProducts.length > ITEMS_PER_PAGE);
      } else {
        console.error("Os dados retornados não são um array.");
      }
    };

    loadProducts();
  }, [minAge, maxAge]);

  const filterProducts = (): Product[] => {
    return products
      .filter((product) => {
        const matchesNome = product.nome
          .toLowerCase()
          .includes(searchNome.toLowerCase());

        return matchesNome;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  };

  useEffect(() => {
    const filteredProducts = filterProducts();
    const newProducts = filteredProducts.slice(0, ITEMS_PER_PAGE);
    setDisplayedProducts(newProducts);
    setPage(0);
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
  }, [searchNome]);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    const filteredProducts = filterProducts();
    const newProducts = filteredProducts.slice(
      nextPage * ITEMS_PER_PAGE,
      (nextPage + 1) * ITEMS_PER_PAGE
    );

    if (newProducts.length === 0) {
      setHasMore(false);
      return;
    }

    setDisplayedProducts((prevProducts) => [...prevProducts, ...newProducts]);
    setPage(nextPage);
  };

  return (
    <div className="overflow-x-auto text-black">
      <InfiniteScroll
        dataLength={displayedProducts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more products to display</p>}
        scrollThreshold={0.9}
      >
        <table
          className={`min-w-full overflow-hidden rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-white"
          } border border-gray-200`}
        >
          <thead>
            <tr className="bg-purple-500 text-white w-full">
              <th className="p-3">
                <input
                  className="px-5 py-2"
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectAll}
                />
              </th>
              <th className="p-3">NOME</th>
              <th className="p-3">IDADE</th>
              <th className="p-3">PONTOS</th>
              <th className="p-3">AÇÕES</th>
            </tr>
            <tr className="bg-transparent text-black">
              <th></th>
              <th className="p-3">
                <input
                  type="text"
                  placeholder="Pesquisar por nome"
                  value={searchNome}
                  onChange={(e) => setSearchNome(e.target.value)}
                  className="w-full px-2 py-1 bg-transparent border-none"
                />
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="hidden">
              <td className="p-3">
                <input />
              </td>
              <td className="p-3" />
              <td className="p-3" />
              <td className="p-3" />
              <td className="p-3 flex flex-col">
                <div className="flex">
                  <button className="ml-1 bg-blue-500 text-white px-2 py-1 w-20 rounded">
                    +1 ponto
                  </button>
                  <button>-1 ponto</button>
                </div>
              </td>
            </tr>
            {Array.isArray(displayedProducts) &&
              displayedProducts.map((product) => {
                const totalPoints =
                  (product.pointsAdded || 0) + (pointsAdded[product.id] || 0);
                return (
                  <tr
                    key={product.id}
                    className={`border-b transition-all rounded ${
                      darkMode
                        ? "text-gray-100 hover:bg-gray-600"
                        : "text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <td className="p-3">
                      <input
                        className={`px-5 py-2 ${
                          darkMode
                            ? "text-gray-100 hover:bg-gray-600"
                            : "text-gray-900 hover:bg-gray-200"
                        }`}
                        type="checkbox"
                        onChange={() => onSelectItem(product.id)}
                        checked={selectedItems.includes(product.id)}
                      />
                    </td>
                    <td className="p-3">{product.nome}</td>
                    <td className="p-3">{product.idade}</td>
                    <td className="p-3">{product.points.length}</td>
                    <td className="p-3 flex flex-col">
                      <div className="flex">
                        <button
                          className="ml-1 bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => handleAddPoint(product.id)}
                          disabled={pointsAdded[product.id] >= 4}
                        >
                          +1 ponto
                        </button>
                        <button
                          className="ml-1 bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleRemovePoint(product.id)}
                          disabled={pointsAdded[product.id] === 0}
                        >
                          -1 ponto
                        </button>
                        <button
                          className="ml-1 text-white px-2 py-1 rounded"
                          onClick={() => handleOpenPopup(product.id)} // Passa o ID da criança ao abrir o popup
                        >
                          <DotsThreeOutline size={45} color="#9ca3af" />
                        </button>

                        {isPopupOpen && selectedProductId === product.id && (
                          <PopupDetails
                            id={selectedProductId}
                            onClose={handleClosePopup}
                          />
                        )}
                      </div>
                      <div className="p-3">
                        {totalPoints > 0 && (
                          <div className="flex mt-2">
                            {Array.from({ length: totalPoints }).map(
                              (_, index) => (
                                <span
                                  key={`${product.id}-${index}`}
                                  className="ml-1 bg-blue-500 text-white px-2 py-1 rounded-full transition-all duration-300"
                                >
                                  {loading[product.id] ? (
                                    <span>...</span> // Ou use um ícone de carregamento, como o de "spinner"
                                  ) : (
                                    "+1"
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
}
