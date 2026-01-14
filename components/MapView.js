import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Web version using iframe
const WebMap = ({ region, markers, style }) => {
  if (!markers || markers.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.placeholderText}>📍 Carte non disponible sur le web</Text>
      </View>
    );
  }

  const marker = markers[0];
  const mapUrl = `https://maps.google.com/maps?q=${marker.coordinate.latitude},${marker.coordinate.longitude}&z=15&output=embed`;

  return (
    <View style={[styles.container, style]}>
      <iframe
        src={mapUrl}
        style={styles.webMap}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </View>
  );
};

// Native version using react-native-maps
const NativeMap = ({ region, markers, style, onMapPress, ...props }) => {
  try {
    const MapView = require('react-native-maps').default;
    const Marker = require('react-native-maps').Marker;

    return (
      <MapView
        style={[styles.container, style]}
        initialRegion={region}
        region={region}
        onPress={onMapPress} // MapView uses onPress for map clicks
        {...props}
      >
        {markers?.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    );
  } catch (error) {
    console.warn('react-native-maps not available:', error);
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.placeholderText}>📍 Carte non disponible</Text>
      </View>
    );
  }
};

const MapView = ({ region, markers, style, onMapPress, ...props }) => {
  if (Platform.OS === 'web') {
    return <WebMap region={region} markers={markers} style={style} />;
  }

  return <NativeMap region={region} markers={markers} style={style} onMapPress={onMapPress} {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webMap: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 50,
  },
});

export default MapView;
