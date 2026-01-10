import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';

const Account = () => {
  const { user } = useAuth();
  const { users, updateUserProfile, loading } = useUsers();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(user ? users[user.uid] || {} : {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && users[user.uid]) setProfile(users[user.uid]);
  }, [user, users]);

  if (!user) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Non connecté</Text></View>;
  if (loading) return <ActivityIndicator style={{marginTop:40}} />;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      Alert.alert('Succès', 'Profil mis à jour');
      setEditMode(false);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
    setSaving(false);
  };

  return (
    <View style={{flex:1,padding:24}}>
      <Text style={{fontSize:24,fontWeight:'bold',marginBottom:20}}>Mon Compte</Text>
      <Text>Email: {user.email}</Text>
      <TextInput
        style={styles.input}
        value={profile.displayName || ''}
        editable={editMode}
        onChangeText={t => setProfile(p => ({...p, displayName:t}))}
        placeholder="Nom affiché"
      />
      <TextInput
        style={styles.input}
        value={profile.phone || ''}
        editable={editMode}
        onChangeText={t => setProfile(p => ({...p, phone:t}))}
        placeholder="Téléphone"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        value={profile.city || ''}
        editable={editMode}
        onChangeText={t => setProfile(p => ({...p, city:t}))}
        placeholder="Ville"
      />
      <TextInput
        style={styles.input}
        value={profile.country || ''}
        editable={editMode}
        onChangeText={t => setProfile(p => ({...p, country:t}))}
        placeholder="Pays"
      />
      {editMode ? (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={{color:'#fff',fontWeight:'bold'}}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
          <Text style={{color:'#3498db',fontWeight:'bold'}}>Modifier</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editBtn: {
    marginTop: 20,
    alignSelf: 'flex-end',
    padding: 10,
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default Account;
