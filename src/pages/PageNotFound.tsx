import { Link } from 'react-router-dom';

export function PageNotFound(){
  return(
    <>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <h1 className="text-5xl text-gray-800 mb-4">Ops!</h1>
        <p className="text-xl text-gray-600 mb-8">A página que você está procurando não foi encontrada.</p>
        <Link to="/" className="text-blue-600 hover:underline">Voltar para a página inicial</Link>
      </div>
    </>
  )
}