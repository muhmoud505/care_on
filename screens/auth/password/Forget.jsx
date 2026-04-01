import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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

const Forget = () => {
  
  const navigation = useNavigation();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    email: '',
  });
  const { forgotPassword, isAuthLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const ISRTL = i18n.language === 'ar';
  const textAlign = ISRTL ? 'right' : 'left';
  const direction = ISRTL ? 'ltr' : 'ltr';

  const formIsValid = checkFormValidity();

  const handleNext = async () => {
    if (!formIsValid) {
      showValidationError('form', 'Please fill in all required fields');
      return;
    }
    
    try {
      // Call the API to request a password reset code
      await forgotPassword({ email: form.email });

      // Show success toast
      showSuccess(
        t('auth.password_reset_code_sent'),
        t('auth.check_your_email'),
        { duration: 3000 }
      );

      // On success, navigate to the code verification screen
      navigation.navigate('code', { email: form.email });
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleNext() // Retry function
        );
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401') || error.message?.includes('invalid')) {
        showAuthError(
          t('auth.invalid_credentials'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('email') || error.message?.includes('not found')) {
        showError(
          t('auth.email_not_found'),
          t('auth.check_email_address'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('auth.password_reset_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password')} />
      <View style={[styles.container,{ direction }]}>
        <Text style={[styles.infoText, { textAlign }]}>
          {t('auth.enter_email_send_code')}
        </Text>

        <FormField
          title={t('auth.email')}
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          error={errors.email}
          keyboardType="email-address"
          required
          placeholder={t('auth.email_placeholder')}
        />

        <TouchableOpacity
          style={[styles.button, (!formIsValid || isAuthLoading) && styles.disabledButton]}
          onPress={handleNext}
          disabled={!formIsValid || isAuthLoading}
          activeOpacity={0.7}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('common.next')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight
    
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
  },
  infoText: {
    fontSize: Math.min(wp(4.5), 18),
   
    marginHorizontal: wp(5),
    marginBottom: hp(3),
    color: '#333',
  },
  button: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    marginBottom: hp(8),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Forget;