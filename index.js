// In project root/index.js
import { AppRegistry } from 'react-native';
import App from './app';
import './i18n/i18n';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('Global error:', error, error.stack);
});

// The 'main' name comes from the native side (e.g., MainActivity.java)
AppRegistry.registerComponent('main', () => App);