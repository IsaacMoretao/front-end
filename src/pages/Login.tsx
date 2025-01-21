import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import LoginImage from "../../assets/Logo.png";
import Logo from "../../assets/LogoSmall.svg";
import { api } from "../lib/axios";
import { Database } from "phosphor-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { dispatch } = useAuth();
  const [server, setServer] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const verifyServer = async () => {
    setIsLoading(true);
    setShowPopup(false); // Garantir que o pop-up não fique visível durante novas tentativas
    try {
      const response = await api.get(`/children/`);
      const hasChildren =
        Array.isArray(response.data) && response.data.length > 0;
      setServer(hasChildren);
    } catch (error) {
      setServer(false);
      setShowPopup(true); // Mostra o pop-up caso ocorra um erro
      console.error("Erro ao verificar o servidor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("https://backend-kids.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });
      if (!response.ok) {
        throw new Error("Falha ao fazer login");
      }
      const responseData = await response.json();
      console.log("Resposta do servidor:", responseData);

      const { token, level, userId, AceesAdmin } = responseData;

      const aceesAdmin = AceesAdmin;
      if (!userId) {
        console.error("userId não foi encontrado na resposta do servidor");
      }
      const stringUserId = userId ? String(userId) : "";

      // Armazena no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("level", level);
      localStorage.setItem("userId", stringUserId);
      localStorage.setItem("aceesAdmin", aceesAdmin)

      dispatch({
        type: "LOGIN",
        payload: {
          token,
          level,
          userId: stringUserId,
          aceesAdmin: aceesAdmin
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Erro ao fazer login. Por favor, tente novamente.");
    }
  };
  const handleProfessorLogin = () => {
    setEmail("verboaruja@kids.com");
    setPassword("123456");
  };

  return (
    <Container>
      <AppBar position="static" color="inherit">
        <Toolbar className="flex items-center justify-between">
          <Typography variant="h6" component="div">
            <img src={Logo} className="h-10 sm:h-12 md:h-14 lg:h-16" alt="" />
          </Typography>
          <div className="flex items-center">
            {isLoading ? (
              <span
                className={`loader inline-block w-5 h-5 border-2 border-t-2 border-t-transparent border-black rounded-full animate-spin`}
              ></span>
            ) : (
              <button onClick={verifyServer} className="flex items-center">
                <Database
                  size={35}
                  color={server === true ? "#2cb438" : "#e46962"}
                />
                {server === true ? (
                  <p className="text-green-500">Servidor OK</p>
                ) : (
                  <p className="text-red-500">Servidor com problema</p>
                )}
              </button>
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
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={12} sm={6} md={8}>
          <img
            src={LoginImage}
            alt="Login"
            style={{ maxWidth: "200px", height: "auto" }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <TextField
                type="text"
                label="Nome"
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
                onChange={(e: { target: { value: any; }; }) => setPassword(e.target.value)}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                style={{ marginTop: "16px" }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                style={{ marginTop: "16px" }}
                onClick={handleProfessorLogin}
              >
                Entrar como Escalado
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="text-red-600 font-bold">
              O servidor não está funcionando!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
