import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ItemCard from './components/ItemCard';
import Filters from './components/Filters';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';

const HomeScreen = ({ navigation }) => {
  const { items } = useItems();
  const { user, logout } = useAuth();
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleFilterChange = (filters) => {
    let filtered = items;

    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.searchText) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    // For sort, since no distance, just sort by date for newest
    if (filters.sortBy === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    // Distance not implemented yet

    setFilteredItems(filtered);
  };

  const handleItemPress = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {user ? (
          <>
            <Text style={styles.welcomeText}>Bienvenue, {user.name}!</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.postHeaderButton} onPress={() => navigation.navigate('PostItem')}>
                <Text style={styles.postHeaderText}>Publier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.bannerText}>Connectez-vous pour publier des objets perdus et interagir avec les publications.</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Connexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Filters onFilterChange={handleFilterChange} />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={() => handleItemPress(item)} />
        )}
      />
      {user && (
        <TouchableOpacity style={styles.postButton} onPress={() => navigation.navigate('PostItem')}>
            <Text style={styles.postText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  bannerText: {
    fontSize: 14,
    color: '#1976d2',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  postHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  postText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default HomeScreen;