
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { deleteUser } from 'firebase/auth';

const Settings = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { setUserOffline } = useUsers();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const handleDeleteAccount = () => {
    Alert.alert(t('deleteAccount'), 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => {
          try {
            if (user) {
              await setUserOffline(user.uid);
              await deleteUser(user);
              Alert.alert('Compte supprimé', 'Votre compte a été supprimé.');
            }
          } catch (e) {
            Alert.alert(t('error'), 'Impossible de supprimer le compte. Veuillez vous reconnecter puis réessayer.');
          }
        }
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Voulez-vous vraiment vous déconnecter ?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'), style: 'destructive', onPress: async () => {
          try {
            if (user) await setUserOffline(user.uid);
            await logout();
          } catch (e) {
            Alert.alert(t('error'), 'Impossible de se déconnecter.');
          }
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{t('settings')}</Text>

      <View style={[styles.item, { borderBottomColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Mode Sombre</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Account')}>
        <Text style={{ color: theme.text }}>{t('account')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Language')}>
        <Text style={{ color: theme.text }}>{t('language')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('FAQ')}>
        <Text style={{ color: theme.text }}>{t('faq')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Notifications')}>
        <Text style={{ color: theme.text }}>{t('notifications')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={handleDeleteAccount}>
        <Text style={{ color: 'red' }}>{t('deleteAccount')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={handleLogout}>
        <Text style={{ color: theme.text }}>{t('logout')}</Text>
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
