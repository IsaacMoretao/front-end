import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useTheme } from "../Context/ThemeContext";
import { ButtonHover } from "../components/ButtonHover";
import { Coins, HardDrives } from "phosphor-react";

export function Navigation() {
  const { darkMode } = useTheme();
  const { state } = useAuth();

  function text() {
    console.log(state.aceesAdmin)
  }

  return (
    <>
      <main
        className={`flex justify-center items-center gap-5 lg:ml-16 max-lg:flex-col min-h-[95vh] ${darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
      >
        {state.level === "ADMIN" ? (
          <a href={`${state.aceesAdmin}`} onClick={text} target="_blank" >
            <div className="wrapper">
              <div className="link_wrapper">
                <ButtonHover name={"Administração"} icon={<HardDrives size={36} color={darkMode ? "#7658ea" : "#5c46b2"} weight="duotone" />} />
              </div>
            </div>
          </a>
        ) : (
          <div className="wrapper">
            <div className="link_wrapper">
              <ButtonHover name={"Administração"} icon={<HardDrives size={36} color={darkMode ? "#7658ea" : "#5c46b2"} weight="duotone" />} />
            </div>
          </div>
        )}

        <Link to={"/galardao"}>
          <div className="wrapper">
            <div className="link_wrapper">
            <ButtonHover name={"Galardão"} icon={<Coins size={36} color={darkMode ? "#7658ea" : "#5c46b2"} weight="duotone" />} />

            </div>
          </div>

        </Link>

      </main>

    </>
  )
}