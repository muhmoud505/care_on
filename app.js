import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './contexts/authContext';
import './i18n/i18n';
import RootNavigator from './navigation/RootNavigator';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded]=Font.useFonts({
    // Match the font family name and filename from CustomIcon.js
    'IcoMoon':require('./assets2/fonts/icomoon.ttf')
  })
  const OnLayoutRootView=useCallback(async()=>{
    if(fontsLoaded){
      await SplashScreen.hideAsync();
    }}, [fontsLoaded])
    if(!fontsLoaded){
      return null;
    }
  return (
    <AuthProvider>
      <View style={{ flex: 1 }} onLayout={OnLayoutRootView}>
        <RootNavigator />
      </View>
      <Toast />
    </AuthProvider>
  );
}
