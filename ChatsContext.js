import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const ChatsContext = createContext();

export const useChats = () => useContext(ChatsContext);

export const ChatsProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger les chats de l'utilisateur
  useEffect(() => {
    if (!user) return;

    // NOTE: Cette requête nécessite un index composite Firebase sur:
    // - Champ: participants (array-contains)
    // - Champ: lastMessageAt (descendant)
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
      // orderBy removed to avoid index requirement
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur lors du chargement des chats:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Créer un nouveau chat
  const createChat = async (participantId, itemId) => {
    if (!user) return null;

    try {
      const chatData = {
        participants: [user.uid, participantId],
        itemId: itemId,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        lastMessage: '',
        createdBy: user.uid,
        unreadCount: {
          [user.uid]: 0,
          [participantId]: 0
        }
      };

      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      console.log('✅ Chat créé:', chatRef.id);
      return chatRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création du chat:', error);
      return null;
    }
  };

  // Envoyer un message
  const sendMessage = async (chatId, messageText, isSystemMessage = false) => {
    if ((!user || !messageText.trim()) && !isSystemMessage) return null;

    try {
      const messageData = {
        chatId: chatId,
        senderId: isSystemMessage ? 'system' : user.uid,
        text: messageText.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        isSystemMessage: isSystemMessage
      };

      // Ajouter le message
      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Mettre à jour le chat avec le dernier message (sauf pour les messages système)
      if (!isSystemMessage) {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        const chatData = chatDoc.data();

        // Calculer les nouveaux compteurs non lus
        const participants = chatData.participants || [];
        const otherParticipants = participants.filter(id => id !== user.uid);
        const newUnreadCount = { ...chatData.unreadCount };

        // Incrémenter pour les autres
        otherParticipants.forEach(pid => {
          newUnreadCount[pid] = (newUnreadCount[pid] || 0) + 1;
        });

        await updateDoc(chatRef, {
          lastMessage: messageText.trim(),
          lastMessageAt: new Date().toISOString(),
          lastMessageBy: user.uid,
          unreadCount: newUnreadCount
        });
      }

      console.log(`✅ ${isSystemMessage ? 'Message système' : 'Message'} envoyé:`, messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      return null;
    }
  };

  // Charger les messages d'un chat
  const loadMessages = (chatId) => {
    if (!chatId) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
        // orderBy removed to avoid index requirement
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(prev => ({ ...prev, [chatId]: messagesData }));
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
    }
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async (chatId) => {
    if (!user || !chatId) return;

    try {
      // 1. Marquer les documents messages comme lus
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(unreadMessagesQuery);

      const batch = [];
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        if (message.senderId !== user.uid && !message.isSystemMessage) {
          batch.push(
            updateDoc(doc.ref, {
              read: true,
              readAt: new Date().toISOString()
            })
          );
        }
      });

      if (batch.length > 0) {
        await Promise.all(batch);
      }

      // 2. Réinitialiser le compteur dans le document Chat
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const newUnreadCount = { ...chatData.unreadCount };

        // Reset my count
        if (newUnreadCount[user.uid] > 0) {
          newUnreadCount[user.uid] = 0;
          await updateDoc(chatRef, { unreadCount: newUnreadCount });
          console.log('✅ Compteur de messages réinitialisé');
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages:', error);
    }
  };

  // Supprimer un chat
  const deleteChat = async (chatId) => {
    try {
      // Supprimer les messages du chat
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId)
      );

      const querySnapshot = await getDocs(messagesQuery);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Supprimer le chat
      await deleteDoc(doc(db, 'chats', chatId));

      console.log('✅ Chat supprimé:', chatId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du chat:', error);
    }
  };

  // Obtenir un chat spécifique
  const getChat = (chatId) => {
    return chats.find(chat => chat.id === chatId) || null;
  };

  // Obtenir les messages d'un chat
  const getMessages = (chatId) => {
    return messages[chatId] || [];
  };

  // Calculer le total des messages non lus
  const totalUnreadCount = chats.reduce((acc, chat) => {
    const count = (chat.unreadCount && chat.unreadCount[user?.uid]) || 0;
    return acc + count;
  }, 0);

  return (
    <ChatsContext.Provider value={{
      chats,
      messages,
      loading,
      createChat,
      sendMessage,
      loadMessages,
      markMessagesAsRead,
      deleteChat,
      getChat,
      getMessages,
      totalUnreadCount
    }}>
      {children}
    </ChatsContext.Provider>
  );
};
