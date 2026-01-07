import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';

const PostItem = ({ navigation }) => {
  const { addItem } = useItems();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('autre');
  const [status, setStatus] = useState('actif');
  const [type, setType] = useState('lost');

  const categories = ['cles', 'telephone', 'vêtements', 'portefeuille', 'autre'];
  const categoryLabels = {
    'cles': 'Clés',
    'telephone': 'Téléphone', 
    'vêtements': 'Vêtements',
    'portefeuille': 'Portefeuille',
    'autre': 'Autre'
  };
  const statuses = ['actif', 'en_attente', 'resolu'];
  const types = ['lost', 'found'];
  const typeLabels = {
    'lost': 'Objet perdu',
    'found': 'Objet trouvé'
  };

  const handlePost = () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier.');
      return;
    }
    if (!title || !description || !location) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newItem = {
      type,
      title,
      description,
      photo: null,
      date: new Date().toISOString().split('T')[0],
      location,
      category,
      status,
    };

    addItem(newItem);
    Alert.alert('Succès', 'Objet publié avec succès!');
    navigation.goBack();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Vous devez être connecté pour publier des objets.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Publier une Annonce</Text>

      <Text style={styles.label}>Type d'annonce:</Text>
      <View style={styles.typeRow}>
        {types.map((typ) => (
          <TouchableOpacity
            key={typ}
            style={[styles.typeButton, type === typ && styles.activeType]}
            onPress={() => setType(typ)}
          >
            <Text style={[styles.typeText, type === typ && styles.activeTypeText]}>
              {typeLabels[typ]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Titre:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="ex: Portefeuille noir"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez l'objet..."
        multiline
      />

      <Text style={styles.label}>Lieu:</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="ex: Bibliothèque du Campus"
      />

      <Text style={styles.label}>Catégorie:</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, category === cat && styles.activeCategory]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.activeCategoryText]}>
              {categoryLabels[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Statut:</Text>
      <View style={styles.statusRow}>
        {statuses.map((stat) => (
          <TouchableOpacity
            key={stat}
            style={[styles.statusButton, status === stat && styles.activeStatus]}
            onPress={() => setStatus(stat)}
          >
            <Text style={[styles.statusText, status === stat && styles.activeStatusText]}>
              {stat === 'actif' ? 'Actif' : stat === 'en_attente' ? 'En attente' : 'Résolu'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postText}>Publier l'Annonce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#007bff',
  },
  typeText: {
    fontSize: 16,
    color: '#333',
  },
  activeTypeText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  activeCategory: {
    backgroundColor: '#007bff',
  },
  categoryText: {
    color: '#333',
  },
  activeCategoryText: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  activeStatus: {
    backgroundColor: '#007bff',
  },
  statusText: {
    color: '#333',
  },
  activeStatusText: {
    color: '#fff',
  },
  postButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  postText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PostItem;