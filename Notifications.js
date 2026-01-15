import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { useChats } from './ChatsContext';
import { useAuth } from './AuthContext';
import { useItems } from './ItemsContext';
import { useUsers } from './UsersContext';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './ThemeContext';

const Notifications = ({ navigation }) => {
  const { chats, loading, deleteChat } = useChats();
  const { user } = useAuth();
  const { items } = useItems();
  const { getUserById } = useUsers();
  const { theme, isDarkMode } = useTheme();

  const getItemTitle = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.title : 'Objet';
  };

  const getUnreadCount = (chat) => {
    return (chat.unreadCount && chat.unreadCount[user?.uid]) || 0;
  };

  const getOtherParticipantId = (chat) => {
    return chat.participants.find(p => p !== user?.uid);
  };

  const handleChatPress = (chat) => {
    const otherUserId = getOtherParticipantId(chat);
    const item = items.find(i => i.id === chat.itemId);

    if (item && otherUserId) {
      navigation.navigate('Chat', { item, otherUserId, chatId: chat.id });
    } else {
      Alert.alert('Impossible', 'Cet objet ou cet utilisateur est introuvable.');
    }
  };

  const handleDeleteChat = (chat) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cette conversation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChat(chat.id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const unreadCount = getUnreadCount(item);
    const otherUserId = getOtherParticipantId(item);
    const otherUser = getUserById(otherUserId);
    const itemTitle = getItemTitle(item.itemId);

    const displayName = otherUser?.displayName || 'Utilisateur inconnu';
    const isOnline = otherUser?.isOnline;
    const avatarUrl = otherUser?.photoURL;

    return (
      <TouchableOpacity
        style={[styles.chatCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
        onPress={() => handleChatPress(item)}
        onLongPress={() => handleDeleteChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarInitials}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.topRow}>
            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>
              {new Date(item.lastMessageAt).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </Text>
          </View>

          <Text style={[styles.itemTitle, { color: theme.primary }]} numberOfLines={1}>
            Concernant : {itemTitle}
          </Text>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                { color: theme.textSecondary },
                unreadCount > 0 && { color: theme.text, fontWeight: '600' }
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Nouvelle conversation'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCountText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Custom */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Discussions</Text>
        </View>

        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune discussion</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Vos conversations avec d'autres utilisateurs apparaîtront ici.
            </Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    padding: 15,
  },
  chatCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Notifications;
