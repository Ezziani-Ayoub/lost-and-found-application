import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';

const ItemDetails = ({ route, navigation }) => {
  const { item } = route.params;
  const { updateItem } = useItems();
  const { user } = useAuth();

  const handleClaim = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to claim items.');
      return;
    }
    updateItem(item.id, { status: 'returned' });
    Alert.alert('Success', 'Item marked as returned!');
    navigation.goBack();
  };

  const handleMarkFound = () => {
    updateItem(item.id, { status: 'returned' });
    Alert.alert('Success', 'Item marked as found!');
    navigation.goBack();
  };

  const isOwner = user && item.userId === user.id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.details}>Type: {item.type === 'lost' ? 'Lost' : 'Found'}</Text>
      <Text style={styles.details}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.details}>Location: {item.location}</Text>
      <Text style={styles.details}>Category: {item.category}</Text>
      <Text style={styles.details}>Status: {item.status}</Text>

      {/* Placeholder for map */}
      <View style={styles.mapPlaceholder}>
        <Text>Map Preview (Coming Soon)</Text>
      </View>

      {user ? (
        isOwner ? (
          item.type === 'lost' && item.status === 'open' && (
            <TouchableOpacity style={styles.foundButton} onPress={handleMarkFound}>
              <Text style={styles.foundText}>I Found It!</Text>
            </TouchableOpacity>
          )
        ) : (
          item.status === 'open' && (
            <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
              <Text style={styles.claimText}>
                {item.type === 'lost' ? 'This is mine!' : 'I found this'}
              </Text>
            </TouchableOpacity>
          )
        )
      ) : (
        <Text style={styles.loginPrompt}>Login to interact with this item.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  claimButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  claimText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ItemDetails;