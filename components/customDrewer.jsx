import { useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../constants2/images';
import { useAuth } from '../contexts/authContext';
import LanguageSwitch from './switchlng';

const CustomDrawerContent = (props) => {
  const insets = useSafeAreaInsets();
  const { navigation } = props;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { width, height } = useWindowDimensions();
  const { user, logout } = useAuth();

  const age = useMemo(() => {
    const nationalId = user?.user?.resource?.national_number;
    if (!nationalId || nationalId.length !== 14) {
      return null; // Cannot determine age
    }
    try {
      const century = nationalId.substring(0, 1) === '2' ? '19' : '20';
      const year = parseInt(century + nationalId.substring(1, 3), 10);
      const month = parseInt(nationalId.substring(3, 5), 10) - 1; // Month is 0-indexed
      const day = parseInt(nationalId.substring(5, 7), 10);

      const birthDate = new Date(year, month, day);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      return calculatedAge;
    } catch (e) {
      return null;
    }
  }, [user]);
  const isChild = age !== null && age < 18;

  // Get the parent navigator (AppStack)
  const parentNavigation = navigation.getParent();

  const handleNavigate = (screenName) => {
    // Close the drawer
    navigation.closeDrawer();
    // Navigate using the parent Stack navigator
    parentNavigation?.navigate(screenName);
  };

  // Menu items
  const menuItems = [
    {
      id: 1, 
      title: t('drawer.profile'),
      icon: images.user,
      onPress: () => handleNavigate('ProfileStack'),
    },
    { 
      id: 2, 
      title: t('drawer.billing'),
      icon: images.wallet,
      onPress: () => handleNavigate('PaymentStack'),
    },
    {
      id: 3, 
      title: t('drawer.find_service'),
      icon: images.gps,
      onPress: () => handleNavigate('FindService'),
    },
    {
      id: 4, 
      title: t('drawer.doctors_used_codes'),
      icon: images.scan,
      onPress: () => handleNavigate('DoctorsUsedCodes'),
    },
    {
      id: 5, 
      title: t('drawer.your_created_codes'),
      icon: images.createCode,
      onPress: () => handleNavigate('YourCreatedCodes'),
    },
    {
      id: 6, 
      title: t('drawer.contact_us'),
      icon: images.call,
      onPress: () => handleNavigate('ContactUs'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      width:'100%',
      height:'100%',
      backgroundColor: '#fff',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    profileSection: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#291f1fff',
    },
    profileHeader: {
      alignItems: 'center',
      justifyContent: isChild ? 'center' : 'space-between',
    },
    profileInfo: {
      alignItems: 'center',
      gap: 10,
      flex: 1,
      // justifyContent is now on profileHeader

    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
      textAlign: isRTL ? 'right' : 'left',
      flex: 1,
    },
    editButton: {
      backgroundColor: '#014CC4',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
    },
    editText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    menuContainer: {
      flex: 1,
    },
    menuItem: {
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 18,
      gap: 20,
    },
    menuIcon: {
      width: 24,
      height: 24,
      tintColor: '#000',
    },
    menuText: {
      fontSize: 16,
      color: '#000',
      fontWeight: '500',
      textAlign: isRTL ? 'right' : 'left',
      flex: 1,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoutButton: {
      gap: 15,
    },
    logoutIcon: {
      width: 24,
      height: 24,
      tintColor: '#F44336',
    },
    logoutText: {
      fontSize: 16,
      color: '#F44336',
      fontWeight: '500',
      textAlign: isRTL ? 'right' : 'left',
    },
  });

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={[styles.profileHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', columnGap: 15 }]}>
          {/* User Info: Avatar and Name */}
          <View style={[styles.profileInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={() => handleNavigate('ProfileStack')}>
              <Image
                source={user?.user?.avatar ? { uri: user.user.avatar } : images.profile}
                style={styles.avatar}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.user?.name || t('drawer.user_name_placeholder')}
            </Text>
          </View>

          {/* Linked Accounts Button (only for parents) */}
          {!isChild && (
            <TouchableOpacity style={styles.editButton} onPress={() => handleNavigate('accounts')}>
              <Text style={styles.editText}>{t('drawer.linked_accounts', { defaultValue: 'الحسابات المرتبطة' })}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logout Button */}
      <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={logout} style={[styles.logoutButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Image source={images.logout} style={styles.logoutIcon} />
          <Text style={styles.logoutText}> 
            {t('auth.logout', { defaultValue: 'تسجيل الخروج' })}
          </Text>
        </TouchableOpacity>
        <LanguageSwitch />
      </View>
    </View>
  );
};

export default CustomDrawerContent;