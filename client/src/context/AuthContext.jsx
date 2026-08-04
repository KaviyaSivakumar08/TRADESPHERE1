import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const C = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem('tradesphere_token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const auth = async (path, data) => {
    const r = await api.post(`/auth/${path}`, data);

    localStorage.setItem('tradesphere_token', r.data.token);
    setUser(r.data.user);

    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem('tradesphere_token');
    setUser(null);
  };

  return (
    <C.Provider
      value={{
        user,
        loading,
        auth,
        logout,
        setUser,
      }}
    >
      {children}
    </C.Provider>
  );
};

export const useAuth = () => useContext(C);