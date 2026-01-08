import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { StatusBar } from 'expo-status-bar';
import ItemCard from './components/ItemCard';
import Filters from './components/Filters';

const HomeScreen = ({ navigation }) => {
  const { items } = useItems();
  const { user, logout } = useAuth();

  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesType = type === 'all' || item.type === type;
    const matchesCategory = category === 'all' || item.category === category;
    return matchesType && matchesCategory;
  });

  const handlePost = () => {
    navigation.navigate('PostItem');
  };

  const handleDetails = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FindBack</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <Filters
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        onApply={() => { }}
      />

      {/* Feed */}
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

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handlePost}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
});

export default HomeScreen;