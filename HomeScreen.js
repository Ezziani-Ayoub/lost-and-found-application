import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { useChats } from './ChatsContext';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

import { StatusBar } from 'expo-status-bar';
import ItemCard from './components/ItemCard';
import Filters from './components/Filters';

import LocationFilter from './components/LocationFilter';

const HomeScreen = ({ navigation }) => {
  const { items, loading } = useItems();
  const { user, logout } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const chatContext = useChats();
  const totalUnreadCount = chatContext?.totalUnreadCount || 0;

  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCity, setFilterCity] = useState('');



  const filteredItems = items.filter(item => {
    const matchesType = type === 'all' || item.type === type;
    const matchesCategory = category === 'all' || item.category === category;

    let matchesLocation = true;
    if (filterCountry) {
      matchesLocation = matchesLocation && item.country === filterCountry;
    }
    if (filterCity) {
      // Case insensitive partial match or exact? User said "select country" and "add city option".
      // Often city search is fuzzy. Let's do case-insensitive partial for now to be safe.
      // Actually user said "select country (add known countries) and also select the city". 
      // If it's a text input, partial match is better.
      matchesLocation = matchesLocation && item.city && item.city.toLowerCase().includes(filterCity.toLowerCase());
    }

    return matchesType && matchesCategory && matchesLocation;
  });

  const handlePost = () => {
    navigation.navigate('PostItem');
  };

  const handleDetails = (item) => {
    navigation.navigate('ItemDetails', { item });
  };

  const handleLocationFilter = (country, city) => {
    setFilterCountry(country);
    setFilterCity(city);
  };

  const clearLocationFilter = () => {
    setFilterCountry('');
    setFilterCity('');
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBarStyle} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>{t('homeTitle')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.settingsButton}>
            <View>
              <Text style={styles.settingsIcon}>✉️</Text>
              {totalUnreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'red',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{totalUnreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
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

      {/* Location Filter */}
      <View style={[styles.distanceFilterContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.distanceFilterButton}
          onPress={() => setShowLocationFilter(true)}
        >
          <Text style={styles.distanceFilterText}>
            🌍 Filtrer par Lieu
          </Text>
        </TouchableOpacity>
        {(filterCountry || filterCity) && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={clearLocationFilter}
          >
            <Text style={styles.clearFilterText}>
              Effacer ({filterCountry ? filterCountry : ''} {filterCity ? `- ${filterCity}` : ''})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement des posts...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {loading ? 'Chargement...' : 'Aucun post trouvé. Soyez le premier à publier !'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.itemCard, { backgroundColor: theme.surface, marginBottom: 15, borderRadius: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }]}
              onPress={() => handleDetails(item)}
              activeOpacity={0.9}
            >
              <View style={[styles.itemHeader, { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: item.type === 'lost' ? '#e74c3c' : '#3498db', borderTopLeftRadius: 15, borderTopRightRadius: 15 }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.type === 'lost' ? t('lost').toUpperCase() : t('found').toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>
                    {item.status === 'actif' ? t('active') : item.status === 'en_attente' ? t('pending') : t('returned')}
                  </Text>
                </View>
              </View>

              <View style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 60, height: 60, borderRadius: 15, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                    {item.photo ? (
                      <Image
                        source={{ uri: item.photo }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 24 }}>
                        {item.category === 'cles' ? '🔑' :
                          item.category === 'telephone' ? '📱' :
                            item.category === 'vêtements' ? '👕' :
                              item.category === 'portefeuille' ? '👛' : '📦'}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: item.type === 'lost' ? '#e74c3c' : '#3498db', fontWeight: 'bold', marginBottom: 4 }}>{item.category.toUpperCase()}</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 4 }} numberOfLines={1}>{item.title}</Text>
                    <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 8 }} numberOfLines={1}>{item.description}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, marginRight: 4 }}>📍</Text>
                      <Text style={{ fontSize: 13, color: theme.textSecondary }} numberOfLines={1}>
                        {item.location || 'Position inconnue'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: theme.border }}>
                <Text style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'right' }}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handlePost}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <LocationFilter
        visible={showLocationFilter}
        onClose={() => setShowLocationFilter(false)}
        onApply={handleLocationFilter}
        initialCountry={filterCountry}
        initialCity={filterCity}
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
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
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