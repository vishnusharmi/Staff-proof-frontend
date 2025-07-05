// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from '../api/api';

const UserContext = createContext();

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Load user and token from localStorage on app start
  useEffect(() => {
    console.log("UserContext: Loading from localStorage...");
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log("UserContext: Stored data:", { 
      hasStoredUser: !!storedUser, 
      hasStoredToken: !!storedToken,
      storedUser: storedUser ? JSON.parse(storedUser) : null
    });
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      console.log("UserContext: Loaded user and token from localStorage");
    } else {
      console.log("UserContext: No stored authentication data found");
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await loginUser(email, password);
      if (res && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        
      return true;
    } else {
        setError(res?.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = async (userData) => {
    try {
      setError(null);
      const res = await registerUser(userData);
      if (res && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        
        return true;
      } else {
        setError(res?.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  console.log("UserContext: Current state:", { user, token, hasToken: !!token });

  return (
    <UserContext.Provider value={{ user, token, login, logout, register, error }}>
      {children}
    </UserContext.Provider>
  );
};

export { useUser, UserProvider, UserContext };