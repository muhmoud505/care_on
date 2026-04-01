import { useEffect, useState } from 'react';
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
import useRTL from '../hooks/useRTL';
import { Icons } from './Icons';
import LanguageSwitch from './switchlng';

const CustomDrawerContent = (props) => {
  const insets = useSafeAreaInsets();
  const { navigation } = props;
  const { t, i18n } = useTranslation();
  const { isRTL, rowDirection, textAlign } = useRTL();
  const { width, height } = useWindowDimensions();
  const { user, logout, fetchCurrentUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user data on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Fallback to cached user if fetch fails
        setCurrentUser(user?.user);
      }
    };
    
    getCurrentUser();
  }, [fetchCurrentUser, user?.user]);
  console.log("currentUser", currentUser);

  // Use age directly from user resource (API already calculates it)
  const age = currentUser?.resource?.age;
  const isChild = age !== null && age < 18;

  if (!currentUser) return null;

  const parentNavigation = navigation.getParent();

  const handleNavigate = (screenName, params = {}) => {
    navigation.closeDrawer();
    parentNavigation?.navigate(screenName, params);
  };

  const menuItems = [
    { 
      id: 1, 
      title: t('drawer.profile'), 
      onPress: () => handleNavigate('ProfileStack') ,
      icon: Icons.Profilec
    },
    { 
      id: 2, 
      title: t('drawer.privacy_policy'), 
      onPress: () => handleNavigate('ServiceStack', { screen: 'PrivacyPolicy' }) ,
      icon: Icons.PrivacyPolicy
    },
    { 
      id: 3, 
      title: t('drawer.terms_of_service'), 
      onPress: () => handleNavigate('ServiceStack', { screen: 'TermsOfService' }) ,
      icon: Icons.TermsOfService
    },
    { 
      id: 6, 
      title: t('drawer.contact_us'), 
      onPress: () => handleNavigate('ServiceStack') ,
      icon: Icons.Call
    },
   
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
      paddingVertical: 20,
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
      gap: 12,
      flexShrink: 1,
    },
    profileImage: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
      textAlign: textAlign,
      writingDirection: isRTL ? 'rtl' : 'ltr',
      flexShrink: 1,
    },
    editButton: {
      backgroundColor: '#014CC4',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      flexShrink: 0,
    },
    editText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    menuContainer: {
      flex: 1,
    },
    menuItem: {
      flexDirection: rowDirection,
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 18,
      gap: 20,
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
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      flexDirection: rowDirection,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoutButton: {
      flexDirection: rowDirection,
      alignItems: 'center',
      gap: 12,
    },
    logoutIcon: {
      width: 24,
      height: 24,
      tintColor: '#F44336',
      transform: [{ scaleX: isRTL ? -1 : 1 }], // Flip arrow for RTL
    },
    logoutText: {
      fontSize: 16,
      color: '#F44336',
      fontWeight: '500',
      textAlign: textAlign,
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
  });

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={[styles.profileSection]}>
        <View style={[styles.profileHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.profileInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity onPress={() => handleNavigate('ProfileStack')}>
              {currentUser?.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={styles.profileImage}
                />
              ) : (
                <Icons.Profilec width={24} height={24} />
              )}
            </TouchableOpacity>

            <Text style={styles.profileName} numberOfLines={1}>
              {currentUser?.name || t('drawer.user_name_placeholder')}
            </Text>
          </View>

          {!isChild && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleNavigate('accounts')}
            >
              <Text style={styles.editText}>
                {t('drawer.linked_accounts')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={[styles.menuContainer, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            {item.icon && <item.icon width={24} height={24} />}
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Image source={images.logout} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <LanguageSwitch />
      </View>
    </View>
  );
};

export default CustomDrawerContent;