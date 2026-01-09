import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ItemsProvider } from './ItemsContext';
import { UsersProvider } from './UsersContext';
import { ChatsProvider } from './ChatsContext';
import { AuthProvider, useAuth } from './AuthContext';
import HomeScreen from './HomeScreen';
import PostItem from './PostItem';
import ItemDetails from './ItemDetails';
import Login from './Login';
import ChatScreen from './ChatScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PostItem" component={PostItem} options={{ presentation: 'modal', headerShown: true, title: 'Publier', headerBackTitle: 'Annuler' }} />
            <Stack.Screen name="ItemDetails" component={ItemDetails} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true, title: 'Discussion' }} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ChatsProvider>
          <ItemsProvider>
            <AppNavigator />
          </ItemsProvider>
        </ChatsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
