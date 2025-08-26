// Class.tsx (corrigido com paginação backend)

import { useState } from "react";
import { api } from "../lib/axios";
import {TextField } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthProvider";
import { useProductContext } from "../Context/DataContext";
import { ModalResponse } from "../components/ModalResponse";
import { MobilleCard } from "../components/CardsChild/mibille";



export function Class() {
  const { products, loadMore, hasNextPage, DataReload } = useProductContext();
  const { darkMode } = useTheme();
  const { state } = useAuth();


  const [searchTerm, setSearchTerm] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ status: "success" | "error"; message: string }>({
    status: "success",
    message: "",
  });

  const handleDelete = async (ids: number[]) => {
    if (!window.confirm("Você tem certeza que deseja excluir esta criança?")) return;
    try {
      const response = await api.delete("/delete/", { data: { ids } });
      if (response.status === 200) {
        setModalData({ status: "success", message: "Criança deletada com sucesso!" });
        setModalOpen(true);
        DataReload();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Erro desconhecido";
      setModalData({ status: "error", message: `Erro ao excluir criança: ${errorMessage}` });
      setModalOpen(true);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
     {/* Este é para versão desktop */}
      <main className={`p-16 lg:ml-16 min-h-[95vh] hidden shadow-md ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className={`rounded-2xl h-full p-5 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <header>

            {/* <Table
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              onSelectItem={handleSelectItem}
              minAge={min}
              maxAge={max}
            /> */}
          </header>
        </div>
      </main>

      <div className={` min-h-[100vh] p-5 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <TextField
          id="search"
          label="Search"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="mb-4"
          InputProps={{ style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" } }}
          InputLabelProps={{ style: { color: darkMode ? "#f5f5f5" : "#1a1a1a" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: darkMode ? "#f5f5f5" : "#1a1a1a" },
              "&:hover fieldset": { borderColor: darkMode ? "#ffffff" : "#000000" },
              "&.Mui-focused fieldset": { borderColor: darkMode ? "#ffffff" : "#000000" },
            },
          }}
        />
        <InfiniteScroll
          dataLength={filteredProducts.length}
          next={loadMore}
          hasMore={!!hasNextPage}
          loader={<h4>Loading...</h4>}
          scrollThreshold={0.9}
        >
          {filteredProducts.map((product) => (
            <MobilleCard
              key={product.id}
              product={product}
              darkMode={darkMode}
              stateLevel={state.level ?? ""}
              onDelete={handleDelete}
              userId={Number(state.userId)}/>
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
