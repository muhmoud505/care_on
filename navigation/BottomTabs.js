import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Images from '../constants2/images';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Tab=createBottomTabNavigator()
const TabIcon = ({ icon, color, name, focused }) => {
  const activeIcon = name === 'Home' ? Images.homeActive : Images.profileActive;
  const inactiveIcon = name === 'Home' ? Images.homeInactive : Images.profileInactive;
  return (
    <View >
      <Image
        source={focused ? activeIcon : inactiveIcon}
        resizeMode='cover'
        style={[styles.icon, { tintColor: focused ? '#014CC4' : 'gray' }]}
      />
    </View>
  );
};
export default function BottomTabs() {
  return (
    <Tab.Navigator
          screenOptions={{
        headerShown: false, // This is correct
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar, // Add custom tab bar style
        tabBarItemStyle: styles.tabItem, // Style for individual tab items
        tabBarShowLabel: false, // Hide labels if you only want icons
      }}
    >
      <Tab.Screen name="home" component={HomeStack}
       
        options={{
         tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                name="Home"
                focused={focused}
              />
            ),
        
        }}
      >
        
      </Tab.Screen>
      <Tab.Screen name="profileTab" component={ProfileStack} 
         options={{
         tabBarIcon: ({ color, focused }) => (
              <TabIcon
                color={color}
                name="Profile"
                focused={focused}
              />
            ),
        
        }}
      />
    </Tab.Navigator>
  );
}


const styles=StyleSheet.create({
  // flex items-center justify-center gap-2,
   tabBar: {
    height: hp(12),
    backgroundColor:'#EBF2FF',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
     shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -hp(0.5), // Negative value to put shadow above the bar
    },
    shadowOpacity: 0.1,
    shadowRadius: wp(2),
    // Shadow properties for Android
    elevation: 10,
    position: 'absolute',
    bottom: 0,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon:{
    gap: wp(0.5),
    justifyContent:'center',
    alignItems:'center',
    width: wp(10),
    height: wp(10),
    top: hp(1.5)
  }
})