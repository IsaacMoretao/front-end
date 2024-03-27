import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Defina os tipos de ações possíveis
type AuthAction =
  | { type: 'LOGIN'; payload: { token: string } }
  | { type: 'LOGOUT' };

// Defina o tipo para o estado de autenticação
interface AuthState {
  token: string | null;
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
      return { ...state, token: action.payload.token };
    case 'LOGOUT':
      return { ...state, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, { token: null });

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