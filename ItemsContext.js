import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ItemsContext = createContext();

export const useItems = () => useContext(ItemsContext);

export const ItemsProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([
    {
      id: '1',
      type: 'lost',
      title: 'Black Wallet',
      description: 'Lost my black leather wallet with cards and some cash.',
      photo: null,
      date: '2023-10-01',
      location: 'Campus Library',
      category: 'wallet',
      status: 'open',
      userId: 'user1', // Mock owner
    },
    {
      id: '2',
      type: 'lost',
      title: 'Keys',
      description: 'Found a set of keys near the entrance.',
      photo: null,
      date: '2023-10-02',
      location: 'Mall Entrance',
      category: 'keys',
      status: 'open',
      userId: 'user2',
    },
    {
      id: '3',
      type: 'lost',
      title: 'iPhone 12',
      description: 'Lost my iPhone 12, please contact if found.',
      photo: null,
      date: '2023-10-03',
      location: 'Bus Stop',
      category: 'phone',
      status: 'open',
      userId: 'user1',
    },
  ]);

  const addItem = (newItem) => {
    if (!user) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now().toString(), status: 'open', userId: user.id }]);
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem }}>
      {children}
    </ItemsContext.Provider>
  );
};