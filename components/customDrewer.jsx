import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../constants2/images';
import { useAuth } from '../contexts/authContext';
import { Icons } from './Icons';
import LanguageSwitch from './switchlng';

const CustomDrawerContent = (props) => {
  const insets = useSafeAreaInsets();
  const { navigation } = props;
  const { t, i18n } = useTranslation();
  
  // RTL Detection
  const isRTL = i18n.dir() === 'rtl';
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const { width, height } = useWindowDimensions();
  const { user, logout } = useAuth();

  const age = useMemo(() => {
    const nationalId = user?.user?.resource?.national_number;
    if (!nationalId || nationalId.length !== 14) return null;
    try {
      const firstDigit = nationalId.substring(0, 1);
      if (firstDigit !== '2' && firstDigit !== '3') return null;
      const century = firstDigit === '3' ? '20' : '19';
      const year  = parseInt(century + nationalId.substring(1, 3), 10);
      const month = parseInt(nationalId.substring(3, 5), 10) - 1;
      const day   = parseInt(nationalId.substring(5, 7), 10);
      const birthDate = new Date(year, month, day);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
      return calculatedAge;
    } catch (e) {
      return null;
    }
  }, [user]);

  const isChild = age !== null && age < 18;

  if (!user?.user) return null;

  const parentNavigation = navigation.getParent();

  const handleNavigate = (screenName) => {
    navigation.closeDrawer();
    parentNavigation?.navigate(screenName);
  };

  const menuItems = [
    { id: 1, title: t('drawer.profile'),           icon: Icons.Profilec, onPress: () => handleNavigate('ProfileStack') },
    { id: 2, title: t('drawer.billing'),            icon: Icons.Wallet,   onPress: () => handleNavigate('PaymentStack') },
    { id: 3, title: t('drawer.find_service'),       icon: Icons.Gps,      onPress: () => handleNavigate('ServiceStack'), disabled: true },
    { id: 6, title: t('drawer.contact_us'),         icon: Icons.Call,     onPress: () => handleNavigate('ContactUs'), disabled: true },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    profileSection: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    profileHeader: {
      flexDirection: rowDirection,
      alignItems: 'center',
      justifyContent: isChild ? 'center' : 'space-between',
    },
    profileInfo: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 10,
      flexShrink: 1,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    profileName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      textAlign: textAlign,
      writingDirection: isRTL ? 'rtl' : 'ltr',
      flexShrink: 1,
    },
    editButton: {
      backgroundColor: '#014CC4',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      flexShrink: 0,
    },
    editText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    menuContainer: {
      flex: 1,
    },
    menuItem: {
      flexDirection: rowDirection,
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 18,
      gap: 20,
    },
    menuIcon: {
      width: 24,
      height: 24,
      tintColor: '#000',
      // On some icon sets, you might want to flip the icon itself if it's directional
      // transform: [{ scaleX: isRTL ? -1 : 1 }] 
    },
    menuText: {
      fontSize: 16,
      color: '#000',
      fontWeight: '500',
      textAlign: textAlign,
      writingDirection: isRTL ? 'rtl' : 'ltr',
      flex: 1,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      flexDirection: rowDirection,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoutButton: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 15,
    },
    logoutIcon: {
      width: 24,
      height: 24,
      tintColor: '#F44336',
      transform: [{ scaleX: isRTL ? -1 : 1 }], // Flip logout icon for RTL
    },
    logoutText: {
      fontSize: 16,
      color: '#F44336',
      fontWeight: '500',
      textAlign: textAlign,
    },
    menuItemDisabled: {
      opacity: 0.5,
    },
    menuTextDisabled: {
      color: '#9AA0A6',
    },
    menuIconDisabled: {
      tintColor: '#9AA0A6',
    },
  });

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          {/* User Info */}
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={() => handleNavigate('ProfileStack')}>
              {user?.user?.avatar ? (
                <Image source={{ uri: user.user.avatar }} style={styles.profileImage} />
              ) : (
                <Icons.Profilea width={40} height={40} imageUrl={user.user.avatar} />
              )}
            </TouchableOpacity>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.user?.name || t('drawer.user_name_placeholder')}
            </Text>
          </View>

          {/* Linked Accounts Button */}
          {!isChild && (
            <TouchableOpacity style={styles.editButton} onPress={() => handleNavigate('accounts')}>
              <Text style={styles.editText} numberOfLines={1}>
                {t('drawer.linked_accounts')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              item.disabled && styles.menuItemDisabled,
            ]}
            onPress={item.disabled ? undefined : item.onPress}
            activeOpacity={item.disabled ? 1 : 0.7}
            disabled={!!item.disabled}
          >
            <item.icon style={[styles.menuIcon, item.disabled && styles.menuIconDisabled]} />
            <Text style={[styles.menuText, item.disabled && styles.menuTextDisabled]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={logout}
          style={styles.logoutButton}
        >
          <Image source={images.logout} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
        <LanguageSwitch />
      </View>
    </View>
  );
};

export default CustomDrawerContent;