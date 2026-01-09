import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const ItemsContext = createContext();

export const useItems = () => useContext(ItemsContext);

export const ItemsProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les items depuis Firestore
  useEffect(() => {
    const itemsCollection = collection(db, 'items');
    const q = query(itemsCollection, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur lors du chargement des items:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addItem = async (newItem) => {
    if (!user) return;
    
    try {
      const itemsCollection = collection(db, 'items');
      await addDoc(itemsCollection, {
        ...newItem,
        status: 'actif',
        userId: user.id,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'item:', error);
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const itemDoc = doc(db, 'items', id);
      await updateDoc(itemDoc, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const itemDoc = doc(db, 'items', id);
      await deleteDoc(itemDoc);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'item:', error);
    }
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, deleteItem }}>
      {children}
    </ItemsContext.Provider>
  );
};