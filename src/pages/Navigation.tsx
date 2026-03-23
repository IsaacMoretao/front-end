import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useTheme } from "../Context/ThemeContext";
import { ButtonHover } from "../components/ButtonHover";
import { Coins, HardDrives } from "phosphor-react";

export function Navigation() {
  const { darkMode } = useTheme();
  const { state } = useAuth();

  return (
    <>
      <main
        className={`flex justify-center items-center gap-5 lg:ml-16 max-lg:flex-col min-h-[95vh] ${darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
      >
        {state.level === "ADMIN" &&
          <a href={`${import.meta.env.VITE_EXTERNAL_BASE_URL}`} target="_blank" >
            <div className="wrapper">
              <div className="link_wrapper">
                <ButtonHover name={"Administração"} icon={<HardDrives size={36} color={darkMode ? "#7658ea" : "#5c46b2"} weight="duotone" />} />
              </div>
            </div>
          </a>
        }

        <Link to={"/galardao"}>
          <div className="wrapper">
            <div className="link_wrapper">
              <ButtonHover name={"Galardão"} icon={<Coins size={36} color={darkMode ? "#7658ea" : "#5c46b2"} weight="duotone" />} />

            </div>
          </div>

        </Link>

        {/* <div className="wrapper">
          <div className="link_wrapper">
            <ButtonHover
              name={"Bater ponto"}
              icon={
                <span className="justify-center items-center relative flex m-2 h-5 w-5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              }
              />
          </div>
        </div> */}

      </main>

    </>
  )
}