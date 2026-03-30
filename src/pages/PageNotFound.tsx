import { Link } from "react-router-dom";
import { useTheme } from "../Context/ThemeContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
        <figure className="max-h-64 w-auto">
          <DotLottieReact
            src="https://lottie.host/d965a172-848d-4e44-bed3-993f2e6694b5/wWzUQzKfeD.lottie"
            loop
            autoplay
          />
        </figure>
        <h1 className="text-5xl mb-4">404 Ops! 404</h1>
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
