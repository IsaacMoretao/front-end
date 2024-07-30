import { Link } from "react-router-dom";
import GirlCrying from "../../assets/girl-crying.png";
import { useTheme } from "../Context/ThemeContext";

export function PageNotFound() {
  const { darkMode } = useTheme();

  return (
    <>
      <div
        className={`flex flex-col justify-center items-center h-screen ${
          darkMode
            ? "text-gray-100 bg-gray-800"
            : "text-gray-900 bg-gray-100"
        }`}
      >
        <img src={GirlCrying} alt="" className="h-32" />
        <h1 className="text-5xl mb-4">Ops!</h1>
        <p className="text-xl mb-8">
          A página que você está procurando não foi encontrada.
        </p>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    </>
  );
}
