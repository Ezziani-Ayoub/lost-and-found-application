import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { StatusBar } from 'expo-status-bar';
import ItemCard from './components/ItemCard';
import Filters from './components/Filters';
import DistanceFilter from './components/DistanceFilter';

const HomeScreen = ({ navigation }) => {
  const { items, loading } = useItems();
  const { user, logout } = useAuth();

  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [maxDistance, setMaxDistance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

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

  const filteredItems = items.filter(item => {
    const matchesType = type === 'all' || item.type === type;
    const matchesCategory = category === 'all' || item.category === category;
    
    let matchesDistance = true;
    if (maxDistance && userLocation && item.coordinates) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.coordinates.latitude,
        item.coordinates.longitude
      );
      matchesDistance = distance <= maxDistance;
    }
    
    return matchesType && matchesCategory && matchesDistance;
  });

  const handlePost = () => {
    navigation.navigate('PostItem');
  };

  const handleDetails = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  const handleDistanceFilter = (distance, location) => {
    setMaxDistance(distance);
    setUserLocation(location);
  };

  const clearDistanceFilter = () => {
    setMaxDistance(null);
    setUserLocation(null);
  };


  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FindBack</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          {/* Logout button removed; only available in Settings */}
        </View>
      </View>

      {/* Filters */}
      <Filters
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        onApply={() => { }}
      />

      {/* Distance Filter */}
      <View style={styles.distanceFilterContainer}>
        <TouchableOpacity
          style={styles.distanceFilterButton}
          onPress={() => setShowDistanceFilter(true)}
        >
          <Text style={styles.distanceFilterText}>
            🗺️ Filter items by distance
          </Text>
        </TouchableOpacity>
        {maxDistance && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearDistanceFilter}
          >
            <Text style={styles.clearFilterText}>
              Clear ({maxDistance}km)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement des posts...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {loading ? 'Chargement...' : 'Aucun post trouvé. Soyez le premier à publier !'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => handleDetails(item)}
              showContact={false} // Card action handled by Details now
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handlePost}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <DistanceFilter
        visible={showDistanceFilter}
        onClose={() => setShowDistanceFilter(false)}
        onDistanceFilter={handleDistanceFilter}
        userLocation={userLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3498db',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 80, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
  distanceFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    alignItems: 'center',
  },
  distanceFilterButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  distanceFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilterButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#e74c3c',
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default HomeScreen;