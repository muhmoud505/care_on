// signup.jsx - Fixed RTL Version

import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
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
import {
  showError,
  showFileError,
  showNetworkError,
  showSuccess,
  showValidationError
} from '../../../utils/toastService';
import { validateEmail, validateName, validateNationalId } from '../../../utils/validators';

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
    // Validate each field using validators
    const nameError = validateName(form.name);
    if (nameError) {
      showValidationError('name', nameError, t);
      return;
    }

    const emailError = validateEmail(form.email);
    if (emailError) {
      showValidationError('email', emailError, t);
      return;
    }

    const nationalIdError = validateNationalId(form.national_number);
    if (nationalIdError) {
      showValidationError('national_id', nationalIdError, t);
      return;
    }

    if (!form.nationalIdFile) {
      showValidationError('file', 'Please upload your national ID file', t);
      return;
    }

    setIsProcessing(true);
    try {
      // 2. Create a plain JavaScript object to pass to next screen.
      // Backend expects actual file object, not base64 string
      const signupData = {
        name: form.name,
        email: form.email,
        national_number: form.national_number,
        birthdate: birthdate,
        age: age,
        gender: gender,
        isChild: false, // This flow is always for adults
        // Send actual file object for backend validation
        birth_certificate: form.nationalIdFile,
        type:'patient'
      };
      
      // Show data confirmation before proceeding
      showSuccess(
        t('auth.confirm_data'),
        `${t('auth.name')}: ${form.name}\n${t('auth.email')}: ${form.email}\n${t('auth.national_id')}: ${form.national_number}\n${t('auth.birthdate')}: ${birthdate}\n${t('auth.gender')}: ${gender}`,
        { duration: 3000 }
      );

      // Navigate to password screen after showing confirmation
      setTimeout(() => {
        proceedToPassword(signupData);
      }, 3500);
    } catch (err) {
      console.error("Failed to process image or navigate:", err);
      
      // Enhanced error handling
      if (err.message?.includes('Network request failed') || err.message?.includes('network')) {
        showNetworkError(
          t('common.check_internet_connection'),
          () => handleSignup() // Retry function
        );
      } else if (err.message?.includes('file') || err.message?.includes('upload') || err.message?.includes('size')) {
        showFileError(form.nationalIdFile?.name || 'ID file');
      } else if (err.message?.includes('email') || err.message?.includes('exists')) {
        showError(
          t('auth.email_already_exists'),
          t('auth.use_different_email'),
          { duration: 4000 }
        );
      } else if (err.message?.includes('validation') || err.message?.includes('invalid')) {
        showValidationError('form', err.message || t('common.invalid_data'));
      } else {
        showError(
          t('common.error'),
          err.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const proceedToPassword = (signupData) => {
    // 3. Navigate to password screen with prepared data.
    navigation.navigate('password', { signupData });
    
    showSuccess(
      t('auth.account_created'),
      t('auth.please_complete_profile'),
      { duration: 3000 }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.create_account')} />

      <ScrollView contentContainerStyle={[styles.scrollContainer, ]}>
        <View style={[styles.headerTextContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
  <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
    {(() => {
      const fullText = t('auth.create_account_subtitle');
      const highlightText = t('auth.your_account');
      
      // Split the sentence into parts using the highlight word as the divider
      const parts = fullText.split(highlightText);

      return (
        <>
          <Text>{parts[0]}</Text>
          <Text style={{ color: '#014CC4', fontWeight: 'bold' }}>{highlightText}</Text>
          <Text>{parts[1]}</Text>
        </>
      );
    })()}
  </Text>
</View>

        <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
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