import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/authContext';
import { MedicalRecordsProvider } from '../contexts/medicalRecordsContext';
import SplashScreen from '../screens/home/splash';
import WelcomeScreen from '../screens/home/welcome';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const RootStack = createNativeStackNavigator();

/**
 * This is the root navigator. It decides which stack to show
 * based on the authentication state from your AuthContext.
 */
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <RootStack.Screen name="App">
              {() => <MedicalRecordsProvider><AppStack /></MedicalRecordsProvider>}
            </RootStack.Screen>
          ) : (
            <>
              <RootStack.Screen name="Auth" component={AuthStack} />
              {/* WelcomeScreen is now a sibling to the Auth stack */}
              <RootStack.Screen name="welcome" component={WelcomeScreen} />
            </>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;