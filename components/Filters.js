import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Filters = ({ onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState('all'); // all, lost, found
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, distance

  const categories = ['all', 'cles', 'telephone', 'vêtements', 'portefeuille', 'autre'];
  const statuses = ['all', 'actif', 'en_attente', 'resolu'];
  const categoryLabels = {
    'all': 'Tous',
    'cles': 'Clés',
    'telephone': 'Téléphone', 
    'vêtements': 'Vêtements',
    'portefeuille': 'Portefeuille',
    'autre': 'Autre'
  };

  const applyFilters = () => {
    onFilterChange({ searchText, type, category, status, sortBy });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher des objets..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={applyFilters}
      />
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.button, type === 'all' && styles.activeButton]}
          onPress={() => setType('all')}
        >
          <Text style={[styles.buttonText, type === 'all' && styles.activeText]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, type === 'lost' && styles.activeButton]}
          onPress={() => setType('lost')}
        >
          <Text style={[styles.buttonText, type === 'lost' && styles.activeText]}>Perdu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, type === 'found' && styles.activeButton]}
          onPress={() => setType('found')}
        >
          <Text style={[styles.buttonText, type === 'found' && styles.activeText]}>Trouvé</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Catégorie:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.button, category === cat && styles.activeButton]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.buttonText, category === cat && styles.activeText]}>
              {categoryLabels[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>Statut:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
        {statuses.map((stat) => (
          <TouchableOpacity
            key={stat}
            style={[styles.button, status === stat && styles.activeButton]}
            onPress={() => setStatus(stat)}
          >
            <Text style={[styles.buttonText, status === stat && styles.activeText]}>
              {stat === 'all' ? 'Tous' : stat === 'actif' ? 'Actif' : stat === 'en_attente' ? 'En attente' : 'Résolu'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.filterRow}>
        <Text style={styles.label}>Trier par:</Text>
        <TouchableOpacity
          style={[styles.button, sortBy === 'newest' && styles.activeButton]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.buttonText, sortBy === 'newest' && styles.activeText]}>Plus récent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, sortBy === 'distance' && styles.activeButton]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.buttonText, sortBy === 'distance' && styles.activeText]}>Distance</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.applyText}>Appliquer les filtres</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryRow: {
    marginBottom: 10,
  },
  statusRow: {
    marginBottom: 10,
  },
  button: {
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#333',
  },
  activeText: {
    color: '#fff',
  },
  label: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Filters;