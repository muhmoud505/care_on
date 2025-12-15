import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  // I18nManager, // Removed unsolicited import
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useAuth } from '../../../contexts/authContext'; // Using Auth context to get parent user
import useForm from '../../../hooks/useForm'; // Import the useForm hook

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Signup2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { birthdate, gender, age, isParentAddingChild } = route.params || {};
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Get parent user from global state (e.g., Redux).
  const { user: parentUser } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the custom hook for form state management
  const { form, errors, handleChange, checkFormValidity } = useForm({
    name: '',
    email: '',
    national_number: '',
    birthCertificate: null,
  });

  // Check that every value in the form object is truthy (i.e., not an empty string or null).
  // This ensures all fields must be filled before the form is considered valid.
  const isFormValid = Object.values(form).every(value => !!value);

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(form.birthCertificate.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const signupData = {
        name: form.name,
        email: form.email,
        national_number: form.national_number,
        birthdate: birthdate,
        age: age,
        gender: gender,
        isChild: true,
        id: base64Image, // Birth certificate image
        type: 'patient',
        // Add parent_id if a parent is creating this account.
        // The backend will use this to link the accounts.
        // Also, pass the flag along to the next screen.
        isParentAddingChild: isParentAddingChild,
        ...(isParentAddingChild && parentUser && { parent_id: parentUser.id }),
      };

      navigation.navigate('password', { signupData });
    } catch (err) {
      console.error("Failed to process image or navigate:", err);
      Alert.alert(t('common.error'), t('errors.image_processing_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <CustomHeader text={t('auth.create_account')} />
        
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { textAlign: isRTL ? 'left' : 'right' }]}>
            {(() => {
              const fullText = t('auth.create_child_account_prompt');
              const highlightText = t('auth.your_child_account');
              const parts = fullText.split(highlightText);
              return (
                <>
                  {parts[0]}
                  <Text style={styles.headerHighlight}>{highlightText}</Text>
                  {parts[1]}
                </>
              );
            })()}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <FormField 
            required
            title={t('auth.child_name')}
            placeholder={t('auth.child_name_placeholder')}
            value={form.name}
            onChangeText={(text) => handleChange('name', text)}
            error={errors.name}
          />
          
          <FormField 
            required
            title={t('auth.child_email')}
            placeholder={t('auth.child_email_placeholder')}
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            error={errors.email}
          />

          <FormField 
            required
            title={t('auth.child_national_id')}
            placeholder={t('auth.child_national_id_placeholder')}
            value={form.national_number}
            onChangeText={(text) => handleChange('national_number', text)}
            keyboardType="numeric"
          />
        </View>
        
        <Uploader
          required
          title={t('auth.child_birth_certificate')}
          color='#80D28040'
          onFileSelect={(file) => handleChange('birthCertificate', file)}
          error={errors.birthCertificate}
        />
        
        <TouchableOpacity
          style={[styles.nextButton, (!isFormValid || isProcessing) && styles.disabledButton]}
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{t('common.next')}</Text>
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
  },
  container: {
    paddingBottom: hp(5),
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginTop: hp(2),
    marginBottom: hp(3),
    alignSelf: 'center',
    width: wp(90),
  },
  headerText: {
    fontSize: Math.min(wp(5.5), 22),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerHighlight: {
    // Using the blue from the other screen for consistency
    color: '#014CC4',
  },
  formContainer: {
    gap: hp(2),
  },
  nextButton: {
    backgroundColor: '#014CC4',
    width: wp(90),
    height: hp(6.5),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(6),
  },
});

export default Signup2;