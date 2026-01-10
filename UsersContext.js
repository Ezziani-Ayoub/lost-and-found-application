import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const UsersContext = createContext();

export const useUsers = () => useContext(UsersContext);

export const UsersProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Créer ou mettre à jour le profil utilisateur lors de la connexion
  useEffect(() => {
    if (user) {
      createUserProfile(user);
    }
  }, [user]);

  // Écouter les changements des utilisateurs
  useEffect(() => {
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = {};
      snapshot.docs.forEach(doc => {
        usersData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserProfile = async (firebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Créer le profil utilisateur s'il n'existe pas
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isOnline: true
        });
        console.log('✅ Profil utilisateur créé:', firebaseUser.uid);
      } else {
        // Mettre à jour le dernier login
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          isOnline: true
        });
        console.log('✅ Profil utilisateur mis à jour:', firebaseUser.uid);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du profil utilisateur:', error);
    }
  };

  const updateUserProfile = async (uid, updates) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Profil utilisateur mis à jour:', uid);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
    }
  };

  const setUserOffline = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isOnline: false,
        lastSeenAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise hors ligne:', error);
    }
  };

  const getUserById = (uid) => {
    return users[uid] || null;
  };

  return (
    <UsersContext.Provider value={{ 
      users, 
      createUserProfile, 
      updateUserProfile, 
      setUserOffline, 
      getUserById, 
      loading 
    }}>
      {children}
    </UsersContext.Provider>
  );
};
