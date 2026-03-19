import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [isLoading,setIsLoading]=useState(false);
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const isTokenValid = (token) => {
    if (!token) {
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp && decoded.exp > now;
    } catch (err) {
      return false;
    }
  }
  const isAuthenticated = () => {
    return isTokenValid(token);
  }

  const persistAuth = (accessToken, refreshTok, userInfo) => {
    setToken(accessToken);
    localStorage.setItem("token", accessToken);
    if (refreshTok) {
      setRefreshToken(refreshTok);
      localStorage.setItem("refreshToken", refreshTok);
    }
    if (userInfo) {
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));
    }
  };

  const login = (newTokenOrObj, userInfo) => {
    // Backward compatible:
    // - login(tokenString, userInfo)
    // - login({ accessToken, refreshToken }, userInfo)
    if (typeof newTokenOrObj === 'string') {
      persistAuth(newTokenOrObj, null, userInfo);
      return;
    }
    if (newTokenOrObj?.accessToken) {
      persistAuth(newTokenOrObj.accessToken, newTokenOrObj.refreshToken, userInfo);
    }
  };

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      if (data?.accessToken) {
        persistAuth(data.accessToken, data.refreshToken, null);
        return data.accessToken;
      }
      return null;
    } catch (e) {
      // Refresh token invalid/expired -> logout
      logout();
      return null;
    }
  }, [refreshToken]);

  const loginWithCredentials = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    login({ accessToken: data.accessToken, refreshToken: data.refreshToken }, { email });
  };

  const loginWithToken = (tokenFromUrl) => {
    login(tokenFromUrl, user);
  };

  useEffect(() => {
    // Proactive refresh: refresh if token expires in < 2 minutes
    const interval = setInterval(async () => {
      if (!token || !refreshToken) return;
      try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);
        const remaining = (decoded.exp || 0) - now;
        if (remaining > 0 && remaining < 120) {
          await refreshAccessToken();
        }
      } catch {
        // ignore decode errors
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [token, refreshToken, refreshAccessToken]);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ token, refreshToken, user, isAuthenticated, login, logout, isLoading, setToken, setUser, loginWithCredentials, loginWithToken, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
