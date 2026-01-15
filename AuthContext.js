import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(' Initialisation de l\'authentification...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(' Utilisateur connecté:', user.email);

        // Check if user is banned
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().isBanned) {
            console.log('🚫 User is banned, forcing logout');
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error checking ban status:', e);
        }
      } else {
        console.log(' Aucun utilisateur connecté');
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.log('Erreur de connexion:', error);
      throw error;
    }
  };

  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Vous pouvez ajouter les données supplémentaires dans Firestore ici
      return userCredential.user;
    } catch (error) {
      console.log('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};