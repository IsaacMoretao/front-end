import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Class } from "./pages/Class";
import { useAuth } from './Context/AuthProvider';
import { useEffect, useState } from 'react';
import { Loader } from "./pages/loader";
import './Stylles/Loader.css';
import { PageNotFound } from "./pages/PageNotFound";

function App() {
  const { state, dispatch } = useAuth();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500) // Tempo de simulação de carregamento em milissegundos

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token');
    const level = localStorage.getItem('level');
  
    if (token) {
      dispatch({ type: 'LOGIN', payload: {
        token,
        level: level ?? ''
      } });
    }
  }, []);
  return (
    <Router>
      <Routes>
        {state.token === null || state.token === '' ? (
          <>
            <Route
              path="/login"
              element={loading ? <Loader /> : <Login />}
            />
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <>
            <Route 
                path="/home" 
                element={loading ? <Loader /> : <Home />} 
            />
            <Route path="/loader" element={<Loader />} />
            <Route 
                path="/sala-9-11" 
                element={loading ? <Loader /> : <Class minAge={9} maxAge={11} />} 
            />
            <Route 
                path="/sala-6-8" 
                element={loading ? <Loader /> : <Class minAge={6} maxAge={8} />} 
            />
            <Route 
                path="/sala-3-5" 
                element={loading ? <Loader /> : <Class minAge={3} maxAge={5} />} 
            />
            <Route 
                path="/sala-8-11" 
                element={loading ? <Loader /> : <Class minAge={8} maxAge={11} />} 
            />
            <Route 
                path="/sala-4-7" 
                element={loading ? <Loader /> : <Class minAge={4} maxAge={7} />} 
            />
            <Route 
                path="/" 
                element={loading ? <Loader /> : <Home />} 
            />
            <Route path="*" element={<PageNotFound />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;