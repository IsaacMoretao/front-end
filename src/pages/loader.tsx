import { useTheme } from "../Context/ThemeContext";
import "../Stylles/Loader.css";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function Loader() {
  const { darkMode } = useTheme();
  return (
    <>
      <span className="flex flex-col justify-center items-center h-[100vh]">
        <figure className="max-h-64 w-auto">
          <DotLottieReact
            src="https://lottie.host/7e2cccb9-8f16-4324-9200-0536c2d4d9f4/HL9xCXAswr.lottie"
            loop
            autoplay
          />
        </figure>

        <p className={`font-bold text-black my-0 ${darkMode ? "text-gray-50" : "text-black"}`}>CARREGANDO . . .</p>
      </span>
    </>
  );
}
