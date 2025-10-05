
import { Link } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../components/CustomHeader'
import FormField from '../../components/FormInput'
import Images from '../../constants2/images'
import { useAuth } from '../../contexts/authContext'
import useForm from '../../hooks/useForm'
import { hp, wp } from '../../utils/responsive'

const SignIn = () => {
  const { login } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    nationalId: '',
    password: '',
  });

  const formIsValid = checkFormValidity();

  const handleSignIn = async () => {
    if (!formIsValid) return;
    // In a real app, you would call your login API here.
    // For now, we'll simulate a login.
    await login({ name: 'User', email: 'user@example.com' });
    // Navigation will be handled automatically by the AuthProvider
  };

  const { t } = useTranslation()
  return (
    <SafeAreaView>
      <CustomHeader text={t('auth.signin', { defaultValue: 'تسجيل الدخول' })} />
      <View style={styles.container} >
        <Image style={styles.img} source={Images.login}/>
        <View style={styles.smcontainer}>

        <FormField 
        title={t('auth.national_id', { defaultValue: 'الرقم القومي' })}
        value={form.nationalId}
        onChangeText={(text) => handleChange('nationalId', text)}
        error={errors.nationalId}
        keyboardType="numeric"
        required
        placeholder={t('auth.enter_national_id', { defaultValue: 'ادخل رقمك القومي' })}
        />
        <FormField 
        title={t('auth.password', { defaultValue: 'كلمة السر' })}
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
        error={errors.password}
        type="password"
        required
        placeholder={t('auth.enter_password', { defaultValue: 'ادخل كلمة السر' })}
        />
        <Link style={styles.link} to={{ screen: 'forget' }}><Text style={styles.txt1} >{t('auth.forgot_password_q', { defaultValue: 'نسيت كلمة السر؟' })}</Text></Link>
        </View>
          <TouchableOpacity style={[styles.nextButton, !formIsValid && styles.disabledButton]} onPress={handleSignIn} disabled={!formIsValid} activeOpacity={0.7}>

                       <Text style={styles.nextButtonText}>{t('auth.signin', { defaultValue: 'تسجيل الدخول' })}</Text>
                    </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default SignIn


const styles = StyleSheet.create({
  img: {
    width: wp(80),
    height: wp(80),
    resizeMode: 'contain',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  smcontainer: {
    marginTop: -hp(2.5),
    gap: hp(0.5),
    width: '100%',
    alignItems: 'center',
  },
  link: {
    color: 'black',
    width: wp(85),
    marginTop: hp(1),
  },
  txt1: {
    fontWeight: '600',
    fontSize: Math.min(wp(3.5), 14),
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(90),
    marginTop: hp(5),
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