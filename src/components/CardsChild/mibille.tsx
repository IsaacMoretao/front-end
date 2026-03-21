// MobilleCard.tsx
import { useEffect, useState, useMemo } from "react";
import { PopupDetails } from "../PopupDetails";
import { IconButton, Modal, Box, Typography, TextField, Button, Stack } from "@mui/material";
import { DotsThreeVertical } from "phosphor-react";
import { usePointsContext } from "../../Context/PointsContext";
import { InfoPointsModal } from "../InfoPointsModal";
import { SxProps, Theme } from '@mui/material/styles';
import { useUpdateChild } from '../../http/types/useUpdateChild'

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

interface MobilleCardProps {
    product: Product;
    darkMode: boolean;
    stateLevel: string;
    userId: number
    onDelete: (ids: number[]) => void;
    onUpdated?: (updated: Product) => void;
}

export function MobilleCard({
    product,
    darkMode,
    stateLevel,
    userId,
    onDelete,
    onUpdated,
}: MobilleCardProps) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const { setInitialPoints } = usePointsContext();
    const [infoChartOpen, setInfoChartOpen] = useState(false);

    const { handleAddPoint, pointsAdded, animatePoints, handleRemovePoint } = usePointsContext();
    const addedPoints = pointsAdded[product.id] || 0;

    const toggleMenu = () => setMenuVisible(!menuVisible);
    // const handlePopupOpen = () => setIsPopupOpen(true);
    const handlePopupClose = () => setIsPopupOpen(false);

    // ---------- NOVO: estado do modal de edição ----------
    const [editOpen, setEditOpen] = useState(false);
    const [formNome, setFormNome] = useState(product.nome || "");
    const [formDate, setFormDate] = useState<string>("");
    const [formPoints, setFormPoints] = useState<number>(product.points || 0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const tfSx: SxProps<Theme> = darkMode
        ? {
            "& .MuiInputBase-input": { color: "#f3f4f6" },
            "& .MuiInputLabel-root": { color: "#d1d5db" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#4b5563" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#9ca3af" },
            "& .MuiFormHelperText-root": { color: "#9ca3af" },
        }
        : {}

    const cancelBtnSx: SxProps<Theme> = darkMode
        ? { color: "#e5e7eb", borderColor: "#6b7280", "&:hover": { borderColor: "#9ca3af" } }
        : {}

    const saveBtnSx: SxProps<Theme> = darkMode
        ? { backgroundColor: "#3b82f6", "&:hover": { backgroundColor: "#2563eb" } }
        : {}

    // helper para normalizar a data no formato YYYY-MM-DD para o input type=date
    const normalizeDateForInput = (d?: string) => {
        if (!d) return "";
        const dt = new Date(d);
        // protege contra "Invalid Date" se já vier como YYYY-MM-DD
        if (!isNaN(dt.getTime())) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, "0");
            const day = String(dt.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        }
        // se já estiver no formato correto, mantém
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
        return "";
    };

    // abre o modal populando o formulário com os dados atuais
    const openEdit = () => {
        setFormNome(product.nome || "");
        setFormDate(normalizeDateForInput(product.dateOfBirth));
        setFormPoints(typeof product.points === "number" ? product.points : 0);
        setSaveError(null);
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
    };

    const { mutateAsync: updateChild } = useUpdateChild()

    // salva no backend
    const handleSave = async () => {
        try {
            setSaving(true)
            setSaveError(null)
            await updateChild({
                id: product.id,
                nome: formNome,
                dateOfBirth: formDate,      // "YYYY-MM-DD"
                points: Number(formPoints), // total desejado
                userId: Number(userId)
            })

            // opcional: se você passar onUpdated no pai, pode continuar chamando
            onUpdated?.({ ...product, nome: formNome, dateOfBirth: formDate, points: Number(formPoints) } as any)

            setEditOpen(false)
        } catch (e: any) {
            setSaveError(e?.message || 'Erro ao salvar.')
        } finally {
            setEditOpen(false)
        }
    }
    // ---------- FIM NOVO ----------

    useEffect(() => {
        if (!product) return;

        if (pointsAdded[product.id] === undefined) {
            const initial =
                typeof product.pointsAdded === "number"
                    ? product.pointsAdded
                    : typeof product.points === "number"
                        ? product.points
                        : 0;

            setInitialPoints({ [product.id]: initial });
        }
    }, [product.id, product.pointsAdded, product.points, pointsAdded, setInitialPoints]);

    // estilos do modal
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
            {isPopupOpen && <PopupDetails id={product.id} onClose={handlePopupClose} />}

            {/* --------- Modal de Edição --------- */}
            <Modal
                open={editOpen}
                onClose={closeEdit}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                slotProps={{
                    backdrop: { sx: { backgroundColor: darkMode ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" } },
                }}
            >
                <Box sx={modalSx}>
                    <Typography id="modal-title" variant="h6" component="h2" sx={{ color: darkMode ? "#f9fafb" : "inherit" }}>
                        Editar Criança
                    </Typography>

                    <Stack spacing={2} mt={2} component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={formNome}
                            onChange={(e) => setFormNome(e.target.value)}
                            sx={tfSx}
                            InputLabelProps={{ shrink: true, sx: { color: darkMode ? "#d1d5db" : undefined } }}
                        />

                        <TextField
                            label="Data de Nascimento"
                            fullWidth
                            type="date"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            sx={tfSx}
                            InputLabelProps={{ shrink: true, sx: { color: darkMode ? "#d1d5db" : undefined } }}
                        />

                        <TextField
                            label="Pontos (total)"
                            fullWidth
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={formPoints}
                            onChange={(e) => setFormPoints(Number(e.target.value))}
                            helperText="Ao salvar, o backend zera e recria os pontos para bater com esse total."
                            sx={tfSx}
                            InputLabelProps={{ shrink: true, sx: { color: darkMode ? "#d1d5db" : undefined } }}
                            FormHelperTextProps={{ sx: { color: darkMode ? "#9ca3af" : undefined } }}
                        />

                        {saveError && (
                            <Typography variant="body2" color="error">
                                {saveError}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button onClick={closeEdit} disabled={saving} variant="outlined" sx={cancelBtnSx}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" disabled={saving} sx={saveBtnSx}>
                                {saving ? "Salvando..." : "Salvar"}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Modal>
            {/* --------- Fim Modal de Edição --------- */}

            <section
                className={`lg:hidden flex p-4 rounded-lg shadow-md relative my-5 ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                    }`}
            >
                <img
                    className="w-36 h-36 rounded-full object-cover mr-5"
                    src={`${import.meta.env.VITE_BASE_URL}/${product.avatar}`}
                    alt={product.nome}
                />
                <div className="flex flex-col w-full">

                    <header className="flex justify-between items-center mb-2">

                        <h2 className="font-semibold text-sm truncate whitespace-nowrap max-w-[70%] overflow-hidden">
                            {product.nome}
                        </h2>
                        <div className="flex items-center space-x-2 ">
                            <span className="text-xs">{`${product.idade} anos`}</span>

                            <div className="relative">
                                <IconButton onClick={toggleMenu} aria-label="Menu" className={darkMode ? "text-gray-100" : "text-gray-800"}
                                >
                                    <DotsThreeVertical
                                        size={20}
                                        weight="bold"
                                        color={darkMode ? "#f5f5f5" : "#1f2937"} // #f5f5f5 ~ gray-100, #1f2937 ~ gray-800
                                    />
                                </IconButton>
                                {menuVisible && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                                        {stateLevel === "ADMIN" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        openEdit();       // <<< abre o modal de edição
                                                        setMenuVisible(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        onDelete([product.id]);
                                                        setMenuVisible(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Excluir
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setInfoChartOpen(true);
                                                        setMenuVisible(false);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Info
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <footer className="flex justify-between text-sm">
                        <span>{`Pontos: ${product.points}`}</span>
                        <div>
                            <button
                                className={`ml-1 bg-blue-500 text-white px-2 py-1 rounded transition-all duration-300 ease-in-out hover:scale-110 active:scale-90 relative overflow-hidden `}
                                onClick={() => handleAddPoint(product.id)}
                                disabled={pointsAdded[product.id] >= 4}
                            >
                                +1 Ponto
                            </button>

                            <button
                                className="ml-1 bg-red-500 text-white px-2 py-1 rounded transition-transform duration-300 ease-in-out hover:scale-110 active:scale-90"
                                onClick={() => handleRemovePoint(product.id)}
                                disabled={pointsAdded[product.id] === 0}
                            >
                                -1 Ponto
                            </button>
                        </div>
                    </footer>

                    <div className="p-3">
                        <div className="flex mt-2">
                            {Array.from({ length: addedPoints }).map((_, index) => (
                                <span
                                    key={index}
                                    className={`ml-1 bg-green-500 text-white px-2 py-1 rounded-full transition-all duration-700 ease-in-out transform ${animatePoints[product.id] ? "animate-pulse scale-105" : ""
                                        }`}
                                >
                                    +1
                                </span>
                            ))}
                        </div>
                    </div>
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
