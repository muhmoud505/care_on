import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';
import CustomDrawerContent from '../components/customDrewer';
import Account from '../screens/home/account';
import BottomTabs from './BottomTabs';
import PaymentStack from './PaymentStack';
import ProfileStack from './ProfileStack';
import ServiceStack from './ServiceStack';

// Import your screens
// import ProfileScreen from '../screens/ProfileScreen';
// import InfoScreen from '../screens/InfoScreen';
// import SearchBloodBankScreen from '../screens/SearchBloodBankScreen';
// import ContactScreen from '../screens/ContactScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { width } = Dimensions.get('window');
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  return (
    <Drawer.Navigator
      // Use your custom drawer content
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: 'front',
        drawerStyle: {
          width: '80%', // Drawer width
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)', // Use a semi-transparent black color to dim the background
        swipeEnabled: false, // Disable swipe gesture to open drawer
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
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;