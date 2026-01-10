import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

const Language = () => {
  const { language, switchLanguage, t } = useLanguage();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('language')}</Text>

      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: theme.surface, borderColor: theme.border },
          language === 'fr' && { backgroundColor: theme.primary, borderColor: theme.primary }
        ]}
        onPress={() => switchLanguage('fr')}
      >
        <Text style={[
          styles.text,
          { color: theme.text },
          language === 'fr' && styles.selectedText
        ]}>Français</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btn,
          { backgroundColor: theme.surface, borderColor: theme.border },
          language === 'en' && { backgroundColor: theme.primary, borderColor: theme.primary }
        ]}
        onPress={() => switchLanguage('en')}
      >
        <Text style={[
          styles.text,
          { color: theme.text },
          language === 'en' && styles.selectedText
        ]}>English</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  btn: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: '#ffffff',
  },
});

export default Language;
