import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Paper, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';
import LoginImage from '../assets/Logo.png';
import Logo from "../assets/LogoSmall.svg"
import { api } from '../lib/axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [server, setServer] = useState(false)

  const verifyServer = async () => {
    try {
      setServer(false);
      const response = await api.get(`/children/`);
      if (response.data && response.data.children.length > 0) {
        setServer(false);
      } else {
        setServer(true);
      }
    } catch (error) {
      setServer(false);
      console.error('Erro ao verificar o servidor:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backend-kids.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });
      if (!response.ok) { 
        throw new Error('Falha ao fazer login');
      }
      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);
      const { token, level } = responseData;
      sessionStorage.setItem('token', token);
      dispatch({ type: 'LOGIN', payload: {
        token,
        level
      } });
      navigate('/home');
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Erro ao fazer login. Por favor, tente novamente.');
    }
  };

  const handleProfessorLogin = () => {
    setEmail('verboaruja@kids.com');
    setPassword('123456');
  };
  
  return (
    <Container>
      <AppBar position="static" color="inherit">
        <Toolbar className="flex items-center justify-between">
          <Typography variant="h6" component="div">
            <img src={Logo} className="h-10 sm:h-12 md:h-14 lg:h-16" alt="" />
          </Typography>
          <div className="flex items-center">


            {server ? (
              <Button color="error" onClick={verifyServer} className="hidden sm:block">
                Servidor dormindo
              </Button>
            ) : (
              <Button color="success" onClick={verifyServer} className="hidden sm:block">
                Acordar servidor
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap="30px"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12} sm={6} md={8}>
          <img src={LoginImage} alt="Login" style={{ maxWidth: '200px', height: 'auto' }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            {error && <p>{error}</p>} 
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <TextField
                type="email"
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                type="password"
                label="Password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                style={{ marginTop: '16px' }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                style={{ marginTop: '16px' }}
                onClick={handleProfessorLogin}
              >
                Entrar como Escalado
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
