import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { useUsers } from './UsersContext';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import * as ImagePicker from 'expo-image-picker';
import { verifyBeforeUpdateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const Account = () => {
  const { user, auth } = useAuth(); // assuming auth is exported from useAuth or accessible
  const { users, updateUserProfile, loading: usersLoading } = useUsers();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Email Update State
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');

  useEffect(() => {
    if (user && users[user.uid]) {
      setProfile(users[user.uid]);
    } else if (user) {
      // Fallback if users context isn't ready
      setProfile({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      })
    }
  }, [user, users]);

  if (!user || usersLoading) return (
    <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );

  const pickImage = async () => {
    if (!editMode) return;

    Alert.alert(
      t('profilePic'),
      t('selectPhoto'),
      [
        {
          text: t('takePhoto'),
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled) {
              handleImageSelected(result.assets[0]);
            }
          }
        },
        {
          text: t('selectPhoto'),
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled) {
              handleImageSelected(result.assets[0]);
            }
          }
        },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const handleImageSelected = (asset) => {
    // Ideally upload to storage, but for now we us base64 if small enough or just URI if local (but URI won't persist across devices without storage).
    // Using base64 for "quick" persistence in Firestore (NOT RECOMMENDED for production but requested context implies no storage setup yet).
    // Actually, Firestore has limit of 1MB. Base64 might be too big.
    // Let's use the URI for now, but really we should use Storage. 
    // Since user specifically asked for "saved", let's try to save the base64 string if it exists.
    const imageUri = `data:image/jpeg;base64,${asset.base64}`;
    setProfile(p => ({ ...p, photoURL: imageUri }));
    setEditMode(true); // Enable edit mode so user sees the "Save" button
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      Alert.alert(t('success'), t('saved'));
      setEditMode(false);
    } catch (e) {
      Alert.alert(t('error'), 'Impossible de mettre à jour le profil');
    }
    setSaving(false);
  };

  const reauthenticate = async (password) => {
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      Alert.alert(t('error'), 'Mot de passe incorrect');
      return false;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('error'), 'Remplissez tous les champs');
      return;
    }

    if (await reauthenticate(currentPassword)) {
      try {
        await updatePassword(user, newPassword);
        Alert.alert(t('success'), 'Mot de passe mis à jour');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
      } catch (error) {
        Alert.alert(t('error'), error.message);
      }
    }
  };

  const handleChangeEmail = async () => {
    if (!currentPasswordForEmail || !newEmail) {
      Alert.alert(t('error'), 'Remplissez tous les champs');
      return;
    }

    if (await reauthenticate(currentPasswordForEmail)) {
      try {
        await verifyBeforeUpdateEmail(user, newEmail);
        Alert.alert(t('success'), 'Un email de vérification a été envoyé à votre nouvelle adresse. Veuillez confirmer pour finaliser le changement.');
        setShowEmailModal(false);
        setNewEmail('');
        setCurrentPasswordForEmail('');
      } catch (error) {
        Alert.alert(t('error'), error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} disabled={!editMode}>
            <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
              {profile.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarPlaceholder}>{profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}</Text>
              )}
              {editMode && (
                <View style={styles.editBadge}>
                  <Text style={{ fontSize: 12 }}>📷</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: theme.text }]}>{profile.displayName || user.email}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations Personnelles</Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={profile.displayName || ''}
            editable={editMode}
            onChangeText={t => setProfile(p => ({ ...p, displayName: t }))}
            placeholder="Nom complet"
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
            value={profile.phone || ''}
            editable={editMode}
            onChangeText={t => setProfile(p => ({ ...p, phone: t }))}
            placeholder="Téléphone"
            keyboardType="phone-pad"
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={profile.city || ''}
              editable={editMode}
              onChangeText={t => setProfile(p => ({ ...p, city: t }))}
              placeholder="Ville"
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              value={profile.country || ''}
              editable={editMode}
              onChangeText={t => setProfile(p => ({ ...p, country: t }))}
              placeholder="Pays"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {editMode ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveProfile} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? '...' : t('save')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.button, styles.editBtn, { borderColor: theme.primary }]} onPress={() => setEditMode(true)}>
              <Text style={[styles.editBtnText, { color: theme.primary }]}>{t('edit')} Profil</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sécurité</Text>

          <TouchableOpacity style={[styles.securityButton, { backgroundColor: theme.surface }]} onPress={() => setShowEmailModal(true)}>
            <Text style={[styles.securityButtonText, { color: theme.text }]}>{t('updateEmail')}</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.securityButton, { backgroundColor: theme.surface }]} onPress={() => setShowPasswordModal(true)}>
            <Text style={[styles.securityButtonText, { color: theme.text }]}>{t('updatePassword')}</Text>
            <Text style={{ color: theme.textSecondary }}>→</Text>
          </TouchableOpacity>

        </View>

        {/* Change Password Modal */}
        <Modal visible={showPasswordModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('updatePassword')}</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t('currentPassword')}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor={theme.textSecondary}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t('newPassword')}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: theme.primary }]} onPress={handleChangePassword}>
                  <Text style={styles.modalConfirmText}>{t('confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Change Email Modal */}
        <Modal visible={showEmailModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('updateEmail')}</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Nouvel Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={newEmail}
                onChangeText={setNewEmail}
                placeholderTextColor={theme.textSecondary}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder={t('currentPassword')}
                secureTextEntry
                value={currentPasswordForEmail}
                onChangeText={setCurrentPasswordForEmail}
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                  <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: theme.primary }]} onPress={handleChangeEmail}>
                  <Text style={styles.modalConfirmText}>{t('confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 20 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden', backgroundColor: '#ddd' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { fontSize: 40, fontWeight: 'bold', color: '#555' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', padding: 4, borderRadius: 10 },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 14, marginTop: 4 },
  form: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  input: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  saveBtn: { flex: 1, marginLeft: 5 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  cancelBtn: { flex: 1, marginRight: 5, backgroundColor: '#ccc' },
  cancelBtnText: { color: '#333', fontWeight: 'bold' },
  editBtn: { borderWidth: 1, backgroundColor: 'transparent' },
  editBtnText: { fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', marginTop: 10 },
  divider: { height: 1, marginVertical: 25 },
  securityButton: { padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  securityButtonText: { fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  modalCancel: { fontSize: 16, fontWeight: '600' },
  modalConfirm: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalConfirmText: { color: 'white', fontWeight: 'bold' }
});

export default Account;
