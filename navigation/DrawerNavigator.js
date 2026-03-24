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

  // Determine if it's a tablet
  const isTablet = width > 768;
  return (
    <Drawer.Navigator
       drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: isRTL ? 'right' : 'left',
        drawerType: isTablet ? 'slide' : 'front', // Slide works better on tablets
        drawerStyle: {
          // TABLET FIX: Don't use width * 1. Use a fixed max width.
          width: isTablet ? 450 : width * 0.85, 
          backgroundColor: '#fff',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
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