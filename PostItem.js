import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { useItems } from './ItemsContext';
import { useAuth } from './AuthContext';
import LocationPicker from './components/LocationPicker';
import * as ImagePicker from 'expo-image-picker';

const PostItem = ({ navigation, route }) => {
  const { addItem, updateItem } = useItems();
  const { user } = useAuth();

  // Check if we are in "Edit Mode"
  const editItem = route.params?.item;
  const isEditMode = !!editItem;

  const [title, setTitle] = useState(editItem?.title || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [location, setLocation] = useState(editItem?.location || '');
  const [coordinates, setCoordinates] = useState(editItem?.coordinates || null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [category, setCategory] = useState(editItem?.category || 'autre');
  const [status, setStatus] = useState(editItem?.status || 'actif');
  const [type, setType] = useState(editItem?.type || 'lost');
  const [photo, setPhoto] = useState(editItem?.photo || null);

  useEffect(() => {
    if (isEditMode) {
      navigation.setOptions({ headerTitle: 'Modifier l\'annonce' });
    }
  }, [isEditMode, navigation]);

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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier.');
      return;
    }
    if (!title || !description || !location) {
      Alert.alert('Incomplet', 'Veuillez remplir le titre, la description et le lieu.');
      return;
    }

    const itemData = {
      type,
      title,
      description,
      photo,
      location,
      coordinates,
      category,
      status,
      // Date is usually kept from creation, or updated? 
      // For now, let's keep original date if editing, or new date if creating.
      ...(isEditMode ? {} : { date: new Date().toISOString().split('T')[0] }),
    };

    try {
      if (isEditMode) {
        await updateItem(editItem.id, itemData);
        Alert.alert('Succès', 'Annonce mise à jour !');
      } else {
        await addItem(itemData);
        Alert.alert('Succès', 'Votre annonce a été publiée !');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue.');
      console.error('Erreur:', error);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

          <Text style={styles.headerTitle}>{isEditMode ? 'Modifier l\'Annonce' : 'Créer une Annonce'}</Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode ? 'Mettez à jour les informations de votre objet.' : 'Dites-nous ce que vous avez perdu ou trouvé.'}
          </Text>

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

          {/* Image Picker */}
          <Text style={styles.sectionLabel}>Photo</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {photo && (
            <TouchableOpacity onPress={() => setPhoto(null)} style={styles.removeImageButton}>
              <Text style={styles.removeImageText}>Supprimer la photo</Text>
            </TouchableOpacity>
          )}

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

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Text style={styles.mapButtonText}>
              {coordinates ? '📍 Position sélectionnée (Modifier)' : '🗺️ Sélectionner sur la carte'}
            </Text>
          </TouchableOpacity>

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
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Mettre à jour' : 'Publier Maintenant'}
          </Text>
        </TouchableOpacity>
      </View>

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={(coords) => {
          setCoordinates(coords);
          // Auto-fill location text if empty? Logic can be refined.
          if (!location) {
            // Reverse geocoding could go here if we had it.
            setLocation(`Position: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
          }
        }}
        initialLocation={coordinates}
      />
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
    backgroundColor: '#2ecc71',
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
  mapButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  imagePlaceholderText: {
    color: '#95a5a6',
    fontWeight: '500',
  },
  removeImageButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  removeImageText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostItem;