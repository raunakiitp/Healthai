import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUser, fetchMe } from "../utils/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "healthai_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(true); // checking stored token

  // On mount, validate stored token
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setAuthLoading(false);
      return;
    }
    fetchMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // Token invalid/expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const _persist = useCallback((tok, usr) => {
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    setUser(usr);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { token: tok, user: usr } = await loginUser({ email, password });
    _persist(tok, usr);
    return usr;
  }, [_persist]);

  const register = useCallback(async ({ email, username, password }) => {
    const { token: tok, user: usr } = await registerUser({ email, username, password });
    _persist(tok, usr);
    return usr;
  }, [_persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("healthai_history"); // clear local guest history too
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    const { user: usr } = await fetchMe();
    setUser(usr);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
