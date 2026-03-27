// signup.jsx - Fixed RTL Version

import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
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
  const navigation = useNavigation();
  const isRTL = i18n.dir() === 'rtl';
  const { birthdate, gender, age } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false);

  // Conditionally define the initial form state
  const initialFormState = {
    name: '',
    email: '',
    national_number: '',
    nationalIdFile: null, // Use a more descriptive name
  };
  const { form, errors, handleChange, checkFormValidity } = useForm(initialFormState);

  // Check that every value in the form object is truthy (i.e., not an empty string or null).
  // This ensures all fields must be filled before the form is considered valid.
  const formIsValid = Object.values(form).every(value => !!value);

  const handleSignup = async () => {
    if (!formIsValid) return;

    setIsProcessing(true);
    try {
      // 1. Read the image file and convert it to a Base64 string.
      const base64Image = await FileSystem.readAsStringAsync(form.nationalIdFile.uri, {
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
        isChild: false, // This flow is always for adults
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
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.create_account')} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerTextContainer}>
  <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
    {(() => {
      const fullText = t('auth.create_account_subtitle');
      // Change 'auth.the_following_data' to 'auth.your_account'
      const highlightText = t('auth.your_account'); 
      const parts = fullText.split(highlightText);

      return (
        <>
          <Text>{parts[0]}</Text>
          <Text style={{ color: '#014CC4' }}>{highlightText}</Text>
          <Text>{parts[1]}</Text>
        </>
      );
    })()}
  </Text>
</View>

        <View style={[styles.formContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <FormField
            required
            title={t('common.name')}
            placeholder={t('auth.name_placeholder')}
            value={form.name}
            onChangeText={(text) => handleChange('name', text)}
            error={errors.name}
          />

          <FormField
            required
            title={t('auth.email')}
            placeholder={t('auth.email_placeholder')}
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            error={errors.email}
          />

          <FormField
            required
            title={t('auth.national_id')}
            placeholder={t('auth.national_id_placeholder')}
            value={form.national_number}
            onChangeText={(text) => handleChange('national_number', text)}
            keyboardType="numeric"
            error={errors.national_number}
          />

          <Uploader
            required
            title={t('auth.personal_id')}
            color='#80D28040'
            onFileSelect={(file) => handleChange('nationalIdFile', file)}
            error={errors.nationalIdFile}
          />
        </View>
        
        <TouchableOpacity
          onPress={handleSignup}
          activeOpacity={0.7}
          disabled={!formIsValid}
          style={[styles.submitButton, (!formIsValid || isProcessing) && styles.disabledButton]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('common.next')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
  },
  subtitle: {
  fontSize: wp(4.8), // Slightly larger to match the image
  fontWeight: '700', // Making it bolder
  color: '#000',     // Base color black
  lineHeight: hp(3.5),
},
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
  },
  headerTextContainer: {
    marginVertical: hp(3),
  },
  subtitle: {
    fontSize: Math.min(wp(4.5), 18),
    fontWeight: '600',
    color: '#1A1D44',
    lineHeight: hp(3),
  },
  formContainer: {
    width: '100%',
    gap: hp(2),
    marginBottom: hp(2),
  },
  submitButton: {
    backgroundColor: '#7FA8D4',
    width: '100%',
    height: hp(7),
    marginTop: hp(4),
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
    fontSize: Math.min(wp(5), 20),
  },
});

export default Signup;