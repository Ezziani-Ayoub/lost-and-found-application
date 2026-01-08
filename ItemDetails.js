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
      Alert.alert('Erreur', 'Vous devez être connecté pour réclamer des objets.');
      return;
    }
    updateItem(item.id, { status: 'returned' });
    Alert.alert('Succès', 'Objet marqué comme retourné!');
    navigation.goBack();
  };

  const handleMarkFound = () => {
    updateItem(item.id, { status: 'returned' });
    Alert.alert('Succès', 'Objet marqué comme trouvé!');
    navigation.goBack();
  };

  const handleMarkResolved = () => {
    updateItem(item.id, { status: 'resolu' });
    Alert.alert('Succès', 'Objet marqué comme résolu!');
    navigation.goBack();
  };

  const handleMarkPending = () => {
    updateItem(item.id, { status: 'en_attente' });
    Alert.alert('Succès', 'Objet marqué comme en attente!');
    navigation.goBack();
  };

  const handleMarkActive = () => {
    updateItem(item.id, { status: 'actif' });
    Alert.alert('Succès', 'Objet marqué comme actif!');
    navigation.goBack();
  };

  const handleChat = () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour discuter.');
      return;
    }

    try {
      // Déterminer l'ID de l'autre utilisateur
      const otherUserId = user.id === item.userId 
        ? null // Propriétaire visualisant - sera défini quand quelqu'un envoie un message
        : item.userId; // Non-propriétaire visualisant - le propriétaire est l'autre participant

      navigation.navigate('Chat', {
        item,
        otherUserId: otherUserId || 'pending',
      });
    } catch (error) {
      console.error('Erreur lors de la navigation vers le chat:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le chat. Veuillez réessayer.');
    }
  };

  const isOwner = user && item.userId === user.id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      {item.photo ? (
        <Image source={{ uri: item.photo }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text>Pas d'image</Text>
        </View>
      )}
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.details}>Type: {item.type === 'lost' ? 'Perdu' : 'Trouvé'}</Text>
      <Text style={styles.details}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.details}>Lieu: {item.location}</Text>
      <Text style={styles.details}>Catégorie: {item.category}</Text>
      <Text style={styles.details}>Statut: {item.status === 'actif' ? 'Actif' : item.status === 'en_attente' ? 'En attente' : item.status === 'resolu' ? 'Résolu' : 'Retourné'}</Text>

      {/* Placeholder for map */}
      <View style={styles.mapPlaceholder}>
        <Text>Aperçu de la carte (Bientôt disponible)</Text>
      </View>

      {/* Debug info */}
      {__DEV__ && (
        <View style={{ padding: 10, backgroundColor: '#f0f0f0', marginBottom: 10 }}>
          <Text style={{ fontSize: 12 }}>
            Debug: user={user ? 'connecté (' + user.id + ')' : 'non connecté'}, 
            status={item.status}, 
            isOwner={isOwner ? 'oui' : 'non'}
          </Text>
        </View>
      )}

      {user ? (
        <>
          {/* Bouton Chat - disponible pour tous les utilisateurs connectés */}
          {(item.status === 'actif' || item.status === 'en_attente' || item.status === 'open') ? (
            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
              <Text style={styles.chatButtonText}>
                {isOwner ? 'Voir les messages' : 'Contacter le propriétaire'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {isOwner ? (
            <View>
              {item.status === 'actif' && (
                <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#ffc107', marginTop: 10 }]} onPress={handleMarkPending}>
                  <Text style={styles.statusText}>Mettre en attente</Text>
                </TouchableOpacity>
              )}
              {item.status === 'en_attente' && (
                <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#28a745', marginTop: 10 }]} onPress={handleMarkActive}>
                  <Text style={styles.statusText}>Activer</Text>
                </TouchableOpacity>
              )}
              {(item.status === 'actif' || item.status === 'en_attente') && (
                <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#dc3545', marginTop: 10 }]} onPress={handleMarkResolved}>
                  <Text style={styles.statusText}>Marquer comme résolu</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            item.status === 'open' && (
              <TouchableOpacity style={[styles.claimButton, { marginTop: 10 }]} onPress={handleClaim}>
                <Text style={styles.claimText}>
                  {item.type === 'lost' ? 'C\'est le mien!' : 'J\'ai trouvé ceci'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </>
      ) : (
        <Text style={styles.loginPrompt}>Connectez-vous pour interagir avec cet objet.</Text>
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
  chatButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPrompt: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ItemDetails;