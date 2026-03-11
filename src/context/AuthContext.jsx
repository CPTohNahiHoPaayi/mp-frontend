import React, { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
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
  const login = (newToken, userInfo) => {
    setToken(newToken);
    setUser(userInfo);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userInfo));
  }
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, login, logout,isLoading,setToken,setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
