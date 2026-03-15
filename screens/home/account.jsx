import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Account = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const {
    user,
    primaryUser,
    isImpersonating,
    children,
    fetchChildren,
    switchAccount,
  } = useAuth();

  // tracks which account button is in loading state
  const [switchingId, setSwitchingId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      if (primaryUser?.token?.value && primaryUser?.user?.id) {
        fetchChildren(primaryUser.token.value, primaryUser.user.id);
      }
    }, [primaryUser?.token?.value, primaryUser?.user?.id])
  );

 // ✅ After — await the full async process, then navigate
const handleSwitchAccount = async (account) => {
  setSwitchingId(account?.id ?? 'parent');  // shows loading spinner
  try {
    await switchAccount(account);           // wait for /me call + setUser() to complete
    navigation.reset({                      // take user to home
      index: 0,
      routes: [{ name: 'Drawer' }],
    });
  } finally {
    setSwitchingId(null);
  }
};

  const handleAddAccount = () => {
    navigation.navigate('ProfileStack', {
      screen: 'Auth',
      params: {
        screen: 's2',
        params: { userType: 'child', isParentAddingChild: true },
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('account.linked_accounts')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Primary / Parent account ── */}
        {primaryUser && (
          <View style={[styles.profileCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.avatarContainer}>
              <Image
                source={primaryUser?.user?.avatar ? { uri: primaryUser.user.avatar } : Images.profile}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.userInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.userName} numberOfLines={1}>
                {primaryUser.user?.name || t('account.primary_user')}
              </Text>
              <Text style={styles.phoneNumber} numberOfLines={1}>
                {primaryUser.user?.phone_number || t('account.no_phone_number')}
              </Text>
            </View>

            {isImpersonating ? (
              <TouchableOpacity
                style={[styles.actionButton, switchingId === 'parent' && styles.buttonLoading]}
                onPress={() => handleSwitchAccount(null)}
                disabled={switchingId !== null}
              >
                {switchingId === 'parent'
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.actionButtonText} numberOfLines={1}>{t('account.switch_to_parent')}</Text>
                }
              </TouchableOpacity>
            ) : (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText} numberOfLines={1}>
                  {t('account.current_account')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Child accounts ── */}
        {children &&
          children
            .filter((child) => child.id !== user?.user?.id)
            .map((child) => (
              <View
                key={child.id}
                style={[styles.profileCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={child?.avatar ? { uri: child.avatar } : Images.profile}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={[styles.userInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={styles.userName} numberOfLines={1}>{child.name}</Text>
                  <Text style={styles.phoneNumber} numberOfLines={1}>{child.phone_number || ''}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, switchingId === child.id && styles.buttonLoading]}
                  onPress={() => handleSwitchAccount(child)}
                  disabled={switchingId !== null}
                >
                  {switchingId === child.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.actionButtonText} numberOfLines={1}>{t('account.impersonate_user')}</Text>
                  }
                </TouchableOpacity>
              </View>
            ))}

      </ScrollView>

      {/* ── Add account button — only when not impersonating ── */}
      {!isImpersonating && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.addAccountButton}
            onPress={handleAddAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.addAccountText}>{t('account.add_another_account')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: wp(4),
    paddingBottom: hp(2),
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: hp(2),
  },
  avatarContainer: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(6.5),
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    marginHorizontal: wp(3),
  },
  userName: {
    fontSize: wp(4),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  phoneNumber: {
    fontSize: wp(3.5),
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    maxWidth: wp(35),
    minWidth: wp(20),
    minHeight: hp(4),
  },
  buttonLoading: {
    backgroundColor: '#90CAF9',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
    textAlign: 'center',
  },
  activeBadge: {
    backgroundColor: '#E0E0E0',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    justifyContent: 'center',
    flexShrink: 0,
    maxWidth: wp(35),
  },
  activeBadgeText: {
    color: '#333',
    fontSize: wp(3),
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: wp(4),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#FFFFFF',
  },
  addAccountButton: {
    backgroundColor: '#81C784',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  addAccountText: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '600',
  },
});
