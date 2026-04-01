// signin.jsx - Fixed RTL Version

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import FormField from '../../components/FormInput';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../contexts/authContext';
import useForm from '../../hooks/useForm';
import { hp, wp } from '../../utils/responsive';
import {
  showAuthError,
  showError,
  showNetworkError,
  showSuccess,
  showValidationError,
} from '../../utils/toastService';

const SignIn = () => {
  const navigation = useNavigation();
  const { login, isAuthLoading } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    email: '',
    password: '',
  });
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const formIsValid = checkFormValidity();

  const handleSignIn = async () => {
    if (!formIsValid) {
      showValidationError('form', 'Please fill in all required fields');
      return;
    }
    
    try {
      await login({ email: form.email, password: form.password });
      showSuccess(
        t('auth.login_success'),
        t('auth.welcome_back'),
        { duration: 3000 }
      );
      navigation.replace('App');
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleSignIn() // Retry function
        );
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401') || error.message?.includes('invalid')) {
        showAuthError(
          t('auth.invalid_credentials'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('password') || error.message?.includes('blocked')) {
        showError(
          t('auth.account_locked'),
          t('auth.contact_support'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('auth.login_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.signin')} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { direction: isRTL ? 'ltr' : 'ltr' }]}>
          <Icons.Login width={wp(80)} height={wp(80)} />

          <View style={styles.formWrapper}>
            <FormField
              title={t('auth.email')}
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              error={errors.email}
              keyboardType="email-address"
              required
              placeholder={t('auth.email_placeholder')}
            />

            <FormField
              title={t('auth.password')}
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              error={errors.password}
              type="password"
              secureTextEntry={isPasswordSecure}
              onToggleSecureEntry={() => setIsPasswordSecure(!isPasswordSecure)}
              required
              placeholder={t('auth.password_placeholder')}
            />

            <TouchableOpacity 
              style={[styles.link, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} 
              onPress={() => navigation.navigate('forget')}
            >
              <Text style={styles.forgotText}>{t('auth.forgot_password_q')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, (!formIsValid || isAuthLoading) && styles.disabledButton]} 
            onPress={handleSignIn} 
            disabled={!formIsValid || isAuthLoading}
          >
            {isAuthLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>{t('auth.signin')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  formWrapper: {
    width: '100%',
    marginTop: hp(2),
    gap: hp(2),
  },
  link: {
    marginTop: hp(1),
    paddingHorizontal: wp(2),
  },
  forgotText: {
    fontWeight: '600',
    fontSize: Math.min(wp(3.5), 14),
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(90),
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SignIn;