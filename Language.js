import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Language = () => {
  const [lang, setLang] = useState('fr');
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:24}}>
      <Text style={{fontSize:24,fontWeight:'bold',marginBottom:20}}>Langue</Text>
      <TouchableOpacity
        style={[lang==='fr'?styles.selected:styles.btn]}
        onPress={()=>setLang('fr')}
      >
        <Text style={lang==='fr'?styles.selectedText:styles.text}>Français</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[lang==='en'?styles.selected:styles.btn]}
        onPress={()=>setLang('en')}
      >
        <Text style={lang==='en'?styles.selectedText:styles.text}>English</Text>
      </TouchableOpacity>
      <Text style={{marginTop:30,color:'#888'}}>Ce choix est local (démo). Pour une vraie app, utiliser i18n-js ou react-intl.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor:'#f1f3f5',
    padding:16,
    borderRadius:10,
    marginVertical:10,
    width:200,
    alignItems:'center',
  },
  selected: {
    backgroundColor:'#3498db',
    padding:16,
    borderRadius:10,
    marginVertical:10,
    width:200,
    alignItems:'center',
  },
  text: { color:'#2c3e50', fontWeight:'bold', fontSize:16 },
  selectedText: { color:'#fff', fontWeight:'bold', fontSize:16 },
});

export default Language;
