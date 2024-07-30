import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Defina os tipos de ações possíveis
type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; level: string } } 
  | { type: 'LOGOUT' };

// Defina o tipo para o estado de autenticação
interface AuthState {
  token: string | null;
  level: string | null; // Adicionando o nível ao estado de autenticação
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

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token); // Armazenar token no localStorage
      localStorage.setItem('level', action.payload.level); 
      return { ...state, token: action.payload.token, level: action.payload.level }; // Incluindo level
    case 'LOGOUT':
      localStorage.removeItem('token'); // Remover token do localStorage no logout
      localStorage.removeItem('level');
      return { ...state, token: "", level: "" }; // Resetando o token e o level
    default:
      return state;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    token: localStorage.getItem('token'),
    level: localStorage.getItem('level'), // Inicializando o level como null
  });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}