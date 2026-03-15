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
import { Icons } from './Icons';
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
    { id: 4, title: t('drawer.doctors_used_codes'), icon: Icons.Codea,    onPress: () => handleNavigate('DoctorsUsedCodes') },
    { id: 5, title: t('drawer.your_created_codes'), icon: Icons.Codea,    onPress: () => handleNavigate('YourCreatedCodes') },
    { id: 6, title: t('drawer.contact_us'),         icon: Icons.Call,     onPress: () => handleNavigate('ContactUs'), disabled: true },
  ];

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
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
      // ✅ flex: 1 removed — let it size to content so button has room
      flexShrink: 1,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
      textAlign: isRTL ? 'right' : 'left',
      // ✅ shrink name text if needed so button doesn't overflow
      flexShrink: 1,
    },
    // ✅ FIX: removed fixed paddingHorizontal, use auto width + minWidth
    editButton: {
      backgroundColor: '#014CC4',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      // ✅ never shrink — the button always shows fully
      flexShrink: 0,
      // ✅ allow text to wrap only if truly necessary
      alignItems: 'center',
      justifyContent: 'center',
    },
    editText: {
      color: '#fff',
      // ✅ slightly smaller font so "Linked Accounts" fits in one line
      fontSize: 12,
      fontWeight: '600',
      // ✅ prevent text from wrapping inside the button
      numberOfLines: 1,
      flexWrap: 'nowrap',
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
        <View style={[styles.profileHeader, { flexDirection: isRTL ? 'row-reverse' : 'row', columnGap: 12 }]}>

          {/* User Info */}
          <View style={[styles.profileInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity onPress={() => handleNavigate('ProfileStack')}>
              {user?.user?.avatar ? (
                <Image source={{ uri: user.user.avatar }} style={styles.profileImage} />
              ) : (
                <Icons.Profilea width={40} height={40} imageUrl={user.user.avatar} />
              )}
            </TouchableOpacity>
            {/* ✅ numberOfLines={1} prevents name from pushing button off screen */}
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.user?.name || t('drawer.user_name_placeholder')}
            </Text>
          </View>

          {/* Linked Accounts Button — only for parents */}
          {!isChild && (
            <TouchableOpacity style={styles.editButton} onPress={() => handleNavigate('accounts')}>
              {/* ✅ numberOfLines={1} keeps button single-line */}
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
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
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
      <View style={[styles.footer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={logout}
          style={[styles.logoutButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
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
