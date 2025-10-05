import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/authContext';
import SplashScreen from '../screens/home/splash';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

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
        {isAuthenticated ?  <AppStack />:<AuthStack /> }
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootNavigator;