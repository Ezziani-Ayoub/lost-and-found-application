import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Platform, Modal, ActivityIndicator } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { StatusBar } from 'expo-status-bar';
import MapDisplay from './components/MapDisplay';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = 400;

const ItemDetails = ({ route, navigation }) => {
  const { item: initialItem } = route.params;
  const { items, updateItem, deleteItem, loading: itemsLoading } = useItems();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  // We need to access users context to check for admin role
  const { users } = useUsers();

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(false);

  const currentItem = items.find(i => i.id === initialItem.id) || initialItem;

  // Admin privilege: Admins are treated as owners
  const isAdmin = user && users[user.uid]?.role === 'admin';
  const isOwner = user && (currentItem?.userId === user.uid || isAdmin);

  const handleAction = async (action, statusLabel) => {
    try {
      await updateItem(currentItem.id, { status: action });
      Alert.alert(t('success') || 'Succès', `Objet marqué comme ${statusLabel}!`);
      setMenuVisible(false);
    } catch (e) {
      Alert.alert(t('error') || 'Erreur', 'Mise à jour échouée');
    }
  };

  const handleChat = () => {
    if (!user) {
      Alert.alert(t('error'), 'Connectez-vous pour contacter le propriétaire.');
      return;
    }

    // Si c'est le propriétaire, il veut voir ses messages (donc la liste des conversations)
    if (isOwner) {
      navigation.navigate('Notifications');
      return;
    }

    // Si c'est un autre utilisateur, il veut discuter avec le propriétaire
    navigation.navigate('Chat', {
      item: currentItem,
      otherUserId: currentItem.userId,
    });
  };

  const handleEdit = () => {
    navigation.navigate('PostItem', { item: currentItem });
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete'),
      'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(currentItem.id);
              Alert.alert(t('success'), 'Votre annonce a été supprimée.');
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('error'), 'Impossible de supprimer l\'annonce.');
            }
          },
        },
      ]
    );
  };

  if (!currentItem) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBarStyle === 'dark' ? 'dark' : 'light'} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {isOwner && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              style={[styles.statusMenuButton, { backgroundColor: theme.surface }]}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <Text style={[styles.statusMenuText, { color: theme.text }]}>
                {currentItem.status === 'actif' ? t('active') : currentItem.status === 'en_attente' ? t('pending') : t('returned')}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {menuVisible && (
              <View style={[styles.dropdown, { backgroundColor: theme.surface }]}>
                <TouchableOpacity style={[styles.dropdownItem, { borderBottomColor: theme.border }]} onPress={() => handleAction('actif', t('active'))}>
                  <Text style={[styles.dropdownText, { color: theme.text }]}>🟢 {t('active')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dropdownItem, { borderBottomColor: theme.border }]} onPress={() => handleAction('en_attente', t('pending'))}>
                  <Text style={[styles.dropdownText, { color: theme.text }]}>🟡 {t('pending')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dropdownItem, { borderBottomColor: theme.border }]} onPress={() => handleAction('returned', t('returned'))}>
                  <Text style={[styles.dropdownText, { color: theme.text }]}>🔴 {t('returned')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => currentItem.photo && setFullScreenImage(true)}
          style={styles.imageContainer}
        >
          {currentItem.photo ? (
            <Image source={{ uri: currentItem.photo }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: currentItem.type === 'lost' ? '#e74c3c' : '#3498db' }]}>
              <Text style={styles.placeholderIcon}>{currentItem.type === 'lost' ? '🔍' : '📦'}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={[styles.contentSheet, { backgroundColor: theme.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.border }]} />

          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: currentItem.type === 'lost' ? '#e74c3c' : '#3498db' }]}>
              <Text style={styles.badgeText}>{currentItem.type === 'lost' ? t('lost').toUpperCase() : t('found').toUpperCase()}</Text>
            </View>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(currentItem.date).toLocaleDateString()}</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{currentItem.title}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            {currentItem.city || currentItem.country ? (
              <Text style={[styles.locationText, { color: theme.text }]}>
                {currentItem.city ? `${currentItem.city}, ` : ''}{currentItem.country}
              </Text>
            ) : (
              <Text style={[styles.locationText, { color: theme.text }]}>{currentItem.location}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.userRow, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => navigation.navigate('UserProfile', { userId: currentItem.userId })}
          >
            <Text style={[styles.userLabel, { color: theme.textSecondary }]}>👤 {t('postedBy')}</Text>
            <Text style={[styles.userName, { color: theme.primary }]}>Voir le profil →</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('description')}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{currentItem.description}</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Position Approximative</Text>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.mapButton} onPress={() => setShowMap(true)}>
              <Text style={[styles.mapButtonText, { color: theme.primary }]}>🗺️ Display item location on map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionContainer}>
            {user ? (
              <>
                {!isOwner ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                    <Text style={styles.primaryButtonText}>{t('contactOwner')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.ownerActions}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                      <Text style={styles.primaryButtonText}>{t('viewMessages')}</Text>
                    </TouchableOpacity>
                    <View style={styles.ownerButtonsRow}>
                      <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
                        <Text style={styles.actionButtonText}>{t('edit')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.loginPromptContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.loginPrompt, { color: theme.textSecondary }]}>Connectez-vous pour interagir</Text>
              </View>
            )}
          </View>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <MapDisplay visible={showMap} onClose={() => setShowMap(false)} item={currentItem} />

      <Modal visible={fullScreenImage} transparent={true} onRequestClose={() => setFullScreenImage(false)}>
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.fullScreenCloseButton} onPress={() => setFullScreenImage(false)}>
            <Text style={styles.fullScreenCloseText}>✕</Text>
          </TouchableOpacity>
          {currentItem.photo && <Image source={{ uri: currentItem.photo }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  menuWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  statusMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusMenuText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 150,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
  },
  dropdownText: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  contentSheet: {
    flex: 1,
    marginTop: -40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
    opacity: 0.3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  date: {
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 15,
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.5,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    borderStyle: 'dashed',
  },
  mapButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ownerActions: {
    gap: 16,
  },
  ownerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#2563EB',
    backgroundColor: 'transparent',
  },
  deleteButton: {
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  loginPromptContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  loginPrompt: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  fullScreenCloseText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default ItemDetails;