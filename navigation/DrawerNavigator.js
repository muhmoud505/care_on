import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/customDrewer';
import PasswordScreen from "../screens/auth/signup/passwork";
import Account from '../screens/home/account';
import BottomTabs from './BottomTabs';
import PaymentStack from './PaymentStack';
import ProfileStack from './ProfileStack';
import ServiceStack from './ServiceStack';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import S2 from '../screens/auth/signup/b';
import Signup2 from '../screens/auth/signup/signupBaby';
const Stack=createNativeStackNavigator()
const AuthScreens = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="s2" component={S2} />

      <Stack.Screen name="signupBaby" component={Signup2} />
      <Stack.Screen name="password" options={{ title: t('set_password', { defaultValue: 'كلمة السر' }) }}>
        {(props) => <PasswordScreen {...props} />}
      </Stack.Screen>
    
    </Stack.Navigator>
  );
};

// Import your screens
// import ProfileScreen from '../screens/ProfileScreen';
// import InfoScreen from '../screens/InfoScreen';
// import SearchBloodBankScreen from '../screens/SearchBloodBankScreen';
// import ContactScreen from '../screens/ContactScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      // Use your custom drawer content
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right', // Always open from the right
        drawerType: 'front',
        drawerStyle: {
          width: '90%', // Drawer width
        },
        overlayColor: 'transparent', // Prevent screen dimming
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={BottomTabs}
        options={{ drawerLabel: () => null }} // Hide from drawer menu
      />
      <Drawer.Screen name="ProfileStack" component={ProfileStack} options={{ drawerLabel: 'الملف الشخصي' }} />
      <Drawer.Screen name="PaymentStack" component={PaymentStack} options={{ drawerLabel: 'الفواتير والمدفوعات' }} />
      <Drawer.Screen name="ServiceStack" component={ServiceStack} options={{ drawerLabel: 'البحث عن أقرب خدمة',headerShown:false }} />
      <Drawer.Screen name="accounts" component={Account} options={{ drawerLabel: 'البحث عن أقرب خدمة',headerShown:false }} />
       <Drawer.Screen  name='auth' component={AuthScreens}/>
          {/* <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} /> */}

  
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;