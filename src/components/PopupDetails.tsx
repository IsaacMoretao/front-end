import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { api } from "../lib/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Point {
  id: number;
  createdAt: string;
  classId: number;
}

interface Product {
  id: number;
  nome: string;
  idade: number;
  pontos: number;
  points: Point[];
}

export function PopupDetails({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);

  const fetchProductById = async () => {
    try {
      const response = await api.get(`/children/filterById/${id}`);

      if (response.data && typeof response.data === "object") {
        setProduct(response.data as Product);
      } else {
        console.error("Os dados retornados não são um objeto:", response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  useEffect(() => {
    fetchProductById();
  }, [id]);

  if (!product) return null;

  const pointsByMonth = Array.isArray(product.points)
    ? product.points.reduce((acc: Record<string, number>, point) => {
        const month = new Date(point.createdAt).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
      }, {})
    : {};

  const chartData = {
    labels: Object.keys(pointsByMonth),
    datasets: [
      {
        label: "Pontos por Mês",
        data: Object.values(pointsByMonth),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{product.nome}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <p className="mb-2">
          <strong>Idade:</strong> {product.idade} anos
        </p>
        <p className="mb-4">
          <strong>Pontos Totais:</strong> {product.pontos}
        </p>

        <div className="space-y-4">
          <Bar data={chartData} />
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
