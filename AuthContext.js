import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading delay
    setTimeout(() => setLoading(false), 500);
  }, []);

  const login = async (email, password) => {
    // Mock login
    const mockUser = { id: 'user1', email, name: email.split('@')[0] };
    setUser(mockUser);
  };

  const signup = async (email, password, userData) => {
    // Mock signup with extended data
    const mockUser = {
      id: Date.now().toString(),
      email,
      ...userData
    };
    setUser(mockUser);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};