import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') ? JSON.parse(localStorage.getItem('authToken')) : null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken.access);
        setUser(decodedToken);
      } catch (error) {
        console.error("Invalid token", error);
        setAuthToken(null);
        localStorage.removeItem('authToken');
      }
    } else {
      setUser(null);
    }
  }, [authToken]);

  const login = async (username, password) => {
    const response = await fetch('http://localhost:8000/api/v1/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (response.ok) {
      setAuthToken(data);
      localStorage.setItem('authToken', JSON.stringify(data));
      const decodedToken = jwtDecode(data.access);
      setUser(decodedToken);
      return true;
    } else {
      console.error('Login failed', data);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = () => {
    if (!authToken || !authToken.access) return false;
    try {
      const decodedToken = jwtDecode(authToken.access);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  const hasRole = (roles) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);