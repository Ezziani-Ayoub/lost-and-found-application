import React from 'react';
import { ScrollView, Text } from 'react-native';

const FAQ = () => (
  <ScrollView style={{flex:1,padding:24}}>
    <Text style={{fontSize:24,fontWeight:'bold',marginBottom:20}}>FAQ</Text>
    <Text style={{fontWeight:'bold'}}>Comment publier un objet perdu ou trouvé ?</Text>
    <Text style={{marginBottom:16}}>Cliquez sur le bouton + sur la page d'accueil, remplissez le formulaire et publiez.</Text>
    <Text style={{fontWeight:'bold'}}>Comment contacter le propriétaire d'un objet ?</Text>
    <Text style={{marginBottom:16}}>Ouvrez l'annonce et cliquez sur "Contacter le propriétaire".</Text>
    <Text style={{fontWeight:'bold'}}>Comment modifier ou supprimer mon annonce ?</Text>
    <Text style={{marginBottom:16}}>Allez sur votre annonce, puis cliquez sur "Modifier" ou "Supprimer".</Text>
    <Text style={{fontWeight:'bold'}}>Comment changer mes informations personnelles ?</Text>
    <Text style={{marginBottom:16}}>Dans Paramètres > Mon Compte, modifiez vos informations puis enregistrez.</Text>
    <Text style={{fontWeight:'bold'}}>Comment supprimer mon compte ?</Text>
    <Text style={{marginBottom:16}}>Dans Paramètres, cliquez sur "Supprimer le compte" et confirmez.</Text>
    <Text style={{fontWeight:'bold'}}>Comment activer/désactiver les notifications ?</Text>
    <Text style={{marginBottom:16}}>Dans Paramètres > Notifications, activez ou désactivez selon votre préférence.</Text>
    <Text style={{fontWeight:'bold'}}>Mes données sont-elles sécurisées ?</Text>
    <Text style={{marginBottom:16}}>Oui, vos données sont stockées de façon sécurisée sur Firebase.</Text>
  </ScrollView>
);

export default FAQ;
