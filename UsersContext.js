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
    if (!user) return;

    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = {};
      snapshot.docs.forEach(doc => {
        usersData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.log('Erreur lors du chargement des utilisateurs:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createUserProfile = async (firebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Créer le profil utilisateur s'il n'existe pas
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || null,
          role: firebaseUser.email === 'admin123@gmail.com' ? 'admin' : 'user', // Auto-admin for specific email
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isOnline: true,
          isBanned: false,
        };
        await setDoc(userRef, userData);
        console.log('✅ Profil utilisateur créé:', firebaseUser.uid, 'Role:', userData.role);
      } else {
        // Mettre à jour le dernier login
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString(),
          isOnline: true
        });
        // Ensure admin role is kept/updated if needed (optional, but good for safety)
        if (firebaseUser.email === 'admin123@gmail.com') {
          const currentData = userDoc.data();
          if (currentData.role !== 'admin') {
            await updateDoc(userRef, { role: 'admin' });
          }
        }
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

  const banUser = async (uid, banType = 'permanent') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isBanned: true,
        banType: banType,
        banDate: new Date().toISOString(),
      });
      console.log(`🚫 Utilisateur ${uid} banni (${banType})`);
    } catch (error) {
      console.error('Erreur lors du bannissement:', error);
      throw error;
    }
  };

  const unbanUser = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isBanned: false,
        banType: null,
        banDate: null,
      });
      console.log(`✅ Utilisateur ${uid} débanni`);
    } catch (error) {
      console.error('Erreur lors du débannissement:', error);
      throw error;
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
      banUser,
      unbanUser,
      setUserOffline,
      getUserById,
      loading
    }}>
      {children}
    </UsersContext.Provider>
  );
};
