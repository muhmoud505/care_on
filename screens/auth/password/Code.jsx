import { useNavigation, useRoute } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import CustomHeader from '../../../components/CustomHeader'
import FormField from '../../../components/FormInput'
import { useAuth } from '../../../contexts/authContext'
import useForm from '../../../hooks/useForm'
import { hp, wp } from '../../../utils/responsive'
import {
    showAuthError,
    showError,
    showNetworkError,
    showSuccess,
    showValidationError
} from '../../../utils/toastService'

const Code = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  const { verifyResetCode, resendResetCode, isAuthLoading } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    code: '',
  });
  const formIsValid = checkFormValidity();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { t, i18n } = useTranslation();
  const ISRTL = i18n.language === 'ar';
  const textAlign = ISRTL ? 'right' : 'left';
  const direction = ISRTL ? 'ltr' : 'ltr';

  useEffect(()=>{
    if(timeLeft<=0){
      setShowResend(true);
      return;
    }
    const timer=setTimeout(()=>{
      setTimeLeft(prev=>prev-1)
    },1000)
    return  ()=>clearTimeout(timer)

  },[timeLeft])
    const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
   const handleResend = async () => {
    setIsResending(true);
    try {
      await resendResetCode({ email: email });
      
      showSuccess(
        t('auth.resend_code_success'),
        t('auth.check_your_email'),
        { duration: 3000 }
      );
      
      // Reset the timer
      setTimeLeft(60);
      setShowResend(false);
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleResend() // Retry function
        );
      } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
        showAuthError(
          t('auth.email_not_found'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('rate') || error.message?.includes('limit')) {
        showError(
          t('auth.too_many_requests'),
          t('auth.try_again_later'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('auth.resend_code_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleNext = async () => {
    if (!formIsValid) {
      showValidationError('form', 'Please enter the verification code');
      return;
    }
    
    try {
      // The API should validate the code.
      // We assume the API returns success if the code is correct.
      await verifyResetCode({
        email: email,
        code: form.code,
      });
      
      // Show success toast
      showSuccess(
        t('auth.code_verified_success'),
        t('auth.proceed_to_reset_password'),
        { duration: 3000 }
      );
      
      // On success, navigate to the next step, passing the necessary data.
      navigation.navigate('aftercode', { code: form.code, email: email });
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleNext() // Retry function
        );
      } else if (error.message?.includes('invalid') || error.message?.includes('wrong') || error.message?.includes('incorrect')) {
        showAuthError(
          t('auth.invalid_code_error'),
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
          t('auth.code_verification_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <CustomHeader text={t('auth.enter_code')} />
      <View style={[styles.container, { direction }]}>
        <Text style={[styles.txt1, { textAlign }]}>{t('auth.enter_code_sent_to')}</Text>
        <View style={styles.minContainer}>
          <FormField
            title={t('auth.code', { defaultValue: 'الكود' })}
            value={form.code}
            onChangeText={(text) => handleChange('code', text)}
            error={errors.code}
            keyboardType="numeric"
            required
            placeholder={t('auth.enter_code', { defaultValue: 'ادخل الكود' })}
          />
          <View style={[styles.resendContainer, { alignItems: ISRTL ? 'flex-start' : 'flex-end' }]}>
            {showResend ? (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                {isResending ? (
                  <ActivityIndicator size="small" color="#014CC4" />
                ) : (
                  <Text style={[styles.txt2, { color: '#014CC4' }]}>{t('auth.resend_code', { defaultValue: 'اعادة ارسال الكود' })}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity>
                <Text style={[styles.txt2, { textAlign }]}>{t('auth.resend_in')} {formatTime(timeLeft)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.nextButton, (!formIsValid || isAuthLoading) && styles.disabledButton]}
          onPress={handleNext}
          disabled={!formIsValid || isAuthLoading}
          activeOpacity={0.7}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{t('common.next', { defaultValue: 'التالي' })}</Text>
          )}
        </TouchableOpacity>
      </View>
       <Toast />
    </SafeAreaView>
   
  )
}

export default Code

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
  resendContainer: {
    width: wp(85),
    alignItems: 'flex-start',
    marginTop: hp(1),
  },
  txt2: {
    color: '#000000',
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '400',
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