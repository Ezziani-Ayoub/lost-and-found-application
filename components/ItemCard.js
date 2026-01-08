import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ItemCard = ({ item, onPress, onContact, showContact }) => {
  const { title, description, photo, date, location, category, type, status } = item;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'actif':
        return { color: '#2ecc71' };
      case 'en_attente':
        return { color: '#f1c40f' };
      case 'resolu':
        return { color: '#2ecc71' };
      default:
        return { color: '#666' };
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.type}>{type === 'lost' ? '🔍 Perdu' : '📦 Trouvé'}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={[styles.status, getStatusStyle(status)]}>
          {status === 'actif' ? '✅ Actif' : status === 'en_attente' ? '⏳ En attente' : status === 'resolu' ? '✅ Résolu' : '📋 ' + status}
        </Text>
      </View>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text>Pas d'image</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <Text style={styles.details}>Date: {new Date(date).toLocaleDateString()}</Text>
        <Text style={styles.details}>Lieu: {location}</Text>

        {showContact && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering card onPress
              onContact();
            }}
          >
            <Text style={styles.contactButtonText}>Contacter le propriétaire</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  type: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  details: {
    fontSize: 12,
    color: '#999',
  },
  contactButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ItemCard;