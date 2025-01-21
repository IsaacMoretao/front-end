import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

// Defina os tipos de ações possíveis
type AuthAction =
  | { type: "LOGIN"; payload: { token: string; level: string; userId: string; aceesAdmin: string; } }
  | { type: "LOGOUT" };

// Defina o tipo para o estado de autenticação
interface AuthState {
  token: string | null;
  level: string | null;
  userId: string | null;
  aceesAdmin: string | null;
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
    aceesAdmin: localStorage.getItem("aceesAdmin") || null,
  };
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  console.log("Action dispatched:", action);
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("level", action.payload.level);
      localStorage.setItem("userId", action.payload.userId);
      localStorage.setItem("aceesAdmin", action.payload.aceesAdmin);
      return {
        ...state,
        token: action.payload.token,
        level: action.payload.level,
        userId: action.payload.userId,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("level");
      localStorage.removeItem("userId");
      localStorage.removeItem("aceesAdmin");
      return { token: null, level: null, userId: null, aceesAdmin: null };
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
