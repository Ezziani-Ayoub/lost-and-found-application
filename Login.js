import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { StatusBar } from 'expo-status-bar';

const Login = ({ navigation }) => {
  const { login, signup } = useAuth();
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
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, {
          name,
          surname,
          age,
          country,
          city,
          phone
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'L\'authentification a échoué. Veuillez réessayer.');
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
});

export default Login;