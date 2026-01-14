import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from './AuthContext';
import { useChats } from './ChatsContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const { item, otherUserId } = route.params;
  const { user } = useAuth();
  const {
    chats,
    createChat,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    getMessages
  } = useChats();
  
  const [itemStatus, setItemStatus] = useState(item.status || 'pending');

  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  // Trouver le chat existant ou préparer
  useEffect(() => {
    if (!user || !chats) return;

    const existingChat = chats.find(c =>
      c.itemId === item.id &&
      c.participants.includes(user.uid) &&
      c.participants.includes(otherUserId)
    );

    if (existingChat) {
      setCurrentChatId(existingChat.id);
    }
    setIsLoading(false);
  }, [user, chats, item.id, otherUserId]);

  // Charger les messages quand on a un ID de chat
  useEffect(() => {
    if (currentChatId) {
      const unsubscribe = loadMessages(currentChatId);
      markMessagesAsRead(currentChatId);
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [currentChatId]);

  const messages = currentChatId ? getMessages(currentChatId) : [];

  const handleMarkAsResolved = async () => {
    console.log('handleMarkAsResolved appelé', { user, itemStatus, item });
    
    if (!user) {
      alert('Vous devez être connecté pour effectuer cette action');
      return;
    }
    
    if (itemStatus === 'resolved') {
      alert('Cet objet est déjà marqué comme résolu');
      return;
    }
    
    try {
      console.log('Tentative de marquage comme résolu pour l\'item:', {
        itemId: item.id,
        currentUser: user.uid,
        itemOwner: item.userId || item.ownerId // Vérifiez la propriété correcte
      });
      
      // Vérifier si l'utilisateur est le propriétaire
      const isOwner = item.userId === user.uid || item.ownerId === user.uid;
      if (!isOwner) {
        alert('Seul le propriétaire peut marquer cet objet comme résolu');
        return;
      }
      
      // Mettre à jour l'état local immédiatement pour un retour visuel instantané
      setItemStatus('resolved');
      
      // Mettre à jour l'élément dans Firestore
      console.log('Mise à jour du document dans Firestore...');
      const itemRef = doc(db, 'items', item.id);
      const updateData = {
        status: 'resolved',
        updatedAt: new Date().toISOString()
      };
      
      // Ajouter les champs optionnels s'ils existent
      if (user.uid) updateData.resolvedBy = user.uid;
      
      console.log('Données de mise à jour:', updateData);
      
      await updateDoc(itemRef, updateData);
      console.log('Mise à jour Firestore réussie');
      
      // Envoyer un message système
      if (currentChatId) {
        try {
          await sendMessage(
            currentChatId, 
            `${user.displayName || 'Un utilisateur'} a marqué cet objet comme résolu.`,
            true // isSystemMessage
          );
          console.log('Message système envoyé avec succès');
        } catch (msgError) {
          console.error('Erreur lors de l\'envoi du message système:', msgError);
          // On ne bloque pas le flux pour une erreur de message système
        }
      }
      
      // Mettre à jour le titre de l'écran
      navigation.setOptions({
        headerTitle: `[RÉSOLU] ${item.title}`
      });
      
      // Rafraîchir la liste des chats si nécessaire
      // Vous pourriez vouloir ajouter un callback ou un événement ici
      
    } catch (error) {
      // En cas d'erreur, on remet le statut précédent
      setItemStatus(item.status || 'pending');
      console.error('Erreur détaillée:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Erreur: ${error.message || 'Impossible de marquer comme résolu'}`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    const textToSend = messageText.trim();
    setMessageText(''); // Optimistic clear

    try {
      let chatId = currentChatId;

      if (!chatId) {
        // Premier message : on crée le chat
        chatId = await createChat(otherUserId, item.id);
        if (chatId) {
          setCurrentChatId(chatId);
        } else {
          // Erreur de création
          return;
        }
      }

      await sendMessage(chatId, textToSend);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error("Erreur d'envoi", error);
      setMessageText(textToSend); // Restore message if error
    }
  };

  const renderMessage = ({ item: message }) => {
    const isMyMessage = message.senderId === user?.uid;
    const isSystemMessage = message.isSystemMessage;

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{message.text}</Text>
          <Text style={styles.systemMessageTime}>
            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
          {message.text}
        </Text>
        <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
          {new Date(message.createdAt || message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {itemStatus === 'resolved' ? `[RÉSOLU] ` : ''}
            {item.title}
          </Text>
          {itemStatus !== 'resolved' ? (
            <TouchableOpacity 
              style={[
                styles.resolveButton,
                (!user || (item.userId !== user?.uid && item.ownerId !== user?.uid)) && styles.resolveButtonDisabled
              ]}
              onPress={handleMarkAsResolved}
              disabled={!user || (item.userId !== user?.uid && item.ownerId !== user?.uid)}
            >
              <Text style={styles.resolveButtonText}>
                {(!user || (item.userId !== user?.uid && item.ownerId !== user?.uid)) 
                  ? 'Réservé au propriétaire' 
                  : 'Marquer comme résolu'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedText}>Résolu</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun message. Dites bonjour ! 👋</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Écrire un message..."
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  resolveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    opacity: 1,
  },
  resolveButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resolvedBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  resolvedText: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: '90%',
  },
  systemMessageText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen;
