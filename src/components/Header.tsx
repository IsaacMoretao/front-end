import {
  Toolbar,
  Typography,
  Box,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { useState } from "react";
import {
  ChalkboardTeacher,
  Coins,
  Gear,
  House,
  UserCircle,
  PresentationChart,
  NotePencil,
} from "phosphor-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/axios";
import { useTheme } from "../Context/ThemeContext";

interface Point { }

interface Product {
  id: number;
  nome: string;
  idade: string; // Data no formato "YYYY-MM-DD"
  avatarFile?: File;
  pontos: number;
  dateOfBirth: string;
  points: Point[];
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { darkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preview, setPreview] = useState<string | null>(null);



  const location = useLocation();
  const path = location.pathname;

  console.log(products)

  let title = "";
  let report = "";

  if (path.endsWith("/home") || path.endsWith("/")) {
    title = "HOME";
  } else if (/\/sala($|\/.*)/.test(path)) {
    title = "SALA";
  } else if (path.endsWith("/config")) {
    title = "CONFIG";
  } else if (path.endsWith("/admin")) {
    title = "ADMIN";
  } else if (path.endsWith("/galardao")) {
    title = "GALARDÃO";
  } else if (path.endsWith("/Relatorio")) {
    title = "RELATORIO";
    report = "hidden";
  } else if (path.endsWith("/myself")) {
    title = "MEUS DADOS";
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
    } else if (path.endsWith("/galardao")) {
      return <Coins size={36} color="#fff" weight="duotone" />;
    } else if (path.endsWith("/admin")) {
      return <PresentationChart size={36} color="#fff" weight="duotone" />;
    } else if (path.endsWith("/myself")) {
      return <UserCircle size={36} color="#fff" weight="duotone" />
    }
    return null;
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setOpen(false);
  };

  const handleCreate = () => {
    setCurrentProduct({ id: 0, nome: "", idade: "", dateOfBirth: "", pontos: 0, points: [] });
    setIsEditing(false);
    setOpen(true);
  };

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


  const handleSave = async () => {
    if (!currentProduct) return;

    try {
      const pointsArray: Point[] = Array.isArray(currentProduct.points)
        ? currentProduct.points
        : [];

      const dateOfBirth = currentProduct.dateOfBirth
        ? new Date(currentProduct.dateOfBirth)
        : null;

      if (!dateOfBirth || isNaN(dateOfBirth.getTime())) {
        throw new Error("Data de nascimento inválida.");
      }

      const productToSave = {
        nome: currentProduct.nome,
        dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        points: pointsArray,
      };

      const formData = new FormData();

      // 👇 Backend espera array
      formData.append("children", JSON.stringify([productToSave]));

      // 👇 Adiciona imagem se existir
      if (currentProduct.avatarFile) {
        formData.append("avatar", currentProduct.avatarFile);
      }

      if (isEditing) {
        await api.put(`/children/${currentProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const response = await api.post("/children", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setProducts((prev) => [...prev, ...response.data]);
      }

      handleClose();
    } catch (error) {
      console.error("Erro ao salvar criança:", error);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await resizeImage(file);

    setPreview(URL.createObjectURL(compressed)); // 👈 preview aqui

    setCurrentProduct((prev) =>
      prev ? { ...prev, avatarFile: compressed } : prev
    );
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const size = 500;
        canvas.width = size;
        canvas.height = size;

        // central crop
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx?.drawImage(
          img,
          sx,
          sy,
          minSide,
          minSide,
          0,
          0,
          size,
          size
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7 // qualidade 70%
        );
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <header className={`z-50 max-lg:rounded-b-lg overflow-hidden lg:ml-16 right-0 top-0 ${report}`}>
        <Toolbar className="flex justify-between items-center h-16 bg-gradient-to-r from-purple-500 to-purple-400">
          <Typography
            component="div"
            className="flex items-center justify-center gap-3 font-bold"
          >
            {getIcon(path)}

            <p className={"mt-2 text-gray-100"}>{title}</p>
          </Typography>
          {path.startsWith("/sala") && (
            <div className="flex items-center">
              <button
                onClick={handleCreate}
                className="block lg:hidden px-4 py-2"
              >
                <NotePencil size={35} color="#f3f4f6" weight="duotone" />
              </button>
            </div>
          )}
          {!path.endsWith("/myself") && !path.startsWith("/sala") && (
            <Link to="/myself">
              <UserCircle size={36} color="#fff" weight="duotone" />
            </Link>
          )}


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
            justifyItems: "center",
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

          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: 120, height: 120, borderRadius: "50%" }}
            />
          )}

          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            Selecionar Foto
            <input
              type="file"
              hidden
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
            />
          </Button>
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
                label="Data de Nascimento"
                fullWidth
                margin="normal"
                type="date"
                value={currentProduct.dateOfBirth || ""}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    dateOfBirth: e.target.value,
                  })
                }
                InputLabelProps={{
                  shrink: true, // Garante que o rótulo seja mostrado acima do campo
                }}
              />
              <TextField
                label="Pontos"
                fullWidth
                margin="normal"
                type="number"
                value={currentProduct.points ? currentProduct.points.length : 0}
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
