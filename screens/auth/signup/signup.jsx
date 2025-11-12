import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'; // Import Expo FileSystem
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const Signup = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const navigation=useNavigation()
  const { isChild, birthdate, gender, age } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false); // State for image processing
  const { form, errors, handleChange, checkFormValidity } = useForm({
    name: '',
    national_number: isChild ? undefined : '',
    email: '',
    id: null,
    type:'patient'
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

    setIsProcessing(true);
    try {
      // 1. Read the image file and convert it to a Base64 string.
      const base64Image = await FileSystem.readAsStringAsync(form.id.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Create a plain JavaScript object to pass to the next screen.
      // This is more reliable than passing a FormData object through navigation.
      const signupData = {
        name: form.name,
        email: form.email,
        national_number: form.national_number,
        birthdate: birthdate,
        age: age,
        gender: gender,
        isChild: !!isChild,
        // Your API expects the 'id' field to contain the image data.
        id: base64Image,
        type:'patient'
      };
      // 3. Navigate to the password screen with the prepared data.
      navigation.navigate('password', { signupData });
    } catch (err) {
      console.error("Failed to process image or navigate:", err); 
      Alert.alert(t('common.error'), t('errors.image_processing_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea,{direction:'rtl'}]}>
      <CustomHeader text={route.params?.title || t('auth.create_account')}/>
      <View style={[styles.headerTextContainer, { direction: i18n.dir() }]}>
        <Text numberOfLines={2} style={styles.txt1}> 
          {t('auth.create_account_prompt', {
              account: t('auth.your_account'),
              interpolation: { escapeValue: false },
            }).replace(t('auth.your_account'), '')}
          <Text style={{color: '#014CC4'}}>{t('auth.your_account')}</Text>
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <FormField 
          title={t('common.name')}
          placeholder={t('common.name_placeholder')}
          value={form.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
        />  
        <FormField 
          required
          title={t('auth.email')}
          placeholder={t('auth.enter_email')}
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          error={errors.email}
        />
        {!isChild && (
          <>
            <FormField 
              required
              title={t('auth.national_id')}
              placeholder={t('auth.national_id_placeholder')}
              value={form.national_number}
              onChangeText={(text) => handleChange('national_number', text)}
              keyboardType="numeric"
              error={errors.national_number}
            />
          </>
        )}
      </View>
      
      <Uploader
        required 
        title={isChild ? t('profile.birth_certificate') : t('auth.national_id')}
        color='#80D28040'
        onFileSelect={(file) => handleChange('id', file)}
        error={errors.id}
      />
      
      <TouchableOpacity
        onPress={handleSignup}
        activeOpacity={0.7}
        disabled={!formIsValid || isProcessing}
        style={[styles.submitButton, (!formIsValid || isProcessing) && styles.disabledButton]}
        
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{t('common.next')}</Text>
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