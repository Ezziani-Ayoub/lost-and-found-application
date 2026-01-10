import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notifications = () => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('notifications_enabled').then(val => {
      setEnabled(val === 'true');
    });
  }, []);
  const toggle = async () => {
    const newVal = !enabled;
    setEnabled(newVal);
    await AsyncStorage.setItem('notifications_enabled', newVal ? 'true' : 'false');
    Alert.alert('Notifications', newVal ? 'Notifications activées' : 'Notifications désactivées');
  };
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',padding:24}}>
      <Text style={{fontSize:24,fontWeight:'bold',marginBottom:20}}>Notifications</Text>
      <View style={{flexDirection:'row',alignItems:'center',marginBottom:20}}>
        <Text style={{fontSize:18,marginRight:10}}>Activer les notifications</Text>
        <Switch value={enabled} onValueChange={toggle} />
      </View>
      <Text style={{color:'#888'}}>Ce réglage est local. Pour les vraies notifications push, utiliser expo-notifications.</Text>
    </View>
  );
};

export default Notifications;
