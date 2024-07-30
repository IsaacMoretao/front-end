import {
  Toolbar,
  Typography,
  Box,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { ChalkboardTeacher, Gear, House, NotePencil } from "phosphor-react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/axios";
import { useTheme } from "../Context/ThemeContext";

interface Product {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
}

export function Header() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const location = useLocation();
  const path = location.pathname;

  let title = "";

  if (path.endsWith("/home") || path.endsWith("/")) {
    title = "HOME";
  } else if (/\/sala($|\/.*)/.test(path)) {
    title = "SALA";
  } else if (path.endsWith("/config")) {
    title = "CONFIG";
  } else {
    title = "...";
  }

  const getIcon = (path: string) => {
    if (path.endsWith("/home") || path.endsWith("/")) {
      return <House size={35} color="#fff" weight="duotone" />;
    } else if (/\/sala($|\/.*)/.test(path)) {
      return <ChalkboardTeacher size={36} color="#fff" weight="duotone" />;
    } else if (path.endsWith("/config")) {
      return <Gear size={36} color="#fff" weight="duotone" />;
    }
    return null;
  };

  // const toggleDrawer = () => {
  //   setDrawerOpen(!drawerOpen);
  // };

  const handleClose = () => setOpen(false);

  const handleCreate = () => {
    setCurrentProduct({ id: 0, nome: "", idade: 0, pontos: 0 });
    setIsEditing(false); // Garantindo que não estamos no modo de edição
    setOpen(true);
  };

  const handleSave = async () => {
    if (currentProduct) {
      try {
        if (!isEditing) {
          // Adiciona nova criança
          const response = await api.post("/children", currentProduct);
          setProducts((prev) => [...prev, response.data]);
        }
        handleClose();
      } catch (error) {
        console.error("Error saving product:", error);
      }
    }
  };

  return (
    <>
      <header className="z-50 max-lg:rounded-b-lg overflow-hidden lg:ml-16 right-0 top-0">
        <Toolbar className="flex justify-between items-center h-16 bg-gradient-to-r from-purple-500 to-purple-400">
          <Typography
            component="div"
            className="flex items-center justify-center gap-3 font-bold"
          >
            {getIcon(path)}

            <p className="mt-2">{title}</p>
          </Typography>
          <div className="flex items-center">
            <button
              onClick={handleCreate}
              className="block lg:hidden px-4 py-2"
            >
              <NotePencil size={35} color="#5C46B2" weight="duotone" />
            </button>
          </div>
        </Toolbar>
      </header>
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
            color: `${darkMode ? "#fff" : "#232323"}`,
            bgcolor: `${darkMode ? "#232323" : "#fff"}`,
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Criar Criança
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
