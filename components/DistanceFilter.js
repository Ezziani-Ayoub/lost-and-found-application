import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';

const DistanceFilter = ({ visible, onClose, onDistanceFilter, userLocation }) => {
  const [selectedDistance, setSelectedDistance] = useState(5); // Default 5km
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);

  const distances = [1, 2, 5, 10, 20, 50]; // in kilometers

  useEffect(() => {
    if (!currentUserLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La permission de localisation est requise pour filtrer par distance.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position actuelle.');
    }
  };

  const handleConfirm = () => {
    onDistanceFilter(selectedDistance, currentUserLocation);
    onClose();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filtrer par distance</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Appliquer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {currentUserLocation 
              ? `📍 Position actuelle: ${currentUserLocation.latitude.toFixed(4)}, ${currentUserLocation.longitude.toFixed(4)}`
              : '📍 Position en cours de récupération...'
            }
          </Text>

          {!currentUserLocation && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.locationButtonText}>🔄 Obtenir ma position</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.distanceLabel}>Rayon de recherche:</Text>
          <View style={styles.distanceContainer}>
            {distances.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceChip,
                  selectedDistance === distance && styles.selectedChip
                ]}
                onPress={() => setSelectedDistance(distance)}
              >
                <Text style={[
                  styles.distanceText,
                  selectedDistance === distance && styles.selectedText
                ]}>
                  {distance} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Afficher les objets trouvés/perdus dans un rayon de {selectedDistance} km autour de votre position.
            </Text>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  locationButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  distanceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  distanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  distanceChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedText: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default DistanceFilter;
