import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
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

const AfterCode = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { nationalId, code } = route.params || {};
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
        Alert.alert(t('common.error'), t('auth.passwords_do_not_match'));
      }
      return;
    }

    try {
      await resetPasswordAfterCode({
        national_id: nationalId,
        code: code,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      Alert.alert(
        t('common.success'),
        t('auth.password_reset_success_login'),
        [{ text: t('common.ok'), onPress: () => navigation.navigate('signin') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
        <View style={[styles.container, { direction: i18n.dir() }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.txt1}>{t('auth.enter_new_password', { defaultValue: 'برجاء ادخال كلمة السر الجديدة' })}</Text>
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
              <Text style={styles.txt2} numberOfLines={2}>
                {t('auth.password_rules', { defaultValue: 'يجب ان تحتوي علي: 8 أحرف علي الاقل ، أحرف انجليزية ، علامات (@, #, $ ...)' })}
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