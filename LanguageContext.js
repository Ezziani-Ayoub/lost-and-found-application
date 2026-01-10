import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const translations = {
    fr: {
        settings: 'Paramètres',
        account: 'Mon Compte',
        language: 'Langue',
        faq: 'FAQ',
        notifications: 'Notifications',
        deleteAccount: 'Supprimer le compte',
        logout: 'Déconnexion',
        homeTitle: 'FindBack',
        loading: 'Chargement...',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        save: 'Enregistrer',
        edit: 'Modifier',
        delete: 'Supprimer',
        email: 'Email',
        password: 'Mot de passe',
        newPassword: 'Nouveau mot de passe',
        currentPassword: 'Mot de passe actuel',
        updatePassword: 'Mettre à jour le mot de passe',
        updateEmail: 'Mettre à jour l\'email',
        profilePic: 'Photo de profil',
        selectPhoto: 'Choisir une photo',
        takePhoto: 'Prendre une photo',
        success: 'Succès',
        error: 'Erreur',
        saved: 'Enregistré avec succès',
        posted: 'Publié!',
        contactOwner: 'Contacter le propriétaire',
        viewMessages: 'Voir les Messages',
        active: 'Actif',
        pending: 'En Pause',
        returned: 'Remis',
        lost: 'Perdu',
        found: 'Trouvé',
        description: 'Description',
        location: 'Lieu',
        category: 'Catégorie',
        titlePlaceholder: 'Titre (ex: iPhone 13)',
        descPlaceholder: 'Description détaillée...',
        signIn: 'Se connecter',
        signUp: 'S\'inscrire',
        welcomeBack: 'Bon retour !',
        createAccount: 'Créer un compte',
        noAccount: 'Pas encore de compte ? ',
        alreadyAccount: 'Déjà un compte ? ',
        firstName: 'Prénom',
        surname: 'Nom',
        age: 'Âge',
        country: 'Pays',
        city: 'Ville',
        phone: 'Téléphone',
        emailPlaceholder: 'Adresse Email',
        passwordPlaceholder: 'Mot de passe',
        wait: 'Veuillez patienter...',
        tagline: 'Perdu quelque chose ? Pas de souci, on assure vos arrières.',
    },
    en: {
        settings: 'Settings',
        account: 'My Account',
        language: 'Language',
        faq: 'FAQ',
        notifications: 'Notifications',
        deleteAccount: 'Delete Account',
        logout: 'Logout',
        homeTitle: 'FindBack',
        loading: 'Loading...',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        email: 'Email',
        password: 'Password',
        newPassword: 'New Password',
        currentPassword: 'Current Password',
        updatePassword: 'Update Password',
        updateEmail: 'Update Email',
        profilePic: 'Profile Picture',
        selectPhoto: 'Select Photo',
        takePhoto: 'Take Photo',
        success: 'Success',
        error: 'Error',
        saved: 'Saved successfully',
        posted: 'Posted!',
        contactOwner: 'Contact Owner',
        viewMessages: 'View Messages',
        active: 'Active',
        pending: 'Pending',
        returned: 'Returned',
        lost: 'Lost',
        found: 'Found',
        description: 'Description',
        location: 'Location',
        category: 'Category',
        titlePlaceholder: 'Title (e.g. iPhone 13)',
        descPlaceholder: 'Detailed description...',
        signIn: 'Sign In',
        signUp: 'Sign Up',
        welcomeBack: 'Welcome Back!',
        createAccount: 'Create Account',
        noAccount: 'Don\'t have an account? ',
        alreadyAccount: 'Already have an account? ',
        firstName: 'First Name',
        surname: 'Surname',
        age: 'Age',
        country: 'Country',
        city: 'City',
        phone: 'Phone Number',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        wait: 'Please wait...',
        tagline: 'Lost something? Don\'t worry people got your back',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('fr');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const storedLang = await AsyncStorage.getItem('language');
            if (storedLang) {
                setLanguage(storedLang);
            }
        } catch (error) {
            console.log('Error loading language:', error);
        }
    };

    const switchLanguage = async (lang) => {
        try {
            setLanguage(lang);
            await AsyncStorage.setItem('language', lang);
        } catch (error) {
            console.log('Error saving language:', error);
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
