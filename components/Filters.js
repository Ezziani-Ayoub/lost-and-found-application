import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Filters = ({ type, setType, category, setCategory, onApply }) => {
  const types = [
    { id: 'all', label: 'Tout' },
    { id: 'lost', label: 'Perdu' },
    { id: 'found', label: 'Trouvé' },
  ];

  const categories = [
    { id: 'all', label: 'Tout' },
    { id: 'cles', label: 'Clés' },
    { id: 'telephone', label: 'Téléphone' },
    { id: 'vêtements', label: 'Vêtements' },
    { id: 'portefeuille', label: 'Portefeuille' },
    { id: 'autre', label: 'Autre' },
  ];

  const renderPill = (item, current, setter) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.pill, current === item.id && styles.activePill]}
      onPress={() => {
        setter(item.id);
      }}
    >
      <Text style={[styles.pillText, current === item.id && styles.activePillText]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {types.map(t => renderPill(t, type, setType))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {categories.map(c => renderPill(c, category, setCategory))}
      </ScrollView>

      <TouchableOpacity style={styles.applyButton} onPress={onApply}>
        <Text style={styles.applyButtonText}>Appliquer Filtres</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  scrollRow: {
    paddingHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    marginRight: 10,
  },
  activePill: {
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activePillText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  applyButton: {
    marginHorizontal: 15,
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Filters;