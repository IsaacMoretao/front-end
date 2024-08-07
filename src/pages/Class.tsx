import { useState, useEffect } from "react";
import { NotePencil, PencilSimple, Trash, UserCirclePlus } from "phosphor-react";
import { Table } from "../components/Table";
import { api } from "../lib/axios";

import { Modal, Box, Button, TextField, Typography } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "../Context/ThemeContext";
import usePoints from "../Context/UsePoints";
import { useAuth } from "../Context/AuthProvider";

interface Product {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

interface Class {
  min: number;
  max: number;
}

export function Class({ min, max }: Class) {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { pointsAdded, handleAddPoint, handleRemovePoint } = usePoints();

  const { state } = useAuth();

  const ITEMS_PER_PAGE = 10;

  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const response = await api.get("/children/filterByAge", {
        params: { minAge: min, maxAge: max },
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

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await fetchProducts();
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
    if (product) {
      setCurrentProduct(product);
      setIsEditing(true);
    } else if (selectedItems.length === 1) {
      const product = products.find((p) => p.id === selectedItems[0]);
      if (product) {
        setCurrentProduct(product);
        setIsEditing(true);
      }
    }
    setOpen(true);
  };

  const handleCreate = () => {
    setCurrentProduct({ id: 0, nome: "", idade: 0, pontos: 0 });
    setIsEditing(false);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (currentProduct) {
      try {
        if (isEditing) {
          await api.put(`/children/${currentProduct.id}`, currentProduct);
          setProducts((prev) =>
            prev.map((p) => (p.id === currentProduct.id ? currentProduct : p))
          );
        } else {
          const response = await api.post("/children", currentProduct);
          setProducts((prev) => [...prev, response.data]);
        }
        handleClose();
      } catch (error) {
        console.error("Error saving product:", error);
      }
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      // Envia a lista de IDs em uma única chamada de API
      const response = await api.delete("/delete/", {
        data: { ids },
      });

      if (response.status === 200) {
        // Atualiza a lista de produtos removendo os IDs deletados
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        setSelectedItems([]);
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
      product.nome.toLowerCase().includes("")
    );
  };

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

  useEffect(() => {
    const filteredProducts = products.filter((product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedProducts(filteredProducts);
  }, [searchTerm, products]);

  return (
    <>
      <InfiniteScroll
        dataLength={displayedProducts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more products to display</p>}
        scrollThreshold={0.1}
      >
        <main
          className={`p-16 lg:ml-16 min-h-[95vh] max-md:hidden shadow-md ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <div
            className={`rounded-2xl h-full p-5 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <header>
              <div className="flex gap-3 mb-3">
                {state.level != "ADMIN" || state.token === "" ? (
                  <button
                    onClick={handleEdit}
                    disabled={selectedItems.length !== 1}
                    className={`${
                      selectedItems.length !== 1
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <PencilSimple size={35} color="#5C46B2" />
                  </button>
                ) : (
                  <button className="opacity-50 cursor-not-allowed">
                    <UserCirclePlus size={35} color="#5C46B2" />

                  </button>
                )}
                <button onClick={handleCreate} className="px-4 py-2">
                  <NotePencil size={35} color="#5C46B2" weight="duotone" />
                </button>
                {state.level != "ADMIN" || state.token === "" ? (
                  <button
                    onClick={() => handleDelete(selectedItems)}
                    disabled={selectedItems.length === 0}
                    className={`${
                      selectedItems.length === 0
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
              <p
                className={`font-bold mb-3 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Essa sala tem alunos de {min} a {max} anos
              </p>
            </header>
            <Table
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              onSelectItem={handleSelectItem}
              minAge={min}
              maxAge={max}
            />
          </div>
        </main>
        <article
          className={`sm:p-16 max-sm:p-4 min-h-[95vh] hidden max-md:block
          ${darkMode ? "bg-gray-900" : "bg-gray-200"}`}
        >
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`file:mb-4 p-2 border border-gray-300 rounded w-full ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
          />
          {Array.isArray(displayedProducts) &&
            displayedProducts.map((product) => (
              <section
                key={product.id}
                className={`lg:hidden flex p-4 rounded-lg shadow-md relative my-5 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
              >
                <div className="flex-grow pl-4">
                  <header className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-sm">{product.nome}</h2>
                    <div className="flex items-center space-x-2">
                      <span className=" text-xs">
                        {`Idade: ${product.idade} anos`}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(product.id)}
                          className="focus:outline-none"
                        >
                          &#x22EE;
                        </button>
                        {menuVisibleId === product.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
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
                          </div>
                        )}
                      </div>
                    </div>
                  </header>
                  <p className="text-sm mb-2">...</p>
                  <footer className="flex justify-between text-sm">
                    <span>{`Pontos: ${product.pontos}`}</span>
                    <div>
                      <button
                        className="ml-1 bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleAddPoint(product.id)}
                        disabled={
                          pointsAdded[product.id]?.length >= 4 &&
                          Date.now() - (pointsAdded[product.id]?.[0] || 0) <=
                            2 * 60 * 1000
                        }
                      >
                        +1 Ponto
                      </button>
                      <button
                        className="ml-1 bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRemovePoint(product.id)}
                        disabled={
                          pointsAdded[product.id]?.length === 0 ||
                          Date.now() -
                            pointsAdded[product.id]?.[
                              pointsAdded[product.id].length - 1
                            ] >
                            60 * 1000
                        }
                      >
                        -1 Ponto
                      </button>
                    </div>
                  </footer>
                  <div className="p-3">
                    {pointsAdded[product.id] &&
                      pointsAdded[product.id].map((timestamp, index) => (
                        <span
                          key={index}
                          className="ml-1 bg-gray-500 text-white px-2 py-1 rounded transition-all duration-300"
                          style={{
                            opacity: Date.now() - timestamp > 60 * 1000 ? 0 : 1,
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
                </div>
              </section>
            ))}
        </article>
      </InfiniteScroll>
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
            {isEditing ? "Editar Produto" : "Criar Produto"}
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
                label="Idade"
                fullWidth
                margin="normal"
                type="number"
                value={currentProduct.idade || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    idade: Number(e.target.value),
                  })
                }
              />
              <TextField
                label="Pontos"
                fullWidth
                margin="normal"
                type="number"
                value={currentProduct.pontos || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    pontos: Number(e.target.value),
                  })
                }
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
