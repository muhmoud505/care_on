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
        await login({
          email: form.email,
          password: form.password,
        });
        // Navigation will be handled automatically by the AuthProvider
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: t('auth.login_failed'),
          text2: error.message,
          position: 'top',
          visibilityTime: 3000,
        });
      } 
    }
  };
  return (
    <SafeAreaView>
      <CustomHeader text={t('auth.signin')} />
      <View style={styles.container} >
        <Icons.Login width={wp(80)} height={wp(80)} />
        <View style={styles.smcontainer}> 
 
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
        <TouchableOpacity style={[styles.link, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]} onPress={() => navigation.navigate('forget')}> 
          <Text style={[styles.txt1, { textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.forgot_password_q')}</Text>
        </TouchableOpacity>
        </View>
          <TouchableOpacity style={[styles.nextButton, (!formIsValid || isAuthLoading) && styles.disabledButton]} onPress={handleSignIn} disabled={!formIsValid || isAuthLoading} activeOpacity={0.7}>
            {isAuthLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>{t('auth.signin')}</Text>
            )}
                    </TouchableOpacity>
      </View>
      <Toast />
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
    width: wp(85),
    marginTop: hp(1),
  },
  txt1: {
    fontWeight: '600',
    fontSize: Math.min(wp(3.5), 14),
    // textAlign is set inline per language direction
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