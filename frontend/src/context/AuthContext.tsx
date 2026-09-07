import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { authApi } from "@/services/authApi";
import { RegisterPayload } from "@/types/api";

const TOKEN_KEY = "vv_token";

//shape: ({ user, login, logout }), plus the
//async/backend extras (loading, register, refreshUser)
interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>; // error message or null
  register: (payload: RegisterPayload) => Promise<string | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //restore the session on load if a token exists.
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((u) => setUser(u as User))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user as User);
      return null;
    } catch (err: unknown) {
      return extractError(err, "Login failed. Please try again.");
    }
  };

  const register = async (payload: RegisterPayload): Promise<string | null> => {
    try {
      const { token, user } = await authApi.register(payload);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user as User);
      return null;
    } catch (err: unknown) {
      return extractError(err, "Sign up failed. Please try again.");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    try { setUser((await authApi.me()) as User); } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

//pulls the friendliest message out of an axios error (validation error or message).
function extractError(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { message?: string; errors?: { msg: string }[] } } };
  const data = anyErr?.response?.data;
  if (data?.errors?.length) return data.errors[0].msg;
  return data?.message ?? fallback;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
