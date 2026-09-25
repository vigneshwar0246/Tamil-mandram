import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";

export const AuthContext = createContext(null);

function decodeUser(token) {
  // Lightweight local read of the JWT payload (not for security, only UX).
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { id: payload.sub, role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    if (!token) return null;
    const u = decodeUser(token);
    if (!u || (u.exp && u.exp * 1000 < Date.now())) return null;
    return u;
  });

  useEffect(() => {
    if (!user && getToken()) setToken(null);
  }, [user]);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setToken(data.access_token);
    const u = decodeUser(data.access_token);
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    return login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
