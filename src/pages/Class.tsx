// Class.tsx

import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { TextField } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthProvider";
import { useProductContext } from "../Context/DataContext";
import { ModalResponse } from "../components/ModalResponse";
import { MobilleCard } from "../components/CardsChild/mibille";
import { DesktopCard } from "../components/DesktopCard";

export function Class() {
  const {
    products,
    loadMore,
    hasNextPage,
    DataReload,
    searchTerm,
    setSearchTerm,
    minAge,
    maxAge,
    setMinAge,
    setMaxAge,
  } = useProductContext();

  const { darkMode } = useTheme();
  const { state } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    status: "success" | "error";
    message: string;
  }>({
    status: "success",
    message: "",
  });

  const handleDelete = async (ids: number[]) => {
    if (!window.confirm("Você tem certeza que deseja excluir esta criança?"))
      return;

    try {
      const response = await api.delete("/delete/", { data: { ids } });

      if (response.status === 200) {
        setModalData({
          status: "success",
          message: "Criança deletada com sucesso!",
        });

        setModalOpen(true);
        DataReload();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Erro desconhecido";

      setModalData({
        status: "error",
        message: `Erro ao excluir criança: ${errorMessage}`,
      });

      setModalOpen(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      DataReload();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <>
      {/* BUSCA */}
      <div className="p-5 lg:ml-16">
        <TextField
          id="search"
          label="Buscar pelo nome"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
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

        <div className="flex  gap-3 mb-4 mt-3">
          <TextField
            label="Idade mínima"
            type="number"
            value={minAge}
            onChange={(e) => setMinAge(Number(e.target.value))}
            size="small"
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

          <TextField
            label="Idade máxima"
            type="number"
            value={maxAge}
            onChange={(e) => setMaxAge(Number(e.target.value))}
            size="small"
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
        </div>
      </div>

      {/* DESKTOP */}
      <main
        className={`hidden lg:block p-16 lg:ml-16 min-h-[95vh] shadow-md ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div
          className={`rounded-2xl h-full p-5 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <header>
            {products.map((product) => (
              <DesktopCard
                key={product.id}
                product={product}
                darkMode={darkMode}
                stateLevel={state.level ?? ""}
                onDelete={handleDelete}
                userId={Number(state.userId)}
              />
            ))}
          </header>
        </div>
      </main>

      {/* MOBILE */}
      <div
        className={`lg:hidden min-h-[100vh] p-5 max-md:p-2 ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <InfiniteScroll
          dataLength={products.length}
          next={loadMore}
          hasMore={!!hasNextPage}
          loader={<h4>Loading...</h4>}
          scrollThreshold={0.9}
        >
          {products.map((product) => (
            <MobilleCard
              key={product.id}
              product={product}
              darkMode={darkMode}
              stateLevel={state.level ?? ""}
              onDelete={handleDelete}
              userId={Number(state.userId)}
            />
          ))}
        </InfiniteScroll>
      </div>

      <ModalResponse
        open={modalOpen}
        status={modalData.status}
        response={modalData.message}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}