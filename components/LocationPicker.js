import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Platform, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import * as Location from 'expo-location';
import MapView from './MapView';

const LocationPicker = ({ visible, onClose, onLocationSelect, initialLocation, country, city }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { latitude: 33.5731, longitude: -7.5898 } // Casablanca, Maroc
  );
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Focus on country/city when opening if available and no initial location set
  useEffect(() => {
    if (visible && country && !initialLocation) {
      const query = `${city ? city + ', ' : ''}${country}`;
      setSearchQuery(query);
      handleSearch(query);
    } else if (visible && initialLocation) {
      setSelectedLocation(initialLocation);
    } else if (visible && !initialLocation) {
      getCurrentLocation();
    }
  }, [visible, country, city]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Alert.alert('Permission refusée', 'La permission de localisation est requise.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
      // Only set selected if we don't have one yet
      if (!initialLocation) {
        setSelectedLocation(coords);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSearch = async (queryToSearch) => {
    const term = queryToSearch || searchQuery;
    if (!term) return;

    setSearching(true);
    Keyboard.dismiss();

    try {
      let result = await Location.geocodeAsync(term);
      if (result && result.length > 0) {
        const { latitude, longitude } = result[0];
        setSelectedLocation({ latitude, longitude });
      } else {
        Alert.alert('Introuvable', 'Aucun résultat trouvé pour cette recherche.');
      }
    } catch (error) {
      // console.error('Geocoding error:', error);
      Alert.alert('Erreur', 'Impossible de trouver ce lieu.');
    } finally {
      setSearching(false);
    }
  };

  const handleMapPress = (event) => {
    if (Platform.OS === 'web') return;
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Sélectionner</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une ville, un quartier..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
              {searching ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.searchButtonText}>🔍</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <MapView
          style={styles.map}
          region={{
            ...selectedLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onMapPress={handleMapPress}
          markers={[
            {
              coordinate: selectedLocation,
              title: "Position sélectionnée",
            },
            ...(userLocation ? [{
              coordinate: userLocation,
              title: "Votre position",
              pinColor: "blue"
            }] : [])
          ]}
        />

        <View style={styles.footer}>
          <Text style={styles.helperText}>
            Appuyez sur la carte pour ajuster la position précise.
          </Text>
          {userLocation && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() => setSelectedLocation(userLocation)}
            >
              <Text style={styles.currentLocationText}>📍 Ma position</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  cancelButton: { padding: 10 },
  cancelButtonText: { color: '#e74c3c', fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  confirmButton: { padding: 10 },
  confirmButtonText: { color: '#3498db', fontSize: 16, fontWeight: 'bold' },

  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dcdde1',
  },
  searchButton: {
    width: 45,
    height: 45,
    backgroundColor: '#3498db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: { fontSize: 20 },

  map: { flex: 1 },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helperText: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
    marginRight: 10,
  },
  currentLocationButton: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentLocationText: {
    fontWeight: '600',
    color: '#2c3e50',
  }
});

export default LocationPicker;
