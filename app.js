import 'react-native-gesture-handler';
import { AuthProvider } from './contexts/authContext';
import './i18n/i18n';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
