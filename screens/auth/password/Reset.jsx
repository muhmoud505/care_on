import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const Reset = () => {
  const { t, i18n } = useTranslation();
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
    if (!formIsValid) {
      if (!passwordsMatch) {
        Toast.show({
          type: 'error',
          text1: t('common.error', { defaultValue: 'Error' }),
          text2: t('auth.passwords_do_not_match', { defaultValue: 'Passwords do not match' }),
          position: 'top',
          visibilityTime: 3000,
        });
      }
      return;
    }

    try {
      await resetPassword({
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      Toast.show({
        type: 'success',
        text1: t('common.success', { defaultValue: 'Success' }),
        text2: t('auth.password_reset_success', { defaultValue: 'Your password has been reset successfully.' }),
        position: 'top',
        visibilityTime: 3000,
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error', { defaultValue: 'Error' }),
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
      <View style={[styles.container,{direction:'ltr'}]}>
        <Text style={styles.txt1}>{t('auth.enter_passwords', { defaultValue: 'برجاء ادخال كلمات السر' })}</Text>
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
          <Text style={styles.txt2} numberOfLines={2}>
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
  disabledButton: {
    opacity: 0.5,
  },
})