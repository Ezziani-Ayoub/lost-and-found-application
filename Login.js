import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth'; // Note: browserLocalPersistence reflects underlying persistence in RN context if available, but clearer to just rely on initial config for true, and inMemory for false.
import { auth, db } from './firebaseConfig';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { StatusBar } from 'expo-status-bar';

const Login = ({ navigation }) => {
  const { login, signup, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir l\'email et le mot de passe.');
      return;
    }

    if (!isLogin) {
      if (!name || !surname || !age || !country || !city || !phone) {
        Alert.alert('Incomplet', 'Veuillez remplir tous les champs du profil.');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
    }

    setLoading(true);
    try {
      let firebaseUser;

      // Set persistence based on checkbox
      if (isLogin) {
        try {
          if (!rememberMe) {
            await setPersistence(auth, inMemoryPersistence);
          }
        } catch (pErr) {
          console.log("Persistence error:", pErr);
        }

        firebaseUser = await login(email, password);
      } else {
        firebaseUser = await signup(email, password, {
          name,
          surname,
          age,
          country,
          city,
          phone
        });
      }

      // Check for ban status immediately after login
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.isBanned) {
            await logout(); // Logout immediately
            Alert.alert(
              'Compte Suspendu',
              'Your account has been suspended for further info please contact us in FindBack@gmail.com'
            );
            return;
          }
        }
      }

    } catch (error) {
      console.error(error);
      let errorMessage = 'L\'authentification a échoué. Veuillez réessayer.';

      if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format d\'email invalide.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect.';
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>FindBack</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{isLogin ? t('welcomeBack') : t('createAccount')}</Text>

          {!isLogin && (
            <>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('firstName')}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={theme.textSecondary}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('surname')}
                  value={surname}
                  onChangeText={setSurname}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t('age')}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('country')}
                  value={country}
                  onChangeText={setCountry}
                  placeholderTextColor={theme.textSecondary}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder={t('city')}
                  value={city}
                  onChangeText={setCity}
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t('phone')}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={theme.textSecondary}
              />
            </>
          )}

          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder={t('emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.textSecondary}
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.textSecondary}
          />

          {isLogin && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked, { borderColor: theme.primary }]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.text }]}>{t('Remember me') || "Se souvenir de moi"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('wait') : (isLogin ? t('signIn') : t('signUp'))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
            <Text style={[styles.switchText, { color: theme.textSecondary }]}>
              {isLogin ? t('noAccount') : t('alreadyAccount')}
              <Text style={styles.switchTextBold}>{isLogin ? t('signUp') : t('signIn')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a9cce3',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchContainer: {
    alignItems: 'center',
    padding: 10,
  },
  switchText: {
    color: '#7f8c8d',
    fontSize: 15,
  },
  switchTextBold: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderColor: '#3498db',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default Login;