import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Signup2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { birthdate, gender, age, isParentAddingChild } = route.params || {};
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const { user: parentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  let isChild=true;
  const { form, errors, handleChange } = useForm({
    name: '',
    email: '',
    national_number: '',
    birthCertificate: null,
  });

  const isFormValid = Object.values(form).every(value => !!value);

  const handleRegister = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    try {
      // Backend expects actual file object, not base64 string
      const signupData = {
        name: form.name,
        email: form.email,
        national_number: form.national_number,
        birthdate: birthdate,
        age: age,
        gender: gender,
        isChild: true,
        birth_certificate: form.birthCertificate, // Send actual file object
        type: 'patient',
        isParentAddingChild: isParentAddingChild,
        ...(isParentAddingChild && parentUser?.user?.id && { parent_id: parentUser?.user?.id }),
      };

      navigation.navigate('password', { signupData ,isChild});
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert(t('common.error'), t('errors.image_processing_failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader text={t('auth.signup')} />
      
      <ScrollView 
        contentContainerStyle={[styles.container, { direction: isRTL ? 'ltr' : 'ltr' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Text Section */}
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {(() => {
               const fullText = t('auth.create_account_subtitle');
              const highlightText = t('auth.the_following_data');
              
              if (!fullText.includes(highlightText)) return fullText;
              const parts = fullText.split(highlightText);

              return (
                <>
                  <Text>{parts[0]}</Text>
                  <Text style={styles.headerHighlight}>{highlightText}</Text>
                  <Text>{parts[1]}</Text>
                </>
              );
            })()}
          </Text>
        </View>
        
        {/* Form Fields Section */}
        <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
          <FormField 
            // Note: In the image, Child Name has NO red asterisk
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
            error={errors.national_number}
          />
        </View>
        
        {/* File Uploader Section */}
        <Uploader
          required
          title={t('auth.child_birth_certificate')}
          color='#E8F5E9' // Light green background matching image
          onFileSelect={(file) => handleChange('birthCertificate', file)}
          error={errors.birthCertificate}
        />
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (!isFormValid || isProcessing) && styles.disabledButton]}
          onPress={handleRegister}
          activeOpacity={0.8}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('marketing.register')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF', // Light bluish background from image
  },
  container: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(5),
    flexGrow: 1,
  },
  headerTextContainer: {
    marginTop: hp(3),
    marginBottom: hp(4),
    width: '100%',
  },
  headerText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#000',
    lineHeight: hp(3.8), // Matches the spacing of the 2 lines in image
  },
  headerHighlight: {
    color: '#82D481', // Exact Green from image
  },
  formContainer: {
    width: '100%',
    gap: hp(2),
    marginBottom: hp(2),
  },
  submitButton: {
    backgroundColor: '#82D481', // Green button
    width: '100%',
    height: hp(7.5),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
    // Soft shadow for the button
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(7), // Large bold font for "تسجيل"
  },
});

export default Signup2;