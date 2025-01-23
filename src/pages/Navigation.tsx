import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useTheme } from "../Context/ThemeContext";

export function Navigation() {
  const { darkMode } = useTheme();
  const { state } = useAuth();

  function text() {
    console.log(state.aceesAdmin)
  }

  return (
    <>
      <main
        className={`flex justify-center items-center gap-5 lg:ml-16 max-lg:flex-col min-h-[95vh]  ${darkMode ? "bg-gray-900" : "bg-white"
          }`}
      >
        {state.level === "ADMIN" ? (
          <a href={`${state.aceesAdmin}`} onClick={text} target="_blank" >
            <div className="wrapper">
              <div className="link_wrapper">
                <button className={`ancor rounded ${darkMode ? "border-[3px] border-gray-100 text-gray-100" : "border-[3px] border-gray-900 text-gray-900"
                  }`}>Administração</button>
              </div>
            </div>
          </a>
        ) : (
          <div className="wrapper">
            <div className="link_wrapper">
              <button className={`ancor opacity-50 cursor-default rounded ${darkMode ? "border-[3px] border-gray-100 text-gray-100" : "border-[3px] border-gray-900 text-gray-900"
                }`}>Administração</button>
            </div>
          </div>
        )}

        <Link to={"/galardao"}>
          <div className="wrapper">
            <div className="link_wrapper">
              <button className={`ancor rounded ${darkMode ? "border-[3px] border-gray-100 text-gray-100" : "border-[3px] border-gray-900 text-gray-900"
                }`}>Galardão</button>
            </div>
          </div>

        </Link>

      </main>

    </>
  )
}