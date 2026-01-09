import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import MapView from './MapView';

const MapDisplay = ({ visible, onClose, item }) => {
  if (!item.coordinates) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Position de l'objet</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>📍 Position non disponible</Text>
            <Text style={styles.noLocationSubtext}>Cet objet n'a pas de coordonnées GPS enregistrées</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Position de l'objet</Text>
          <View style={styles.placeholder} />
        </View>

        <MapView
          style={styles.map}
          region={{
            ...item.coordinates,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          markers={[
            {
              coordinate: item.coordinates,
              title: item.title,
              description: item.location,
            }
          ]}
        />

        <View style={styles.footer}>
          <Text style={styles.locationText}>📍 {item.location}</Text>
          <Text style={styles.coordinatesText}>
            Coordonnées: {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
          </Text>
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
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  map: {
    flex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noLocationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  noLocationSubtext: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default MapDisplay;
