import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../constants2/images';
import { useAuth } from '../contexts/authContext';
import LanguageSwitch from './switchlng';

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { width, height } = useWindowDimensions();

  // Drawer width is 80% of the screen width, as defined in DrawerNavigator.js
  const drawerWidth = width * 0.8; // This should match the width in DrawerNavigator.js
  const drawerWP = (percentage) => (percentage / 100) * drawerWidth;
  const screenHP = (percentage) => (percentage / 100) * height;

  const { user, logout } = useAuth();
console.log(user);

  // Menu items matching your screenshot
  const menuItems = [
    {
      id: 1, 
      title: t('drawer.profile'),
      icon: images.user,
      onPress: () => navigation.navigate('ProfileStack'),
    },
    {
      id: 2, 
      title: t('drawer.billing'),
      icon: images.wallet,
      onPress: () => navigation.navigate('PaymentStack'),
    },
    {
      id: 3, 
      title: t('drawer.find_service'),
      icon: images.search,
      onPress: () => navigation.navigate('ServiceStack'),
    },
    {
      id: 4, 
      title: t('drawer.contact_us'),
      icon: images.call,
      onPress: () => console.log('Navigate to Contact Us'), // Placeholder for a screen that doesn't exist yet
    },
  ];
  const styles = getStyles(drawerWP, screenHP, isRTL);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileStack')}>
              <Image source={images.profile} style={styles.avatar} />
            </TouchableOpacity>
            <Text style={styles.profileName} numberOfLines={1}>{user?.user?.name || 'User Name'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('accounts')}
          >
            <Text style={styles.editText}>{t('drawer.linked_accounts', { defaultValue: 'الحسابات المرتبطة' })}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <Image source={item.icon} style={styles.menuIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}> 
            {t('auth.logout', { defaultValue: 'تسجيل الخروج' })}
          </Text>
          <Image source={images.logout} style={styles.logoutIcon} />
        </TouchableOpacity>
        <LanguageSwitch />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (drawerWP, screenHP, isRTL) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    paddingHorizontal: drawerWP(5),
    paddingVertical: screenHP(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#291f1fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: drawerWP(7),
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: drawerWP(2),
    flex: 1, // Allow this view to shrink and grow
  },
  avatar: {
    width: drawerWP(15),
    height: drawerWP(15),
    borderRadius: drawerWP(7.5),
  },
  profileName: {
    fontSize: drawerWP(5),
    fontWeight: 'bold',
    color: '#000',
    textAlign: isRTL ? 'right' : 'left',
    flex: 1, // Allow text to wrap and not push other elements
  },
  editButton: {
    backgroundColor: '#014CC4',
    paddingHorizontal: drawerWP(2),
    paddingVertical: screenHP(0.8),
    borderRadius: drawerWP(3),
  },
  editText: {
    color: '#fff',
    fontSize: drawerWP(4.5),
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1, // This makes the ScrollView expand to fill available space
  },
  menuItem: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: drawerWP(7),
    paddingVertical: screenHP(1.8),
    gap: drawerWP(5),
  },
  menuIcon: {
    width: drawerWP(6),
    height: drawerWP(6),
    tintColor: '#000',
  },
  menuText: {
    fontSize: drawerWP(4.8),
    color: '#000',
    fontWeight: '500',
    textAlign: isRTL ? 'right' : 'left',
    flex: 1,
  },
  footer: {
    paddingHorizontal: drawerWP(5),
    paddingBottom: screenHP(1),
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
    gap: drawerWP(5),
  },
  logoutIcon: {
    width: drawerWP(6),
    height: drawerWP(6),
    tintColor: '#F44336',
  },
  logoutText: {
    fontSize: drawerWP(4.8),
    color: '#F44336',
    fontWeight: '500',
    textAlign: isRTL ? 'right' : 'left',
  },
})

export default CustomDrawerContent;