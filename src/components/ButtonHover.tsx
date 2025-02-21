import { useTheme } from "../Context/ThemeContext";
import "../Stylles/Button.css"

export function ButtonHover(props: { name: string, icon?: React.ReactNode }) {
  const { darkMode } = useTheme();

  return (
    <div className="max-h-[72px]">
      <div className="buttons">
        <button className={`blob-btn ${darkMode ? "text-purple-400" : "text-purple-500"}`}>
          <div className="flex items-center justify-center gap-5">
            {props.icon}
            {props.name}
          </div>

          <span className={`blob-btn__inner ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <span className={`blob-btn__blobs`}>
              <span className="blob-btn__blob"></span>
              <span className="blob-btn__blob"></span>
              <span className="blob-btn__blob"></span>
              <span className="blob-btn__blob"></span>
            </span>
          </span>
        </button>
        <br />
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" result="goo"></feColorMatrix>
              <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  )
}