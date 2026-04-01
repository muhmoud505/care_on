import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';
import {
    showAuthError,
    showError,
    showNetworkError,
    showSuccess,
    showValidationError,
} from '../../../utils/toastService';

const AfterCode = () => {
  const { t, i18n } = useTranslation();
  const ISRTL = i18n.language === 'ar';
  const textAlign = ISRTL ? 'right' : 'left';
  const direction = ISRTL ? 'ltr' : 'ltr';
  const navigation = useNavigation();
  const route = useRoute();
  const { nationalId, code, email } = route.params || {};
  const { resetPasswordAfterCode, isAuthLoading } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    password: '',
    password_confirmation: '',
  });

  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

  const passwordsMatch = form.password && form.password_confirmation && form.password === form.password_confirmation;
  const formIsValid = checkFormValidity() && passwordsMatch;

  const handleConfirm = async () => {
    if (!formIsValid) {
      if (!passwordsMatch) {
        showValidationError('password', t('auth.password_mismatch_error'));
      } else {
        showValidationError('form', t('common.check_required_fields'));
      }
      return;
    }

    try {
      await resetPasswordAfterCode({
        national_id: nationalId,
        email: email,
        code: code,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Show success toast
      showSuccess(
        t('auth.password_updated_success'),
        t('auth.password_reset_success_login'),
        { duration: 4000 }
      );

      // Navigate to signin after a short delay to allow user to see the toast
      setTimeout(() => {
        navigation.replace('signin');
      }, 2000);
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleConfirm() // Retry function
        );
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401') || error.message?.includes('invalid')) {
        showAuthError(
          t('auth.invalid_code_error'),
          t('auth.request_new_code'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('password') || error.message?.includes('weak') || error.message?.includes('requirements')) {
        showError(
          t('auth.password_requirements_not_met'),
          t('auth.password_rules'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('expired') || error.message?.includes('timeout')) {
        showError(
          t('auth.code_expired'),
          t('auth.request_new_code'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('auth.password_update_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
        <View style={[styles.container, { direction }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.txt1, { textAlign }]}>{t('auth.enter_new_password')}</Text>
            <View style={styles.minContainer}>
              <FormField
                title={t('auth.new_password', { defaultValue: 'كلمة السر الجديدة' })}
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                error={errors.password}
                required
                placeholder={t('auth.enter_password', { defaultValue: 'ادخل كلمة السر' })}
                type={'password'}
                secureTextEntry={isPasswordSecure}
                onToggleSecureEntry={() => setIsPasswordSecure(!isPasswordSecure)}
              />
              <FormField
                title={t('auth.confirm_password', { defaultValue: 'تأكيد كلمة السر' })}
                value={form.password_confirmation}
                onChangeText={(text) => handleChange('password_confirmation', text)}
                error={errors.password_confirmation || (form.password_confirmation && !passwordsMatch ? t('auth.passwords_do_not_match') : '')}
                required
                placeholder={t('auth.reenter_password', { defaultValue: 'اعد ادخال كلمة السر' })}
                type={'password'}
                secureTextEntry={isConfirmPasswordSecure}
                onToggleSecureEntry={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
              />
              <Text style={[styles.txt2, { textAlign }]} numberOfLines={2}>
                {t('auth.password_rules')}
              </Text>
            </View>
          </ScrollView>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AfterCode

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
    textAlign: 'right',
  },
  txt2: {
    color: '#80808099',
    fontSize: Math.min(wp(3), 12),
    fontWeight: 'bold',
    textAlign: 'right',
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
})