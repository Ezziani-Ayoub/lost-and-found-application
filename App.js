import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ItemsProvider } from './ItemsContext';
import { AuthProvider, useAuth } from './AuthContext';
import HomeScreen from './HomeScreen';
import PostItem from './PostItem';
import ItemDetails from './ItemDetails';
import Login from './Login';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Lost & Found' }} 
        />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
        <Stack.Screen name="PostItem" component={PostItem} options={{ title: 'Post Lost Item' }} />
        <Stack.Screen name="ItemDetails" component={ItemDetails} options={{ title: 'Item Details' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <AppNavigator />
      </ItemsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
