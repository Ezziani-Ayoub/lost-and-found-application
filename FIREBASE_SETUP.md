# Configuration Firebase pour Lost & Found Application

## Collections Firestore

Votre base de données contient maintenant 4 collections:

### 1. Collection `items`
Stocke tous les objets perdus et trouvés
```
items (collection)
  - id (document ID)
    - type: "lost" | "found"
    - title: string
    - description: string
    - photo: string (URL)
    - date: string
    - location: string
    - coordinates: { latitude: number, longitude: number }
    - category: string
    - status: "actif" | "résolu"
    - userId: string
    - createdAt: string
```

### 2. Collection `users`
Stocke les profils utilisateurs
```
users (collection)
  - uid (document ID = Firebase Auth UID)
    - uid: string
    - email: string
    - displayName: string
    - photoURL: string (URL)
    - createdAt: string
    - lastLoginAt: string
    - isOnline: boolean
    - lastSeenAt: string
    - updatedAt: string
```

### 3. Collection `chats`
Stocke les conversations entre utilisateurs
```
chats (collection)
  - id (document ID)
    - participants: array[string] (2 UIDs)
    - itemId: string (référence à l'item concerné)
    - createdAt: string
    - lastMessageAt: string
    - lastMessage: string
    - lastMessageBy: string
    - createdBy: string
    - unreadCount: object
```

### 4. Collection `messages`
Stocke les messages des chats
```
messages (collection)
  - id (document ID)
    - chatId: string (référence au chat)
    - senderId: string (UID de l'expéditeur)
    - text: string
    - createdAt: string
    - read: boolean
    - readAt: string
```

## Étapes de configuration

### 1. Créer un projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les étapes pour créer votre projet

### 2. Activer les services
Dans votre projet Firebase, activez:
- **Authentication** (Email/Mot de passe)
- **Firestore Database**

### 3. Obtenir les configurations
1. Dans votre projet Firebase, allez dans "Paramètres du projet"
2. Cliquez sur "Vos applications"
3. Ajoutez une application Web
4. Copiez les configurations Firebase

### 4. Mettre à jour firebaseConfig.js
Remplacez les configurations dans `firebaseConfig.js` avec vos vraies configurations:

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 5. Configuration Firestore
1. Allez dans "Firestore Database"
2. Créez une nouvelle base de données
3. Choisissez "Commencer en mode test" (pour le développement)

### 6. Configuration Authentication
1. Allez dans "Authentication"
2. Dans "Méthodes de connexion", activez "Email/Mot de passe"

### 7. Règles de sécurité Firestore (pour le développement)
Dans Firestore, allez dans "Règles" et ajoutez:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users peuvent lire/écrire leur propre profil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Items sont publics en lecture, écriture pour les authentifiés
    match /items/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Chats uniquement pour les participants
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages uniquement pour les participants du chat
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants;
    }
  }
}
```

## Fonctionnalités implémentées

- ✅ Authentication Firebase (Email/Mot de passe)
- ✅ Firestore Database pour les items
- ✅ Profils utilisateurs automatiques
- ✅ Système de chat en temps réel
- ✅ Temps réel avec onSnapshot
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Gestion des erreurs
- ✅ États de connexion utilisateurs

## Contextes React disponibles

- `AuthProvider` - Gestion de l'authentification
- `UsersProvider` - Gestion des profils utilisateurs
- `ChatsProvider` - Gestion des chats et messages
- `ItemsProvider` - Gestion des items (objets perdus/trouvés)

## Prochaines étapes

1. Configurer Firebase Storage pour les images
2. Ajouter des règles de sécurité plus strictes
3. Implémenter la validation des données
4. Ajouter des indexes pour les requêtes complexes
5. Notifications push pour les nouveaux messages
