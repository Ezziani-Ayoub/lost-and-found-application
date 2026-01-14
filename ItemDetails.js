import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Platform, Modal, ActivityIndicator } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
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

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(false);

  const currentItem = items.find(i => i.id === initialItem.id) || initialItem;
  const isOwner = user && currentItem?.userId === user.uid;

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
    navigation.navigate('Chat', {
      item: currentItem,
      otherUserId: isOwner ? null : currentItem.userId,
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
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{currentItem.location}</Text>
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
              <Text style={styles.mapButtonText}>🗺️ Display item location on map</Text>
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

// ... gardez vos styles identiques à ceux fournis précédemment