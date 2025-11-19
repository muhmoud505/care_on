import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Account from '../screens/home/account';
import PaymentStack from './PaymentStack';
import ProfileStack from './ProfileStack';
import ServiceStack from './ServiceStack';

const Stack = createNativeStackNavigator();

const DrawerScreens = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileStack" component={ProfileStack} />
    <Stack.Screen name="PaymentStack" component={PaymentStack} />
    <Stack.Screen name="ServiceStack" component={ServiceStack} />
    <Stack.Screen name="accounts" component={Account} />
  </Stack.Navigator>
);

export default DrawerScreens;