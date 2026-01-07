import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Filters = ({ onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState('all'); // all, lost, found
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, distance

  const categories = ['all', 'keys', 'phone', 'clothes', 'wallet', 'other'];

  const applyFilters = () => {
    onFilterChange({ searchText, type, category, sortBy });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search items..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={applyFilters}
      />
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.button, type === 'all' && styles.activeButton]}
          onPress={() => setType('all')}
        >
          <Text style={[styles.buttonText, type === 'all' && styles.activeText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, type === 'lost' && styles.activeButton]}
          onPress={() => setType('lost')}
        >
          <Text style={[styles.buttonText, type === 'lost' && styles.activeText]}>Lost</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, type === 'found' && styles.activeButton]}
          onPress={() => setType('found')}
        >
          <Text style={[styles.buttonText, type === 'found' && styles.activeText]}>Found</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Category:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.button, category === cat && styles.activeButton]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.buttonText, category === cat && styles.activeText]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.filterRow}>
        <Text style={styles.label}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.button, sortBy === 'newest' && styles.activeButton]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.buttonText, sortBy === 'newest' && styles.activeText]}>Newest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, sortBy === 'distance' && styles.activeButton]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.buttonText, sortBy === 'distance' && styles.activeText]}>Distance</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.applyText}>Apply Filters</Text>
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