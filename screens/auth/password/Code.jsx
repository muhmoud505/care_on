import { useNavigation, useRoute } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'
import FormField from '../../../components/FormInput'
import useForm from '../../../hooks/useForm'
import { hp, wp } from '../../../utils/responsive'

const Code = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { nationalId } = route.params || {};
  const { form, errors, handleChange, checkFormValidity } = useForm({
    code: '',
  });
  const formIsValid = checkFormValidity();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);
  const { t, i18n } = useTranslation();

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
   const handleResend = () => {
    // Reset the timer
    setTimeLeft(60);
    setShowResend(false);
    // Here you would also call your API to resend the code
    console.log('Resending code...');
  };

  const handleNext = () => {
    if (!formIsValid) return;
    navigation.navigate('aftercode', { code: form.code, nationalId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })} />
      <View style={[styles.container, { direction: i18n.dir() }]}>
        <Text style={styles.txt1}>{t('auth.enter_code_sent_to', { defaultValue: 'يرجي ادخال الكود المرسل الي رقمك' })}</Text>
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
          <View style={styles.resendContainer}>
            {showResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.txt2, { color: '#014CC4' }]}>{t('auth.resend_code', { defaultValue: 'اعادة ارسال الكود' })}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.txt2}>{t('auth.resend_in', { defaultValue: 'اعادة الارسال بعد' })} {formatTime(timeLeft)}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.nextButton, !formIsValid && styles.disabledButton]}
          onPress={handleNext}
          disabled={!formIsValid}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>{t('common.next', { defaultValue: 'التالي' })}</Text>
        </TouchableOpacity>
      </View>
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