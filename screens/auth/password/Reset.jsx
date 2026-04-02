import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';
import {
  showError,
  showNetworkError,
  showSuccess,
  showValidationError
} from '../../../utils/toastService';

const Reset = () => {
  const { t, i18n } = useTranslation();
  const ISRTL = i18n.language === 'ar';
  const { user } = useAuth();
  // const textAlign = ISRTL ? 'right' : 'left';
  // const direction = ISRTL ? 'rtl' : 'ltr';
  const navigation = useNavigation();
  const { resetPassword, isAuthLoading } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
   
  });


  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true);
  const [isNewPasswordSecure, setIsNewPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const passwordsMatch = form.password && form.password_confirmation && form.password === form.password_confirmation;
  const formIsValid = checkFormValidity() && passwordsMatch;

  const handleConfirm = async () => {
    // Test toast to debug
   
    
    console.log('Reset button pressed, form:', form);
    console.log('Form valid:', formIsValid);
    console.log('Passwords match:', passwordsMatch);
    
    if (!formIsValid) {
      if (!passwordsMatch) {
        showValidationError(
          'password',
          t('reset_password.password_validation_error'),
          t
        );
      }
      return;
    }

    try {
      console.log('Calling resetPassword with:', {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      
      await resetPassword({
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
        email: user?.user?.email
      });

      showSuccess(
        t('common.success'),
        t('reset_password.password_reset_success'),
        t,
        { duration: 3000 }
      );

      navigation.goBack();
    } catch (error) {
      console.error('Reset password error:', error);
      // Enhanced error handling for password reset
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
      showNetworkError(
        t('common.network_error'),
        t('common.try_again'),
        t,
        { duration: 4000 }
      );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      showError(
        t('reset_password.password_permission_error', { defaultValue: 'Permission error' }),
        t('common.try_again'),
        t,
        { duration: 4000 }
      );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
      showError(
        t('reset_password.password_server_error', { defaultValue: 'Server error' }),
        t('common.try_again'),
        t,
        { duration: 4000 }
      );
      } else if (error.message?.includes('too short') || error.message?.includes('short')) {
      showError(
        t('reset_password.password_too_short', { defaultValue: 'Password too short' }),
        error.message || t('common.something_went_wrong'),
        t,
        { duration: 4000 }
      );
      } else if (error.message?.includes('weak') || error.message?.includes('strength')) {
      showError(
        t('reset_password.password_weak', { defaultValue: 'Password too weak' }),
        error.message || t('common.something_went_wrong'),
        t,
        { duration: 4000 }
      );
      } else {
      showError(
        t('reset_password.password_reset_failed', { defaultValue: 'Password reset failed' }),
        error.message || t('common.something_went_wrong'),
        t,
        { duration: 4000 }
      );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
      <View style={[styles.container, { direction:ISRTL ? 'ltr' : 'ltr' }]}>
        <Text style={[styles.txt1, { textAlign:ISRTL? 'right' : 'left' }]}>{t('auth.enter_passwords', { defaultValue: 'برجاء ادخال كلمات السر' })}</Text>
        <View style={styles.minContainer}>
          <FormField
            required
            title={t('auth.current_password', { defaultValue: 'كلمة المرور الحالية' })}
            placeholder={t('auth.enter_current_password', { defaultValue: 'ادخل كلمة المرور الحالية' })}
            value={form.current_password}
            onChangeText={(text) => handleChange('current_password', text)}
            error={errors.current_password}
            secureTextEntry={isCurrentPasswordSecure}
            type={'password'}
            onToggleSecureEntry={() => setIsCurrentPasswordSecure(!isCurrentPasswordSecure)}
          />
          <FormField
            title={t('auth.new_password', { defaultValue: 'كلمة المرور الجديدة' })}
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            error={errors.password}
            required
            placeholder={t('auth.enter_new_password', { defaultValue: 'ادخل كلمة المرور الجديدة' })}
            type={'password'}
            secureTextEntry={isNewPasswordSecure}
            onToggleSecureEntry={() => setIsNewPasswordSecure(!isNewPasswordSecure)}
          />
          <FormField
            title={t('auth.confirm_new_password', { defaultValue: 'تأكيد كلمة المرور الجديدة' })}
            value={form.password_confirmation}
            onChangeText={(text) => handleChange('password_confirmation', text)}
            error={errors.password_confirmation || (form.password_confirmation && !passwordsMatch ? t('auth.passwords_do_not_match') : '')}
            required
            placeholder={t('auth.reenter_new_password', { defaultValue: 'اعد ادخال كلمة المرور الجديدة' })}
            type={'password'}
            secureTextEntry={isConfirmPasswordSecure}
            onToggleSecureEntry={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
          />
          <Text style={[styles.txt2, { textAlign:ISRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {t('auth.password_rules', { defaultValue: 'يجب ان تحتوي علي: 8 أحرف علي الاقل ، أحرف انجليزية ، علامات (@, #, $ ...)' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.nextButton, (!formIsValid || isAuthLoading) && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!formIsValid || isAuthLoading}
          activeOpacity={0.7}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{t('common.confirm', { defaultValue: 'تأكيد' })}</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  )
}

export default Reset

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  minContainer: {
    marginTop: hp(3),
    alignItems: 'center',
  },
  txt1: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
  },
  txt2: {
    color: '#80808099',
    fontSize: Math.min(wp(3), 12),
    fontWeight: 'bold',
    width: wp(85),
    marginTop: hp(1),
  }, 
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: hp(8),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  disabledButton: {
    opacity: 0.5,
  },
})