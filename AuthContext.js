import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Not available on web

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, no persistence on web
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login: accept any email/password for demo
    const mockUser = { id: 'user1', email, name: email.split('@')[0] };
    setUser(mockUser);
    // await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signup = async (email, password, name) => {
    // Mock signup
    const mockUser = { id: Date.now().toString(), email, name };
    setUser(mockUser);
    // await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    // await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};