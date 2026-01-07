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
      title: 'Portefeuille Noir',
      description: 'J\'ai perdu mon portefeuille en cuir noir avec des cartes et un peu d\'argent.',
      photo: null,
      date: '2023-10-01',
      location: 'Bibliothèque du Campus',
      category: 'portefeuille',
      status: 'actif',
      userId: 'user1', // Mock owner
    },
    {
      id: '2',
      type: 'found',
      title: 'Clés',
      description: 'Trouvé un trousseau de clés près de l\'entrée.',
      photo: null,
      date: '2023-10-02',
      location: 'Entrée du Centre Commercial',
      category: 'cles',
      status: 'actif',
      userId: 'user2',
    },
    {
      id: '3',
      type: 'lost',
      title: 'iPhone 12',
      description: 'J\'ai perdu mon iPhone 12, veuillez contacter si trouvé.',
      photo: null,
      date: '2023-10-03',
      location: 'Arrêt de Bus',
      category: 'telephone',
      status: 'actif',
      userId: 'user1',
    },
  ]);

  const addItem = (newItem) => {
    if (!user) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now().toString(), status: 'actif', userId: user.id }]);
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