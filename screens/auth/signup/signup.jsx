import { useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const Signup = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { signup, isAuthLoading } = useAuth();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    name: '',
    nationalId: '',
    email: '',
    id: null,
  });

  const formIsValid = checkFormValidity();

  useEffect(() => {
    console.log('Current form data:', {
      ...form,
      isValid: formIsValid,
      errors,
    });
  }, [form, errors]);

  const handleSignup = async () => {
    if (!formIsValid) return;

    // Create a FormData object to send multipart/form-data
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('nationalId', form.nationalId);
    // The 'id' field from the form contains the file object from the Uploader
    formData.append('id', form.id);

    try {
      const response = await signup(formData);
      Alert.alert(
        t('common.success', { defaultValue: 'Success' }),
        t('auth.signup_success_message', { defaultValue: 'Your account has been created successfully. Please check your email to verify.' })
      );
      // TODO: Navigate to the login screen or a "verify email" screen
    } catch (error) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error.message || t('auth.signup_failed_message', { defaultValue: 'An unknown error occurred during signup.' })
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea,{direction:'rtl'}]}>
      <CustomHeader text={route.params?.title || t('auth.create_account', { defaultValue: 'إنشاء حساب' })}/>
      <View style={[styles.headerTextContainer, { direction: i18n.dir() }]}>
        <Text numberOfLines={2} style={styles.txt1}>
          لإنشاء <Text style={{color: '#014CC4'}}>حسابك</Text> يرجي ملئ البيانات التالية ..
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <FormField 
          title={'الاسم'}
          placeholder={'ادخل اسمك'}
          value={form.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
        />  
        <FormField 
          required
          title={'البريد الالكتروني'}
          placeholder={'ادخل بريدك الالكتروني'}
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          error={errors.email}
        />
        <FormField 
          required
          title={'الرقم القومي'}
          placeholder={'ادخل رقمك القومي'}
          value={form.nationalId}
          onChangeText={(text) => handleChange('nationalId', text)}
          keyboardType="numeric"
          error={errors.nationalId}
        />  
      </View>
      
      <Uploader
        required
        title={'البطاقة الشخصية'}
        color='#80D28040'
        onFileSelect={(file) => handleChange('id', file)}
        error={errors.id}
      />
      
      <TouchableOpacity
        onPress={handleSignup}
        activeOpacity={0.7}
        disabled={!formIsValid || isAuthLoading}
        style={[styles.submitButton, (!formIsValid || isAuthLoading) && styles.disabledButton]}
      >
        {isAuthLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>التالي</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
    
    
  },
  headerTextContainer: {
    // Styles for the header text block
    marginHorizontal: wp(2.5)

  },
  txt1: {
    fontSize: Math.min(wp(5.5), 22),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  formContainer: {
    // Container for FormField components
  },
  submitButton: {
    backgroundColor: '#014CC4',
    width: wp(90),
    height: hp(7),
    marginHorizontal: wp(5),
    marginVertical: hp(5),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24)
  }
});

export default Signup;