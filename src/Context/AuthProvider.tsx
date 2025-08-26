/* eslint-disable react-refresh/only-export-components */
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";

type AuthAction =
  | { type: "LOGIN"; payload: { token: string } }
  | { type: "LOGOUT" };

interface AuthState {
  token: string | null;
  level: string | null;
  userId: string | null;
}

interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

type JwtPayload = {
  userId?: string;
  level?: string;
  exp?: number; // segs desde epoch
};

function decodeAndValidate(token: string) {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded?.exp || !decoded.userId || !decoded.level) return null;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp <= now) return null;

    return { userId: decoded.userId, level: decoded.level, exp: decoded.exp };
  } catch {
    return null;
  }
}

function clearToken() {
  localStorage.removeItem("token");
}

function persistToken(token: string) {
  localStorage.setItem("token", token);
}

/** Inicializa já derivando dados do token */
function loadInitialState(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) return { token: null, level: null, userId: null };

  const info = decodeAndValidate(token);
  if (!info) {
    clearToken();
    return { token: null, level: null, userId: null };
  }

  return { token, level: info.level, userId: info.userId };
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN": {
      const { token } = action.payload;
      const info = decodeAndValidate(token);

      if (!info) {
        clearToken();
        return { token: null, level: null, userId: null };
      }

      persistToken(token);
      return { token, level: info.level, userId: info.userId };
    }

    case "LOGOUT": {
      clearToken();
      return { token: null, level: null, userId: null };
    }

    default:
      return state;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, undefined!, loadInitialState);

  // revalida ao montar (protege contra tokens expirados entre sessões)
  useEffect(() => {
    if (!state.token) return;
    const info = decodeAndValidate(state.token);
    if (!info) dispatch({ type: "LOGOUT" });
  }, []); // monta uma vez

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
