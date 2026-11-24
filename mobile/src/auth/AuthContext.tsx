import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User } from '../types';
import { api } from '../api';

interface AuthValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}
const AuthContext = createContext<AuthValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    api.onUnauthorized = () => {
      api.setToken(null);
      setUser(null);
    };
    return () => {
      api.onUnauthorized = undefined;
    };
  }, []);
  const signIn = async (email: string, password: string) => {
    const session = await api.request<{ accessToken: string; user: User }>(
      '/auth/login',
      'POST',
      { email, password }
    );
    api.setToken(session.accessToken);
    setUser(session.user);
  };
  const signOut = () => {
    void api.request('/auth/logout', 'POST').catch(() => undefined);
    api.setToken(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
