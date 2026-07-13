import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Custom hook so components just do `const { user } = useAuth()`
// instead of importing useContext + AuthContext everywhere.
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // `loading` covers the brief window on page load/refresh where we don't
  // yet know if the user is logged in. Without this, a protected route would
  // briefly flash "redirect to login" even for an already-logged-in user,
  // because `user` starts as null before we've had a chance to check.
  const [loading, setLoading] = useState(true);

  // On first mount (e.g. page refresh), ask the backend "who am I?" — the
  // httpOnly cookie is sent automatically by the browser, so if it's valid,
  // the backend tells us who's logged in without us handling the token at all.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        // No valid cookie / not logged in — this is a normal, expected state,
        // not an error worth showing the user.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const value = { user, loading, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
