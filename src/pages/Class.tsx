import { useState, useEffect } from "react";
import {
  NotePencil,
  PencilSimple,
  Trash,
} from "phosphor-react";
import { Table } from "../components/Table";
import { api } from "../lib/axios";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthProvider";
import { usePointsContext } from "../Context/PointsContext";
import { PopupDetails } from "../components/PopupDetails";
import { useProductContext } from "../Context/DataContext";

interface Point { }

interface Product {
  id: number;
  nome: string;
  idade?: string; // Data no formato "YYYY-MM-DD"
  pontos: number;
  pointsAdded: number;
  dateOfBirth?: string;
  points: Point[];
}

interface Class {
  min: number;
  max: number;
}

export function Class({ min, max }: Class) {
  const [selected, setSelected] = useState<string[]>([]);
  const { pointsAdded, handleAddPoint, handleRemovePoint } = usePointsContext();
  // const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);
  const { darkMode } = useTheme();
  const { products, DataReload, setMin, setMax } = useProductContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { state } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const handleOpenPopup = (id: number) => {
    setSelectedProductId(id);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedProductId(null); // Limpa o ID quando o popup é fechado
  };

  useEffect(() => {
    setMin(min);
    setMax(max);
    DataReload();
  }, [min, max]);

  const handleSelectItem = (id: number) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const handleEdit = () => {
    if (selectedItems.length === 1) {
      const product = products.find((p) => p.id === selectedItems[0]);
      if (product) {
        setCurrentProduct(product);
        setIsEditing(true);
        setOpen(true);
      }
    }
  };

  const handleEditMobille = (product?: Product) => {
    console.log("product:", product);
    console.log("selected:", setSelected);
    console.log("products:", products);

    if (product) {
      setCurrentProduct(product);
      setIsEditing(true);
    } else if (Array.isArray(selected) && selected.length === 1) {
      const product = products?.find((p) => p.id.toString() === selected[0]);
      if (product) {
        setCurrentProduct(product);
        setIsEditing(true);
      }
    }
    setOpen(true);
  };

  const handleCreate = () => {
    setCurrentProduct({ id: 0, nome: "", idade: "", pointsAdded: 0, dateOfBirth: "", pontos: 0, points: [] });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    DataReload();
  }

  const handleSave = async () => {
    if (currentProduct) {
      try {
        // Prepara o array de pontos
        const pointsArray: Point[] = Array.isArray(currentProduct.points)
          ? currentProduct.points
          : [];

        // Valida a data de nascimento
        const dateOfBirth = currentProduct.dateOfBirth
          ? new Date(currentProduct.dateOfBirth)
          : null;

        if (!dateOfBirth || isNaN(dateOfBirth.getTime())) {
          throw new Error("Data de nascimento inválida.");
        }

        // Prepara o produto para envio no formato esperado
        const productToSave = {
          ...currentProduct,
          points: pointsArray,
          dateOfBirth: dateOfBirth.toISOString().split("T")[0], // Garante formato ISO
        };

        if (isEditing) {
          await api.put(`/children/${currentProduct.id}`, productToSave);
          // setProducts((prev) =>
          //   prev.map((p) => (p.id === currentProduct.id ? productToSave : p))
          // );
        } else {
          const response = await api.post("/children", [productToSave]);
          console.log(response)
          DataReload();
        }
        DataReload();
        handleClose();
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
      }
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const response = await api.delete("/delete/", {
        data: { ids },
      });

      if (response.status === 200) {
        DataReload();
      }
    } catch (error) {
      console.error("Error deleting products:", error);
    }
  };

  const toggleMenu = (id: number) => {
    setMenuVisibleId(menuVisibleId === id ? null : id);
  };

  const filterProducts = (): Product[] => {
    return products.filter((product) =>
      product.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const fetchMoreData = () => {
    // Incrementa a página para carregar novos dados
    const nextPage = page + 1;
    const filteredProducts = filterProducts(); // Produtos filtrados pelo termo de busca
    const newProducts = filteredProducts.slice(
      nextPage * ITEMS_PER_PAGE,
      (nextPage + 1) * ITEMS_PER_PAGE
    );

    // Verifica se todos os produtos já foram carregados
    if (displayedProducts.length >= filteredProducts.length) {
      setHasMore(false);
      return;
    }

    // Atualiza a lista de produtos exibidos e a página
    setDisplayedProducts((prevProducts) => [...prevProducts, ...newProducts]);
    setPage(nextPage);
  };

  useEffect(() => {
    const filteredProducts = filterProducts();
    setDisplayedProducts(filteredProducts.slice(0, ITEMS_PER_PAGE));
    setPage(0);
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
  }, [searchTerm, products]);

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numberOfPoints = Number(e.target.value);

    setCurrentProduct((prevProduct) => {
      if (!prevProduct) return null;

      const pointsArray = new Array(numberOfPoints).fill({});

      return {
        ...prevProduct,
        points: pointsArray,
      };
    });
  };

  return (
    <>
      <main
        className={`p-16 lg:ml-16 min-h-[95vh] max-md:hidden shadow-md ${darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
      >
        <div
          className={`rounded-2xl h-full p-5 ${darkMode ? "bg-gray-800" : "bg-white"
            }`}
        >
          <header>
            <div className="flex gap-3 mb-3">
              {state.level === "ADMIN" ? (
                <button
                  onClick={handleEdit}
                  disabled={selectedItems.length !== 1}
                  className={`${selectedItems.length !== 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                >
                  <PencilSimple size={35} color="#5C46B2" />
                </button>
              ) : (
                <button className="opacity-50 cursor-not-allowed">
                  <PencilSimple size={35} color="#000" />
                </button>
              )}
              <button onClick={handleCreate} className="px-4 py-2">
                <NotePencil size={35} color="#5C46B2" weight="duotone" />
              </button>

              {state.level === "ADMIN" ? (
                <button
                  onClick={() => handleDelete(selectedItems)}
                  disabled={selectedItems.length === 0}
                  className={`${selectedItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                >
                  <Trash size={36} color="#5C46B2" weight="duotone" />
                </button>
              ) : (
                <button className="opacity-50 cursor-not-allowed">
                  <Trash size={36} color="#5C46B2" weight="duotone" />
                </button>
              )}
            </div>
            <Table
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              onSelectItem={handleSelectItem}
              minAge={min}
              maxAge={max}
            />
          </header>
        </div>
      </main>
      <div
        className={`md:hidden min-h-[100vh] p-5 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <InfiniteScroll
          dataLength={displayedProducts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          endMessage={<></>}
          scrollThreshold={0.9}
        >
          <TextField
            id="search"
            label="Search"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            className="mb-4"
            InputProps={{
              style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" },
            }}
            InputLabelProps={{
              style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: darkMode ? "#f5f5f5" : "#1a1a1a",
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
              },
            }}
          />

          <>
            {Array.isArray(displayedProducts) &&
              displayedProducts.map((product) => {
          
                return (
                  <>
                    {isPopupOpen && selectedProductId === product.id && (
                      <PopupDetails
                        id={selectedProductId}
                        onClose={handleClosePopup}
                      />
                    )}
                    <section
                      key={product.id}
                      className={`lg:hidden flex p-4 rounded-lg shadow-md relative my-5 ${darkMode
                        ? "bg-gray-800 text-gray-100"
                        : "bg-white text-gray-900"
                        }`}
                    >
                      <div className="flex-grow pl-4">
                        <header className="flex justify-between items-center mb-2">
                          <h2 className="font-semibold text-sm">
                            {product.nome}
                          </h2>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{`Idade: ${product.idade} anos`}</span>
                            <div className="relative">
                              <button
                                onClick={() => toggleMenu(product.id)}
                                className="focus:outline-none"
                              >
                                &#x22EE;
                              </button>
                              {menuVisibleId === product.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                                  {state.level != "ADMIN" ? (
                                    <></>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleEditMobille(product);
                                          setMenuVisibleId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDelete([product.id]);
                                          setMenuVisibleId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Excluir
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleOpenPopup(product.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Info
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </header>
                        <p className="text-sm mb-2">...</p>
                        <footer className="flex justify-between text-sm">
                          <span>{`Pontos: ${product.points.length}`}</span>
                          <div>
                            <button
                              className="ml-1 bg-blue-500 text-white px-2 py-1 rounded"
                              onClick={() => handleAddPoint(product.id)}
                              disabled={product.pointsAdded >= 4}
                            >
                              +1 Ponto
                            </button>
                            <button
                              className="ml-1 bg-red-500 text-white px-2 py-1 rounded"
                              onClick={() => handleRemovePoint(product.id)}
                              disabled={
                                pointsAdded[product.id] === 0
                              }
                            >
                              -1 Ponto
                            </button>
                          </div>
                        </footer>
                        <div className="p-3">
                          <div className="flex mt-2">
                            {Array.from({ length: product.pointsAdded }).map((_, index) => (
                              <span
                                key={index}
                                className="ml-1 bg-blue-500 text-white px-2 py-1 rounded-full"
                              >
                                +1
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )

              })}
          </>
        </InfiniteScroll>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            {isEditing ? "Editar Criança" : "Criar Criança"}
          </Typography>
          {currentProduct && (
            <Box
              component="form"
              sx={{ mt: 2 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <TextField
                label="Nome"
                fullWidth
                margin="normal"
                value={currentProduct.nome || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    nome: e.target.value,
                  })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                value={currentProduct.dateOfBirth || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    dateOfBirth: e.target.value, // Garante "YYYY-MM-DD"
                  })
                }
              />
              <TextField
                label="Pontos"
                fullWidth
                margin="normal"
                type="number"
                value={
                  Array.isArray(currentProduct.points)
                    ? currentProduct.points.length
                    : 0
                }
                onChange={handlePointsChange}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Salvar
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
