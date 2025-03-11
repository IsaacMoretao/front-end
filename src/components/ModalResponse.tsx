import { Modal, Box, Typography, Button } from "@mui/material";
import { CheckCircle, XCircle } from "phosphor-react";

interface ModalResponseProps {
  open: boolean;
  status: "success" | "error";
  response: string;
  onClose: () => void;
}

export function ModalResponse({ open, status, response, onClose }: ModalResponseProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-2xl shadow-lg"
        style={{
          backgroundColor: status === "success" ? "#D1FAE5" : "#FEE2E2", // Sucesso (verde) ou erro (vermelho)
        }}
      >
        <Typography
          variant="h6"
          className="flex flex-col justify-center items-center  font-bold text-lg mb-4"
          style={{
            color: status === "success" ? "#065F46" : "#B91C1C", // Texto baseado no status
          }}
        >
          {status === "success" ? (<CheckCircle size={88} color="#065F46" />) : (<XCircle size={88} color="#B91C1C" />)}

          {status === "success" ? "Success" : "Error"}
        </Typography>
        <Typography
          variant="body1"
          className="text-center py-6 text-gray-800"
        >
          {response}
        </Typography>
        <Button
          variant="contained"
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-md"
          onClick={onClose}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
