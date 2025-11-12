import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Account = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  // Get user, children, and the fetch function from the Auth context
  const { user, children, fetchChildren, logout } = useAuth();

  // Use useFocusEffect to refetch children every time the screen is viewed
  useFocusEffect(
    React.useCallback(() => {
      console.log('hiiii');
      
      if (user) {
        console.log('hi2');

        console.log(user?.data?.token?.value);
        
        
        fetchChildren(user);
      }
    }, [user]) // Re-run if the user token changes
  );

  const handleSwitchAccount = (childAccount) => {
    // TODO: Implement the full account switching logic in authContext
    // For now, we can log the action.
    console.log('Switching to account:', childAccount.name);
    // Example of what it might look like:
    // switchAccount({ type: 'child', id: childAccount.id });
  };

  const handleAddAccount = () => {
    // Navigate to the signup flow, passing a flag to indicate a parent is adding a child.
    navigation.navigate('auth', {
      screen: 's2',
      params: { userType: 'child', isParentAddingChild: true },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('account.linked_accounts')} onLogout={logout} showLogout />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Primary Profile Section */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Image source={Images.profile} style={styles.avatarImage} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.user?.name || t('account.primary_user')}</Text>
              <Text style={styles.phoneNumber}>{user.user?.phone_number || t('account.no_phone_number')}</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('account.current_account')}</Text>
            </View>
          </View>
        )}

        {/* Child Accounts Section */}
        {children && children.map((child) => (
          <View key={child.id} style={styles.profileCard}>
            <View style={styles.avatar}>
              <Image source={Images.profile} style={styles.avatarImage} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{child.name}</Text>
              <Text style={styles.phoneNumber}>{child.phone_number || ''}</Text>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={() => handleSwitchAccount(child)}>
              <Text style={styles.loginButtonText}>{t('account.impersonate_user')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* This view ensures the button stays at the bottom */}
      <View style={styles.bottomContainer}>
        {/* Add Account Button */}
        <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount} activeOpacity={0.8}>
          <Text style={styles.addAccountText}>{t('account.add_another_account')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Account

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: wp(4),
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    flexDirection: 'row',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: hp(2), // Space between cards
  },
  avatar: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(10),
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    marginBottom: hp(2),
    overflow: 'hidden', // To keep the image within the circle
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    
  },
  userInfo: {
    flex: 1, // Takes up available space
    alignItems: 'flex-start', // Align text to the start (right in RTL)
    marginHorizontal: wp(4),
  },
  phoneNumber: {
    fontSize: wp(3.5),
    color: '#666',
  },
  userName: {
    fontSize: wp(4),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  loginButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: '#E0E0E0',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    justifyContent: 'center',
  },
  activeBadgeText: {
    color: '#333',
    fontSize: wp(3),
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
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