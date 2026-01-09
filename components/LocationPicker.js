import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import MapView from './MapView';

const LocationPicker = ({ visible, onClose, onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { latitude: 33.5731, longitude: -7.5898 } // Casablanca, Maroc
  );
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La permission de localisation est requise pour utiliser cette fonctionnalité.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position actuelle.');
    }
  };

  const handleMapPress = (event) => {
    if (Platform.OS === 'web') {
      // Web version - can't handle map press, use current location
      Alert.alert('Info', 'Sur le web, utilisez votre position actuelle.');
      return;
    }
    
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
    }
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sélectionner la position</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.map}
          region={{
            ...selectedLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          markers={[
            {
              coordinate: selectedLocation,
              title: "Position sélectionnée",
              description: "Appuyez sur la carte pour déplacer",
            },
            ...(userLocation ? [{
              coordinate: userLocation,
              title: "Votre position",
              description: "Position actuelle",
            }] : [])
          ]}
          onMapPress={handleMapPress}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Text style={styles.currentLocationText}>📍 Utiliser ma position actuelle</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  confirmButton: {
    padding: 10,
  },
  confirmButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  currentLocationButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  currentLocationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationPicker;
