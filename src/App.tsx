import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Class } from "./pages/Class";
import { useAuth } from './Context/AuthProvider';
import { useEffect } from 'react';

function App() {

  const { dispatch } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      dispatch({ type: 'LOGIN', payload: { token } });
    }
  }, []); 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sala-9-11" element={<Class minAge={9} maxAge={11} />} />
        <Route path="/sala-6-8" element={<Class minAge={6} maxAge={8} />} />
        <Route path="/sala-3-5" element={<Class minAge={3} maxAge={5} />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;