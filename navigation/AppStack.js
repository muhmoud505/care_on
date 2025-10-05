import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Add from '../screens/home/add';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* The main screen is now the DrawerNavigator, which contains the BottomTabs */}
      <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
      {/* Screens like 'add' can be placed here to appear over the drawer/tabs */}
      <Stack.Screen name="add" component={Add} />
    </Stack.Navigator>
  );
};

export default AppStack;