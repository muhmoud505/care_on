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

const CustomDrawerContent = (props) => {
  const { navigation } = props;
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  // Drawer width is 80% of the screen width, as defined in DrawerNavigator.js
  const drawerWidth = width * 0.8;
  const drawerWP = (percentage) => (percentage / 100) * drawerWidth;
  const screenHP = (percentage) => (percentage / 100) * height;

  const { user, logout } = useAuth();

  // Menu items matching your screenshot
  const menuItems = [
    {
      id: 1,
      title: t('drawer.profile', { defaultValue: 'الملف الشخصي' }),
      icon: images.user,
      onPress: () => navigation.navigate('ProfileStack'),
    },
    {
      id: 2,
      title: t('drawer.billing', { defaultValue: 'الفواتير والمدفوعات' }),
      icon: images.wallet,
      onPress: () => navigation.navigate('PaymentStack'),
    },
    {
      id: 3,
      title: t('drawer.find_service', { defaultValue: 'البحث عن أقرب خدمة' }),
      icon: images.search,
      onPress: () => navigation.navigate('ServiceStack'),
    },
    {
      id: 4,
      title: t('drawer.contact_us', { defaultValue: 'تواصل معنا' }),
      icon: images.call,
      onPress: () => console.log('Navigate to Contact Us'), // Placeholder for a screen that doesn't exist yet
    },
  ];
  const styles = getStyles(drawerWP, screenHP);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('accounts')}
          >
            <Text style={styles.editText}>{t('drawer.linked_accounts', { defaultValue: 'الحسابات المرتبطة' })}</Text>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileStack')}>
              <Image source={images.profile} style={styles.avatar} />
            </TouchableOpacity>
          </View>
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
            <Image source={item.icon} style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Image source={images.logout} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>
            {t('auth.logout', { defaultValue: 'تسجيل الخروج' })}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (drawerWP, screenHP) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    paddingHorizontal: drawerWP(5),
    paddingRight: drawerWP(20),
    paddingVertical: screenHP(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#291f1fff',
    direction:'ltr'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: drawerWP(7),
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: drawerWP(2),
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
    textAlign: 'right',
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
    flex: 1,
    paddingTop: screenHP(2),
  },
  menuItem: {
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    paddingHorizontal: drawerWP(7),
    paddingVertical: screenHP(2),
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: screenHP(1),
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
    textAlign: 'right',
  },
})

export default CustomDrawerContent;