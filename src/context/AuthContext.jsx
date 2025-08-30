// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, setAccessToken } from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, _setAccessToken] = useState(null); // access хранится только в памяти
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // getter для axios interceptor
  const getToken = useCallback(() => accessToken, [accessToken]);
  setAccessToken(getToken);


  const setToken = (token) => {
    _setAccessToken(token);
  };

  // 🔑 Login: backend выдает accessToken + ставит httpOnly refresh cookie
  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials, {
      withCredentials: true,
    });
    const { accessToken: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    navigate("/profile");
    setAccessToken(newToken);
    return userData;
  };

  // 🔑 Register: то же самое
  const register = async (payload) => {
    const res = await api.post("/auth/register", payload, {
      withCredentials: true,
    });
    const { accessToken: newToken, user: userData } = res.data;
    setToken(newToken);

    setUser(userData);
    navigate("/profile");
    setAccessToken(newToken);
    return userData;
  };

  // Проверка email (например, при регистрации)
  const checkEmail = async (email) => {
    const res = await api.post("/auth/check-email", { email });
    return res.data;
  };

  // Logout: удаляет refresh cookie на сервере
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
    _setAccessToken(null);
    setAccessToken(() => null);
    setUser(null);
    navigate("/login");
  };

  // 🔄 Silent refresh при монтировании (если есть refresh cookie)
  useEffect(() => {
    if (pathname === "/login" || pathname === "/register" || pathname === "/auth/error" ) {
      setLoading(false); // чтобы не висело "loading..."
      return;
    }

    let mounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true });
        const { accessToken, user } = res.data;
        if (!mounted) return;
        setToken(accessToken);
        setAccessToken(accessToken);
        setUser(user)
      } catch (err) {
        console.warn("Silent refresh failed:", err);
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // helper для проверки ролей
  const hasRole = (role) => {
    if (!user) return false;
    return user.roles && user.roles.includes(role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    accessToken,
    setAccessToken: setToken,
    hasRole,
    checkEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
