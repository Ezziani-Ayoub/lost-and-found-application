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
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
  const sendMessage = async (chatId, messageText) => {
    if (!user || !messageText.trim()) return;

    try {
      const messageData = {
        chatId: chatId,
        senderId: user.uid,
        text: messageText.trim(),
        createdAt: new Date().toISOString(),
        read: false
      };

      // Ajouter le message
      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // Mettre à jour le chat avec le dernier message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: user.uid
      });

      console.log('✅ Message envoyé:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    }
  };

  // Charger les messages d'un chat
  const loadMessages = async (chatId) => {
    if (!chatId) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', user.uid),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(messagesQuery);
      
      const batch = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true, readAt: new Date().toISOString() })
      );

      await Promise.all(batch);
      console.log('✅ Messages marqués comme lus');
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
      getMessages
    }}>
      {children}
    </ChatsContext.Provider>
  );
};
