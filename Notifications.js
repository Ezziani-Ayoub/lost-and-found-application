import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useChats } from './ChatsContext';
import { useAuth } from './AuthContext';
import { useItems } from './ItemsContext';
import { StatusBar } from 'expo-status-bar';

const Notifications = ({ navigation }) => {
  const { chats, loading } = useChats();
  const { user } = useAuth();
  const { items } = useItems(); // Pour récupérer les titres des objets

  const getItemTitle = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.title : 'Objet inconnu';
  };

  const getUnreadCount = (chat) => {
    return (chat.unreadCount && chat.unreadCount[user?.uid]) || 0;
  };

  const handleChatPress = (chat) => {
    // Trouver l'ID de l'autre participant
    const otherUserId = chat.participants.find(p => p !== user.uid);
    // Trouver l'item
    const item = items.find(i => i.id === chat.itemId);

    if (item && otherUserId) {
      navigation.navigate('Chat', { item, otherUserId, chatId: chat.id });
    } else {
      // Fallback si l'item n'existe plus
      alert('Cet objet n\'existe plus');
    }
  };

  const renderItem = ({ item }) => {
    const unreadCount = getUnreadCount(item);

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          unreadCount > 0 && styles.unreadChatItem
        ]}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>💬</Text>
        </View>
        <View style={styles.chatInfo}>
          <Text style={[styles.chatTitle, unreadCount > 0 && styles.unreadText]}>
            {getItemTitle(item.itemId)}
          </Text>
          <Text style={[styles.lastMessage, unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
            {item.lastMessage || 'Nouvelle conversation'}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.lastMessageAt).toLocaleDateString()}
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune discussion pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadChatItem: {
    backgroundColor: '#f0f8ff',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default Notifications;
