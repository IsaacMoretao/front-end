import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Sala9a11 } from "./pages/sala-9-11";
import { Sala6a8 } from "./pages/sala-6-8";
import { Sala3a5 } from "./pages/sala-3-5";
import { useAuth } from './Context/AuthProvider';
import { useEffect } from 'react';

function App() {

  const { dispatch } = useAuth();

  useEffect(() => {
    // Recupere o token do localStorage ao carregar a página
    const token = localStorage.getItem('token');

    if (token) {
      // Chame o dispatch para atualizar o estado com o token
      dispatch({ type: 'LOGIN', payload: { token } });
    }
  }, []); 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sala-9-11" element={<Sala9a11 />} />
        <Route path="/sala-6-8" element={<Sala6a8 />} />
        <Route path="/sala-3-5" element={<Sala3a5 />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;