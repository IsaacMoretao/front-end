/* eslint-disable react-refresh/only-export-components */
import {jwtDecode} from "jwt-decode";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

// Defina os tipos de ações possíveis
type AuthAction =
  | { type: "LOGIN"; payload: { token: string; level: string; userId: string } }
  | { type: "LOGOUT" };

// Defina o tipo para o estado de autenticação
interface AuthState {
  token: string | null;
  level: string | null;
  userId: string | null;
}

// Crie o contexto de autenticação
interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Defina o provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

// Função para carregar o estado inicial do localStorage
function loadInitialState(): AuthState {
  return {
    token: localStorage.getItem("token") || null,
    level: localStorage.getItem("level") || null,
    userId: localStorage.getItem("userId") || null,
  };
}

type JwtPayload = {
  userId: string;
  level: string;
  exp: number;
  iat: number;
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      const decoded: JwtPayload = jwtDecode(action.payload.token);

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("level", decoded.level);
      localStorage.setItem("userId", decoded.userId);

      return {
        token: action.payload.token,
        level: decoded.level,
        userId: decoded.userId,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("level");
      localStorage.removeItem("userId");
      return { token: null, level: null, userId: null };
    default:
      return state;
  }
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, loadInitialState());

  console.log("Initial auth state from localStorage:", state);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
