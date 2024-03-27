import { Link } from 'react-router-dom'; 
// import { useAuth } from '../Context/AuthProvider';


export function Home() {
  // const { state, dispatch } = useAuth();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl text-black font-bold text-center my-8">Administração de Crianças:</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-center items-center">
        <div className="bg-blue-500 p-4 rounded-md w-full md:w-[300px] hover:bg-blue-600">
          <Link to="/sala-3-5" className="text-2xl text-center block text-white">
            Faixa Etária 3-5
          </Link>
        </div>

        <div className="bg-green-500 p-4 rounded-md w-full md:w-[300px] hover:bg-green-600">
          <Link to="/sala-6-8" className="text-2xl text-center block text-white">
            Faixa Etária 6-8
          </Link>
        </div>

        <div className="bg-red-500 p-4 rounded-md w-full md:w-[300px] hover:bg-red-600">
          <Link to="/sala-9-11" className="text-2xl text-center block text-white">
            Faixa Etária 9-11
          </Link>
        </div>
      </div>
    </div>
  );
}