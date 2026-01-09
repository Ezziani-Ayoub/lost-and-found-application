import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { StatusBar } from 'expo-status-bar';
import MapDisplay from './components/MapDisplay';

const { width } = Dimensions.get('window');

const ItemDetails = ({ route, navigation }) => {
  const { item } = route.params;
  const { updateItem } = useItems();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const isOwner = user && item.userId === user.id;

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Immersive Header Image */}
      <View style={styles.imageContainer}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: item.type === 'lost' ? '#e74c3c' : '#3498db' }]}>
            <Text style={styles.placeholderIcon}>{item.type === 'lost' ? '🔍' : '📦'}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Owner Status Menu Button */}
        {isOwner && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              style={styles.statusMenuButton}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <Text style={styles.statusMenuText}>
                {item.status === 'actif' ? '🟢 Actif' : item.status === 'en_attente' ? '🟡 En Pause' : '🔴 Remis'}
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

      {/* Content Sheet */}
      <ScrollView
        style={styles.sheetContainer}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
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
              {/* Only show Contact button for non-owners */}
              {!isOwner && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                  <Text style={styles.primaryButtonText}>
                    Contacter le propriétaire
                  </Text>
                </TouchableOpacity>
              )}

              {isOwner && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleChat}>
                  <Text style={styles.primaryButtonText}>
                    Voir les Messages
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.loginPromptContainer}>
              <Text style={styles.loginPrompt}>Connectez-vous pour interagir</Text>
            </View>
          )}
        </View>

        {/* Fill safe area at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <MapDisplay
        visible={showMap}
        onClose={() => setShowMap(false)}
        item={item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  menuWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 30,
    right: 20,
    zIndex: 20,
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
  sheetContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -30, // Overlap image
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
  },
  sheetContent: {
    paddingHorizontal: 25,
    paddingBottom: 20,
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
    gap: 10,
  },
  secondaryButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  warningButton: {
    borderColor: '#f1c40f',
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
  },
  successButton: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  dangerButton: {
    borderColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#34495e',
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
});

export default ItemDetails;