import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import CustomDrawerContent from '../components/customDrewer';
import BottomTabs from './BottomTabs';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { width } = useWindowDimensions();
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: 'front',
        drawerStyle: {
          width: width * 1,
          margin:0,
          padding:0 ,
            borderWidth: 2, // Temporary - remove after debugging
  borderColor: 'green',// Use 80% of the current window width
   // Remove shadow/elevation
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          elevation: 0,
          borderRightWidth: 0, // Remove border if RTL is false
          borderLeftWidth: 0,
        },
        drawerContentContainerStyle: {
          paddingTop: 0,      // Remove default top padding
          paddingBottom: 0,   // Remove default bottom padding
          paddingLeft: 0,     // Remove default left padding
          paddingRight: 0,    // Remove default right padding
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)', // Use a semi-transparent black color to dim the background
        swipeEnabled: true, // Disable swipe gesture to open drawer
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={BottomTabs}
        options={{ drawerLabel: () => null }} // Hide this from the drawer list itself
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;