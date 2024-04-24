import '../Stylles/Loader.css';
import eclipse from "../../assets/Eclipse.gif"

export function Loader() {
  return(
    <>
      <span className="flex flex-col justify-center items-center h-[100vh]">
        <img src={eclipse} className="h-[100px]" />
        <p className="font-bold text-black my-10">CARREGANDO . . .</p>
      </span>
    </>
  )
}