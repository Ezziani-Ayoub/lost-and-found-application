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
  SafeAreaView,
  Image
} from 'react-native';
import { useAuth } from './AuthContext';
import { useChats } from './ChatsContext';
import { useItems } from './ItemsContext';
import { useUsers } from './UsersContext';
import { useTheme } from './ThemeContext';

const ChatScreen = ({ route, navigation }) => {
  const { item: initialItem, otherUserId, chatId: initialChatId } = route.params;
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const { theme, isDarkMode } = useTheme();

  const {
    chats,
    createChat,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    getMessages,
    loading: chatsLoading
  } = useChats();

  const { items, updateItem } = useItems();
  const currentItem = items ? (items.find(i => i.id === initialItem.id) || initialItem) : initialItem;
  const itemStatus = currentItem.status || 'actif';
  const otherUser = getUserById(otherUserId);

  const [messageText, setMessageText] = useState('');
  const [currentChatId, setCurrentChatId] = useState(initialChatId || null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  // Mettre à jour le header avec les infos de l'utilisateur
  useEffect(() => {
    const displayName = otherUser?.displayName || 'Utilisateur';
    const isOnline = otherUser?.isOnline;

    // Header Style based on theme
    const headerBackgroundColor = theme.surface;
    const headerTextColor = theme.text;
    const headerBorderColor = theme.border;

    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitleContainer}
          onPress={() => navigation.navigate('UserProfile', { userId: otherUserId })}
        >
          <View>
            <Text style={[styles.headerName, { color: headerTextColor }]}>{displayName}</Text>
            <Text style={[styles.headerStatus, { color: isOnline ? '#2ecc71' : '#7f8c8d' }]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: headerBackgroundColor,
        shadowColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 1,
        borderBottomColor: headerBorderColor,
        height: 100,
      },
      headerTintColor: theme.primary,
    });
  }, [navigation, otherUser, theme, isDarkMode]);

  useEffect(() => {
    if (initialChatId && currentChatId === initialChatId) {
      setIsLoading(false);
      return;
    }

    if (chatsLoading) return;

    if (!user || !chats) {
      setIsLoading(false);
      return;
    }

    const existingChat = chats.find(c =>
      c.itemId === currentItem.id &&
      c.participants.includes(user.uid) &&
      c.participants.includes(otherUserId)
    );

    if (existingChat) {
      setCurrentChatId(existingChat.id);
    }
    setIsLoading(false);
  }, [user, chats, currentItem.id, otherUserId, chatsLoading, initialChatId, currentChatId]);

  useEffect(() => {
    if (currentChatId) {
      const unsubscribe = loadMessages(currentChatId);
      markMessagesAsRead(currentChatId);
      return () => unsubscribe && unsubscribe();
    }
  }, [currentChatId]);

  const messages = currentChatId ? getMessages(currentChatId) : [];

  const handleMarkAsResolved = async () => {
    if (!user || itemStatus === 'resolved') return;
    if (currentItem.userId !== user.uid) {
      alert('Seul le propriétaire peut marquer cet objet comme résolu');
      return;
    }

    try {
      await updateItem(currentItem.id, {
        status: 'resolved',
        resolvedBy: user.uid,
        resolvedAt: new Date().toISOString()
      });

      if (currentChatId) {
        await sendMessage(currentChatId, `${user.displayName || 'Le propriétaire'} a marqué cet objet comme résolu.`, true);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;
    const textToSend = messageText.trim();
    setMessageText('');

    try {
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(otherUserId, currentItem.id);
        if (chatId) setCurrentChatId(chatId);
        else return;
      }
      await sendMessage(chatId, textToSend);
    } catch (error) {
      console.error(error);
      setMessageText(textToSend);
    }
  };

  const renderMessage = ({ item: message }) => {
    const isMyMessage = message.senderId === user?.uid;

    if (message.isSystemMessage) {
      return (
        <View style={[styles.systemMessageContainer, { backgroundColor: theme.surfaceUnique || '#f8f9fa', borderColor: theme.border }]}>
          <Text style={[styles.systemMessageText, { color: theme.textSecondary }]}>{message.text}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageBubble,
        isMyMessage
          ? { backgroundColor: theme.primary }
          : { backgroundColor: isDarkMode ? '#333' : '#f1f1f1' },
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : { color: theme.text }
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isMyMessage ? styles.myMessageTime : { color: theme.textSecondary }
        ]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const isOwner = user && currentItem.userId === user.uid;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Item Context Header */}
      <View style={[styles.contextBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.contextText, { color: theme.textSecondary }]}>
          {itemStatus === 'resolved' ? '✅ Objet Résolu' : `Concernant : ${currentItem.title}`}
        </Text>
        {isOwner && itemStatus !== 'resolved' && (
          <TouchableOpacity onPress={handleMarkAsResolved} style={[styles.resolveLink, { backgroundColor: isDarkMode ? 'rgba(46, 204, 113, 0.2)' : '#eafaf1' }]}>
            <Text style={styles.resolveLinkText}>Marquer résolu</Text>
          </TouchableOpacity>
        )}
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
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Dites bonjour 👋</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputWrapper}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: isDarkMode ? '#2c2c2c' : '#f8f9fa',
              color: theme.text,
              borderColor: theme.border
            }]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Écrivez votre message..."
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              !messageText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -10,
  },

  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '500',
  },
  contextBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  contextText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resolveLink: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolveLinkText: {
    color: '#2ecc71',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 15,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 10,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ChatScreen;

