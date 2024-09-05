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
  pontos: number;
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

// interface PointsAdded {
//   [key: number]: number[];
// }

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
  // const [pointsAdded, setPointsAdded] = useState<PointsAdded>({});
  const { pointsAdded, handleAddPoint, handleRemovePoint } = usePointsContext();
  const [selectAll, setSelectAll] = useState(false);
  const { darkMode } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  // useEffect(() => {
  //   const storedPoints = localStorage.getItem('pointsAdded');
  //   if (storedPoints) {
  //     setPointsAdded(JSON.parse(storedPoints));
  //   }
  // }, []);
  

  // const handleAddPoint = async (productId: number) => {
  //   try {
  //     const response = await api.post(`/addPoint/${productId}`);
      
  //     if (response.status === 201) {
  //       setPointsAdded((prevPoints) => {
  //         const currentTime = Date.now();
  //         const updatedPoints = prevPoints[productId] || [];
          
  //         const filteredPoints = updatedPoints.filter(
  //           (timestamp) => currentTime - timestamp <= 60 * 1000
  //         );
  
  //         if (filteredPoints.length < 4) {
  //           filteredPoints.push(currentTime);
  //           const newPointsAdded = { ...prevPoints, [productId]: filteredPoints };
  //           localStorage.setItem('pointsAdded', JSON.stringify(newPointsAdded)); 
  //           return newPointsAdded;
  //         }
  //         return prevPoints;
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Erro ao adicionar ponto:', error);
  //   }
  // };  

  // const handleRemovePoint = async (productId: number) => {
  //   try {
  //     const response = await api.delete(`/deletePoint/${productId}`);
      
  //     if (response.status === 200) {
  //       setPointsAdded((prevPoints) => {
  //         // Remove o ponto apenas se o tempo não tiver expirado
  //         const currentTime = Date.now();
  //         const updatedPoints = prevPoints[productId] || [];
  //         const filteredPoints = updatedPoints.filter(
  //           (timestamp) => currentTime - timestamp <= 60 * 1000
  //         );
  
  //         // Remove o ponto se ele estiver dentro do intervalo de tempo permitido
  //         if (filteredPoints.length > 0) {
  //           filteredPoints.shift(); // Remove o ponto mais antigo
  //           const newPointsAdded = { ...prevPoints, [productId]: filteredPoints };
  //           localStorage.setItem('pointsAdded', JSON.stringify(newPointsAdded)); // Atualiza o localStorage
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
              displayedProducts.map((product) => (
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
                  <td className="p-3">{product.pontos}</td>
                  <td className="p-3 flex flex-col">
                    <div className="flex">
                      <button
                        className="ml-1 bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleAddPoint(product.id)}
                        disabled={
                          pointsAdded[product.id]?.length >= 4 &&
                          Date.now() - (pointsAdded[product.id]?.[0] || 0) <=
                          5 * 60 * 60 * 1000
                        }
                      >
                        +1 ponto
                      </button>
                      <button
                        className="ml-1 bg-red-500 text-white px-2 py-1 rounded"
                         onClick={() => handleRemovePoint(product.id)}
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
                      {pointsAdded[product.id] &&
                        pointsAdded[product.id].map((timestamp, index) => (
                          <span
                            key={index}
                            className="ml-1 bg-blue-500 text-white px-2 py-1 rounded transition-all duration-300"
                            style={{
                              opacity:
                                Date.now() - timestamp > 60 * 1000 ? 0 : 1,
                              transform:
                                Date.now() - timestamp > 60 * 1000
                                  ? "translateY(-10px)"
                                  : "translateY(0)",
                            }}
                          >
                            +1
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
}
