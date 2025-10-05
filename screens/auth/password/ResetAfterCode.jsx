import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  StatusBar,
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
  const { login } = useAuth(); // Using login to transition to the main app
  const { form, errors, handleChange, checkFormValidity } = useForm({
    newPassword: '',
    confirmPassword: '',
  });

  const formIsValid = checkFormValidity() && form.newPassword === form.confirmPassword;

  const handleConfirm = async () => {
    if (!formIsValid) return;
    console.log('New password set:', form.newPassword);
    // After successfully setting the password, log the user in
    // and the AuthProvider will navigate to the home stack.
    await login({ name: 'User', email: 'user@example.com' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
      <View style={[styles.container, { direction: i18n.dir() }]}>
        <Text style={styles.txt1}>{t('auth.enter_new_password', { defaultValue: 'برجاء ادخال كلمة السر الجديدة' })}</Text>
        <View style={styles.minContainer}>
          <FormField
            title={t('auth.new_password', { defaultValue: 'كلمة السر الجديدة' })}
            value={form.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
            error={errors.newPassword}
            required
            placeholder={t('auth.enter_password', { defaultValue: 'ادخل كلمة السر' })}
            type={'password'}
          />
          <FormField
            title={t('auth.confirm_password', { defaultValue: 'تأكيد كلمة السر' })}
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            error={errors.confirmPassword || (form.confirmPassword && form.newPassword !== form.confirmPassword ? t('auth.passwords_do_not_match') : '')}
            required
            placeholder={t('auth.reenter_password', { defaultValue: 'اعد ادخال كلمة السر' })}
            type={'password'}
          />
          <Text style={styles.txt2} numberOfLines={2}>
            {t('auth.password_rules', { defaultValue: 'يجب ان تحتوي علي: 8 أحرف علي الاقل ، أحرف انجليزية ، علامات (@, #, $ ...)' })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.nextButton, !formIsValid && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={!formIsValid}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>{t('common.confirm', { defaultValue: 'تأكيد' })}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default AfterCode

const styles = StyleSheet.create({
  safeArea: {

    flex: 1,
    backgroundColor: '#fff',
    marginTop:StatusBar.currentHeight
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
})