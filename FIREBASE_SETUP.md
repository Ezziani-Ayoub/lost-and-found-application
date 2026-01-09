# Configuration Firebase pour Lost & Found Application

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
4. Créez la collection `items` avec la structure suivante:

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

### 6. Configuration Authentication
1. Allez dans "Authentication"
2. Dans "Méthodes de connexion", activez "Email/Mot de passe"

### 7. Règles de sécurité Firestore (pour le développement)
Dans Firestore, allez dans "Règles" et ajoutez:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Fonctionnalités implémentées

- ✅ Authentication Firebase (Email/Mot de passe)
- ✅ Firestore Database pour les items
- ✅ Temps réel avec onSnapshot
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Gestion des erreurs

## Prochaines étapes

1. Configurer Firebase Storage pour les images
2. Ajouter des règles de sécurité plus strictes
3. Implémenter la validation des données
4. Ajouter des indexes pour les requêtes complexes
