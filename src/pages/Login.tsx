import React, { useState } from 'react';
import { TextField, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthProvider';
import LoginImage from '../assets/Logo.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { token } = responseData;
      sessionStorage.setItem('token', token);
      dispatch({ type: 'LOGIN', payload: { token } });
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Erro ao fazer login. Por favor, tente novamente.');
    }
  };
  return (
    <Container>
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
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}