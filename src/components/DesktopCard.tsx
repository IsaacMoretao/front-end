import { useEffect, useState, useMemo } from "react";
// import { PopupDetails } from "./PopupDetails";
import {
  IconButton,
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Backdrop,
} from "@mui/material";
import { DotsThreeVertical } from "phosphor-react";
import { usePointsContext } from "../Context/PointsContext";
import { InfoPointsModal } from "./InfoPointsModal";
// import { SxProps, Theme } from "@mui/material/styles";
import { useUpdateChild } from "../http/types/useUpdateChild";

interface Product {
  id: number;
  nome: string;
  avatar: string;
  idade?: string;
  pontos?: number;
  pointsAdded: number;
  dateOfBirth?: string;
  points: number;
}

interface DesktopCardProps {
  product: Product;
  darkMode: boolean;
  stateLevel: string;
  userId: number;
  onDelete: (ids: number[]) => void;
  onUpdated?: (updated: Product) => void;
}

export function DesktopCard({
  product,
  darkMode,
  // stateLevel,
  userId,
  onDelete,
  onUpdated,
}: DesktopCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [infoChartOpen, setInfoChartOpen] = useState(false);

  const { setInitialPoints, handleAddPoint, handleRemovePoint, pointsAdded } =
    usePointsContext();

  // const addedPoints = pointsAdded[product.id] || 0;

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const { mutateAsync: updateChild } = useUpdateChild();

  const [editOpen, setEditOpen] = useState(false);
  const [formNome, setFormNome] = useState(product.nome || "");
  const [formDate, setFormDate] = useState<string>("");
  const [formPoints, setFormPoints] = useState<number>(product.points || 0);
  const [saving, setSaving] = useState(false);

  const normalizeDateForInput = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return "";
  };

  const openEdit = () => {
    setFormNome(product.nome || "");
    setFormDate(normalizeDateForInput(product.dateOfBirth));
    setFormPoints(product.points);
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);

    await updateChild({
      id: product.id,
      nome: formNome,
      dateOfBirth: formDate,
      points: Number(formPoints),
      userId: Number(userId),
    });

    onUpdated?.({
      ...product,
      nome: formNome,
      dateOfBirth: formDate,
      points: Number(formPoints),
    });

    setSaving(false);
    setEditOpen(false);
  };

  useEffect(() => {
    if (pointsAdded[product.id] === undefined) {
      setInitialPoints({ [product.id]: product.points || 0 });
    }
  }, [product, pointsAdded, setInitialPoints]);

  const modalSx = useMemo(
    () => ({
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 420,
      color: darkMode ? "#fff" : "#232323",
      bgcolor: darkMode ? "#232323" : "#fff",
      boxShadow: 24,
      p: 3,
      borderRadius: 12,
    }),
    [darkMode]
  );

  return (
    <>
      {/* Modal edição */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={modalSx}>
          <Typography variant="h6">Editar Criança</Typography>

          <Stack spacing={2} mt={2}>
            <TextField
              label="Nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
            />

            <TextField
              label="Nascimento"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Pontos"
              type="number"
              value={formPoints}
              onChange={(e) => setFormPoints(Number(e.target.value))}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={() => setEditOpen(false)}>Cancelar</Button>

              <Button variant="contained" onClick={handleSave}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      {/* Avatar expandido */}
      <Backdrop open={openAvatar} onClick={() => setOpenAvatar(false)}>
        <Box
          component="img"
          src={product.avatar}
          sx={{
            maxHeight: "80vh",
            maxWidth: "80vw",
            borderRadius: 2,
          }}
        />
      </Backdrop>

      {/* Card Desktop */}
      <section
        className={`hidden lg:flex items-center justify-between p-4 rounded-xl shadow-md my-3 ${
          darkMode
            ? "bg-gray-800 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        {/* esquerda */}
        <div className="flex items-center gap-4 w-1/3">
          <img
            src={product.avatar}
            onClick={() => setOpenAvatar(true)}
            className="w-16 h-16 rounded-full object-cover cursor-pointer"
          />

          <div>
            <h2 className="font-semibold text-lg">{product.nome}</h2>
            <span className="text-sm opacity-70">
              {product.idade} anos
            </span>
          </div>
        </div>

        {/* pontos */}
        <div className="flex items-center gap-6">
          <span className="font-medium text-lg">
            Pontos: {product.points}
          </span>

          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:scale-105"
            onClick={() => handleAddPoint(product.id)}
            disabled={pointsAdded[product.id] >= 4}
          >
            +1
          </button>

          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105"
            onClick={() => handleRemovePoint(product.id)}
            disabled={pointsAdded[product.id] === 0}
          >
            -1
          </button>
        </div>

        {/* ações */}
        <div className="relative">
          <IconButton onClick={toggleMenu}>
            <DotsThreeVertical size={20} weight="bold" />
          </IconButton>

          {menuVisible && (
            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  openEdit();
                  setMenuVisible(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  onDelete([product.id]);
                  setMenuVisible(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Excluir
              </button>

              <button
                onClick={() => {
                  setInfoChartOpen(true);
                  setMenuVisible(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Info
              </button>
            </div>
          )}
        </div>
      </section>

      <InfoPointsModal
        classId={product.id}
        open={infoChartOpen}
        onClose={() => setInfoChartOpen(false)}
        months={12}
        aggregate="sum"
      />
    </>
  );
}