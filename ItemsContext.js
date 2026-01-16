import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
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
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    console.log(' Connexion à Firestore...');

    // On utilise 'items' où sont vos données
    const itemsCollection = collection(db, 'items');

    // On trie par 'createdAt' pour avoir les plus récents en premier
    const q = query(itemsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(' Mise à jour reçue de Firestore !');

      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.log('❌ Erreur Firestore:', error.message);
      // Si l'erreur d'index revient ici, clique sur le nouveau lien généré dans la console
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Ajouter un objet depuis l'application
  const addItem = async (newItem) => {
    if (!user) return;

    try {
      const itemsCollection = collection(db, 'items');
      await addDoc(itemsCollection, {
        ...newItem,
        status: 'actif',
        userId: user.uid,
        title: newItem.title || "Objet sans titre", // Titre de l'objet
        createdAt: new Date().toISOString()
      });
      console.log('✅ Objet ajouté à la collection "items"');
    } catch (error) {
      console.log('❌ Erreur ajout:', error.message);
      if (error.message.includes('longer than')) {
        Alert.alert('Erreur', 'La photo sélectionnée est trop volumineuse pour être enregistrée. Veuillez choisir une photo plus petite.');
      } else {
        Alert.alert('Erreur', 'Impossible de publier l\'objet. Veuillez réessayer.');
      }
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const itemDoc = doc(db, 'items', id);
      await updateDoc(itemDoc, updates);
    } catch (error) {
      console.error('Erreur update:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const itemDoc = doc(db, 'items', id);
      await deleteDoc(itemDoc);
    } catch (error) {
      console.error('Erreur delete:', error);
    }
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, deleteItem, loading }}>
      {children}
    </ItemsContext.Provider>
  );
};