import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/authContext';
import { MedicalRecordsProvider } from '../contexts/medicalRecordsContext';
import Code from '../screens/auth/password/Code';
import Reset from '../screens/auth/password/Reset';
import SplashScreen from '../screens/home/splash';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="App" options={{ headerShown: false }}>
                {() => (
                  <MedicalRecordsProvider>
                    <AppStack />
                  </MedicalRecordsProvider>
                )}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
          )}
          <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
            <Stack.Screen name="code" component={Code} />
            <Stack.Screen name="reset" component={Reset} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;