import { createContext, useContext, useEffect, useState } from 'react';
import { json, setToken, getToken } from './api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    json('/auth/me').then(d => setUser(d.user)).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const d = await json('/auth/login', { method: 'POST', body: { email, password } });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };
  const logout = () => { setToken(null); setUser(null); };
  const refresh = () => json('/auth/me').then(d => setUser(d.user));

  return <Ctx.Provider value={{ user, ready, login, logout, refresh }}>{children}</Ctx.Provider>;
}
