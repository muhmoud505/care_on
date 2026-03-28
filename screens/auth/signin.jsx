// signin.jsx - Fixed RTL Version

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import FormField from '../../components/FormInput';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../contexts/authContext';
import useForm from '../../hooks/useForm';
import { hp, wp } from '../../utils/responsive';

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
    if (formIsValid) {
      try {
        await login({ email: form.email, password: form.password });
        navigation.replace('App');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: t('auth.login_failed'),
          text2: error.message,
          position: 'top',
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.signin')} />

      <View style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
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

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(5),
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
    marginTop: 'auto',
    marginBottom: hp(4),
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