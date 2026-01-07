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
  const [category, setCategory] = useState('other');

  const categories = ['keys', 'phone', 'clothes', 'wallet', 'other'];

  const handlePost = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }
    if (!title || !description || !location) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const newItem = {
      type: 'lost', // Only lost items can be posted
      title,
      description,
      photo: null, // For now, no photo
      date: new Date().toISOString().split('T')[0], // Today's date
      location,
      category,
    };

    addItem(newItem);
    Alert.alert('Success', 'Lost item posted successfully!');
    navigation.goBack();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You must be logged in to post items.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Post a Lost Item</Text>

      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Black wallet"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the item..."
        multiline
      />

      <Text style={styles.label}>Location:</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Campus Library"
      />

      <Text style={styles.label}>Category:</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, category === cat && styles.activeCategory]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.activeCategoryText]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postText}>Post Lost Item</Text>
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