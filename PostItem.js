import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
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

  // Data
  const categories = [
    { id: 'cles', label: 'Clés', icon: '🔑' },
    { id: 'telephone', label: 'Téléphone', icon: '📱' },
    { id: 'vêtements', label: 'Vêtements', icon: '👕' },
    { id: 'portefeuille', label: 'Portefeuille', icon: '👛' },
    { id: 'autre', label: 'Autre', icon: '📦' },
  ];
  const types = [
    { id: 'lost', label: 'Objet Perdu', icon: '🔍', color: '#e74c3c' },
    { id: 'found', label: 'Objet Trouvé', icon: '📦', color: '#3498db' },
  ];

  const handlePost = () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier.');
      return;
    }
    if (!title || !description || !location) {
      Alert.alert('Incomplet', 'Veuillez remplir le titre, la description et le lieu.');
      return;
    }

    const newItem = {
      type,
      title,
      description,
      photo: null, // Photo upload not implemented in UI yet
      date: new Date().toISOString().split('T')[0],
      location,
      category,
      status,
    };

    addItem(newItem);
    Alert.alert('Succès', 'Votre annonce a été publiée!');
    navigation.goBack();
  };

  if (!user) return null; // Should not happen due to navigation guards

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          <Text style={styles.headerTitle}>Créer une Annonce</Text>
          <Text style={styles.headerSubtitle}>Dites-nous ce que vous avez perdu ou trouvé.</Text>

          {/* Type Selection */}
          <Text style={styles.sectionLabel}>Type d'annonce</Text>
          <View style={styles.typeRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeCard,
                  type === t.id && { backgroundColor: t.color, borderColor: t.color },
                ]}
                onPress={() => setType(t.id)}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeText, type === t.id && styles.activeTypeText]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Details Form */}
          <Text style={styles.sectionLabel}>Détails</Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre (ex: iPhone 13 Noir)"
            placeholderTextColor="#95a5a6"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description détaillée..."
            placeholderTextColor="#95a5a6"
            multiline
            textAlignVertical="top"
          />

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Lieu (ex: Cafétéria)"
            placeholderTextColor="#95a5a6"
          />

          {/* Category Selection */}
          <Text style={styles.sectionLabel}>Catégorie</Text>
          <View style={styles.chipsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, category === cat.id && styles.activeChip]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.chipIcon}>{cat.icon}</Text>
                <Text style={[styles.chipText, category === cat.id && styles.activeChipText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handlePost}>
          <Text style={styles.submitButtonText}>Publier Maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for footer
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34495e',
    marginBottom: 15,
    marginTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeTypeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#2c3e50',
  },
  textArea: {
    height: 120,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  activeChip: {
    backgroundColor: '#3498db',
  },
  chipIcon: {
    marginRight: 5,
    fontSize: 16,
  },
  chipText: {
    color: '#7f8c8d',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  submitButton: {
    backgroundColor: '#2ecc71', // Green for success/action
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default PostItem;