import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Platform, Modal } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { StatusBar } from 'expo-status-bar';
import MapDisplay from './components/MapDisplay';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = 400;

const ItemDetails = ({ route, navigation }) => {
  const { item } = route.params;
  const { updateItem, deleteItem } = useItems();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(false);

  // If item or user is missing (e.g. after deletion or logout), handle gracefully
  if (!item) return null;

  const isOwner = user && item.userId === user.uid;

  const handleAction = (action, statusLabel) => {
    updateItem(item.id, { status: action });
    Alert.alert('Succès', `Objet marqué comme ${statusLabel}!`);
    navigation.goBack();
  };

  const handleChat = () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour contacter le propriétaire.');
      return;
    }

    try {
      const otherUserId = isOwner ? null : item.userId;
      navigation.navigate('Chat', {
        item,
        otherUserId: otherUserId || 'pending',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le chat.');
    }
  };

  const handleEdit = () => {
    navigation.navigate('PostItem', { item });
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              Alert.alert('Supprimé', 'Votre annonce a été supprimée.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Bar Controls (Back & Menu) - Absolute on top */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {isOwner && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              style={styles.statusMenuButton}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <Text style={styles.statusMenuText}>
                {item.status === 'actif' ? 'Actif' : item.status === 'en_attente' ? 'En Pause' : 'Remis'}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); handleAction('actif', 'Actif'); }}>
                  <Text style={styles.dropdownText}>🟢 Actif</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); handleAction('en_attente', 'En Pause'); }}>
                  <Text style={styles.dropdownText}>🟡 En Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuVisible(false); handleAction('returned', 'Remis'); }}>
                  <Text style={styles.dropdownText}>🔴 Remis</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image as first scroll item */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => item.photo && setFullScreenImage(true)}
          style={styles.imageContainer}
        >
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: item.type === 'lost' ? '#e74c3c' : '#3498db' }]}>
              <Text style={styles.placeholderIcon}>{item.type === 'lost' ? '🔍' : '📦'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Content Sheet Overlapping Image */}
        <View style={styles.contentSheet}>
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: item.type === 'lost' ? '#e74c3c' : '#3498db' }]}>
              <Text style={styles.badgeText}>{item.type === 'lost' ? 'PERDU' : 'TROUVÉ'}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Position Approximative</Text>
          <View style={styles.mapPlaceholder}>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMap(true)}
            >
              <Text style={styles.mapButtonText}>🗺️ Display item location on map</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {user ? (
              <>
                {!isOwner ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                    <Text style={styles.primaryButtonText}>
                      Contacter le propriétaire
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.ownerActions}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                      <Text style={styles.primaryButtonText}>
                        Voir les Messages
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.ownerButtonsRow}>
                      <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
                        <Text style={styles.actionButtonText}>Modifier</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.loginPromptContainer}>
                <Text style={styles.loginPrompt}>Connectez-vous pour interagir</Text>
              </View>
            )}
          </View>

          {/* Padding for bottom safety */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <MapDisplay
        visible={showMap}
        onClose={() => setShowMap(false)}
        item={item}
      />

      {/* Full Screen Image Modal */}
      <Modal
        visible={fullScreenImage}
        transparent={true}
        onRequestClose={() => setFullScreenImage(false)}
        animationType="fade"
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={() => setFullScreenImage(false)}
          >
            <Text style={styles.fullScreenCloseText}>✕</Text>
          </TouchableOpacity>
          {item.photo &&
            <Image
              source={{ uri: item.photo }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          }
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#eee',
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Ensure buttons are clickable
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
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
    // Positioning handled by topRow flex
  },
  statusMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  statusMenuText: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 6,
    fontSize: 14,
  },
  chevron: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  dropdownText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  contentSheet: {
    backgroundColor: '#fff',
    marginTop: -40, // Negative margin for overlap
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 10,
    minHeight: height - IMAGE_HEIGHT + 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  date: {
    color: '#95a5a6',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f1f1',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  mapPlaceholder: {
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 10,
  },
  mapButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 30,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  ownerActions: {
    gap: 15,
  },
  ownerButtonsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#feeced',
    borderColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3498db',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
  loginPromptContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  loginPrompt: {
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  fullScreenCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ItemDetails;