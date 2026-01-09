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
  onSnapshot,
  setDoc,
  getDoc
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
    console.log('🔥 Début du chargement des items depuis Firestore...');
    console.log('📊 User actuel:', user);
    
    const itemsCollection = collection(db, 'items');
    console.log('📂 Collection créée:', itemsCollection);
    
    const q = query(itemsCollection, orderBy('date', 'desc'));
    console.log('🔍 Query créée:', q);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📸 Snapshot reçu, nombre de documents:', snapshot.size);
      console.log('📄 Snapshot metadata:', snapshot.metadata);
      
      const itemsData = snapshot.docs.map(doc => {
        console.log(`📋 Document ${doc.id}:`, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      console.log('🎯 Items chargés:', itemsData);
      console.log('📊 Nombre d\'items:', itemsData.length);
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur lors du chargement des items:', error);
      console.error('❌ Code d\'erreur:', error.code);
      console.error('❌ Message d\'erreur:', error.message);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Unsubscribing from Firestore listener');
      unsubscribe();
    };
  }, [user]);

  const addItem = async (newItem) => {
    if (!user) {
      console.error('❌ Utilisateur non connecté');
      return;
    }
    
    try {
      console.log('📝 Ajout d\'un nouvel item:', newItem);
      console.log('👤 User ID:', user.uid);
      
      const itemsCollection = collection(db, 'items');
      const docRef = await addDoc(itemsCollection, {
        ...newItem,
        status: 'actif',
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Item ajouté avec succès, ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de l\'item:', error);
      console.error('❌ Code d\'erreur:', error.code);
      console.error('❌ Message d\'erreur:', error.message);
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
    <ItemsContext.Provider value={{ items, addItem, updateItem, deleteItem, loading }}>
      {children}
    </ItemsContext.Provider>
  );
};