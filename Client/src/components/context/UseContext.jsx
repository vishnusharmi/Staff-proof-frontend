// src/contexts/UserContext.js
import React, { createContext, useContext, useState } from "react";

// Static user database (for simulation)
const users = [
  {
    id: 1,
    name: "Alice Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "Admin",
  },
  {
    id: 2,
    name: "Bob Employer",
    email: "employer@example.com",
    password: "employer123",
    role: "Employer",
  },
  {
    id: 3,
    name: "Charlie Verifier",
    email: "verifier@example.com",
    password: "verifier123",
    role: "Verifier",
  },
  {
    id: 4,
    name: "Daisy Employee",
    email: "employee@example.com",
    password: "employee123",
    role: "Employee",
  },
];


export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = (email, password) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      setError(null);
      return true;
    } else {
      setError("Invalid credentials or role");
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout, error }}>
      {children}
    </UserContext.Provider>
  );
};