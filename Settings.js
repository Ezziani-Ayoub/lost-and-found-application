
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';
import { deleteUser } from 'firebase/auth';

const Settings = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { setUserOffline } = useUsers();

  const handleDeleteAccount = () => {
    Alert.alert('Supprimer le compte', 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          if (user) {
            await setUserOffline(user.uid);
            await deleteUser(user);
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé.');
          }
        } catch (e) {
          Alert.alert('Erreur', 'Impossible de supprimer le compte. Veuillez vous reconnecter puis réessayer.');
        }
      } },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => {
        try {
          if (user) await setUserOffline(user.uid);
          await logout();
        } catch (e) {
          Alert.alert('Erreur', 'Impossible de se déconnecter.');
        }
      } },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Paramètres</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Account')}>
        <Text>Mon Compte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Language')}>
        <Text>Langue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('FAQ')}>
        <Text>FAQ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Notifications')}>
        <Text>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
        <Text style={{ color: 'red' }}>Supprimer le compte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={handleLogout}>
        <Text>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default Settings;
