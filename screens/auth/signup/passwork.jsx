import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader'; // Assuming CustomHeader exists
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const PasswordScreen = ({ route }) => { // Accept route as a prop
  const { t, i18n } = useTranslation();
  const navigation =useNavigation()
  const { signup, isAuthLoading, setSession } = useAuth(); // Get setSession function from context
  const { form, errors, handleChange, checkFormValidity } = useForm({
    password: '',
    password_confirmation: '',
  });
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
    const { signupData } = route.params || {};

     console.log(signupData.birthdate)
     console.log(signupData.age)

  const formIsValid = checkFormValidity();

  // useEffect(() => {
  //   if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
  //     // This is a simple example of cross-field validation.
  //     // You might want to integrate this into your useForm hook.
  //     errors.password_confirmation = t('auth.passwords_do_not_match', { defaultValue: 'Passwords do not match' });
  //   } else if (errors.password_confirmation) {
  //     // Clear error if they match
  //     delete errors.password_confirmation;
  //   }
  // }, [form, errors]);

  const handleSignup = async () => {
    if (!formIsValid || form.password !== form.password_confirmation) {
        Alert.alert(t('common.error'), t('auth.passwords_do_not_match'));

        return;
    };

    if (!agreedToTerms) {
      Alert.alert(t('common.error'), t('auth.must_agree_terms', { defaultValue: 'يجب الموافقة علي الشروط والاحكام' }));
      return;
    }

    // Safely get signupData from route.params inside the handler
    const { signupData } = route.params || {};
    // Defensive check to ensure signupData exists before using it.
    if (!signupData) {
      console.error("Critical Error: signupData is missing in PasswordScreen.");
      Alert.alert(t('common.error'), t('errors.unexpected_signup_error'));
      return;
    }

    // Add the password fields to the object.
    signupData.password = form.password;
    signupData.password_confirmation = form.password_confirmation;

    try {
      // Perform the signup API call
      const response = await signup(signupData);
      console.log(response);
      

      // Check if a parent is adding a child
      if (signupData.isParentAddingChild) {
        // 1. Store the new child's token. We'll store it under a key related to the parent.
        if (response && response.token) {
          // A more robust solution would be to get existing child accounts and append the new one.
          const existingChildAccounts = await AsyncStorage.getItem('child_accounts');
          const childAccounts = existingChildAccounts ? JSON.parse(existingChildAccounts) : [];
          childAccounts.push({ id: response.user.id, token: response.token, name: response.user.name });
          await AsyncStorage.setItem('child_accounts', JSON.stringify(childAccounts));
        }
        
        // 2. Navigate back to the 'accounts' screen instead of the child's homepage.
        navigation.navigate('accounts');
        Alert.alert(t('common.success'), t('auth.child_account_created'));
      } else {
        // For a regular signup, navigate to the WelcomeScreen and pass the session data.
        // The WelcomeScreen will then handle setting the session.
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'welcome', params: { sessionData: response } }] })
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { direction: 'rtl' }]}>
      <CustomHeader text={route.params?.title || t('auth.create_account')}/>
      <View style={[styles.headerTextContainer, { direction: i18n.dir() }]}>
        <Text numberOfLines={2} style={styles.txt1}>
          {(() => {
            const fullText = t('auth.final_step_password');
            const highlightText = t('auth.password');
            const parts = fullText.split(highlightText);
            return (
              <>
                {parts[0]}
                <Text style={{ color: '#014CC4' }}>{highlightText}</Text>
                {parts[1]}
              </>
            );
          })()}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <FormField
          required
          title={t('auth.password')}
          placeholder={t('auth.password_placeholder')}
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          error={errors.password}
          secureTextEntry={isPasswordSecure}
          type={'password'}
          onToggleSecureEntry={() => setIsPasswordSecure(!isPasswordSecure)}
        />
        <FormField
          required
          title={t('auth.confirm_password')}
          placeholder={t('auth.confirm_password_placeholder')}
          value={form.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
          error={errors.password_confirmation}
          secureTextEntry={isConfirmPasswordSecure}
          type={'password'}
          onToggleSecureEntry={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}

        />
        
      </View>
      <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            {agreedToTerms && <View style={styles.checkboxInner} />}
          </TouchableOpacity>
          <Text style={styles.termsText} onPress={() => setShowTermsModal(true)}>
            {t('auth.agree_terms', { defaultValue: 'الموافقة علي الشروط والاحكام' })}
          </Text>
        </View>
      <TouchableOpacity
        onPress={handleSignup}
        activeOpacity={0.7}
        disabled={!formIsValid || isAuthLoading || !agreedToTerms}
        style={[styles.submitButton, (!formIsValid || isAuthLoading || !agreedToTerms) && styles.disabledButton]}
      >
        {isAuthLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{t('auth.create_account_button')}</Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide" 
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeIconContainer} 
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{t('auth.terms_title', { defaultValue: 'الشروط والأحكام' })}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                {t('auth.terms_full_text', { defaultValue: 'يرجى قراءة الشروط والأحكام بعناية...' })}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setAgreedToTerms(true); setShowTermsModal(false); }}>
              <Text style={styles.modalCloseButtonText}>{t('auth.agree', { defaultValue: 'الموافقة' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight
  },
  headerTextContainer: {
    // Styles for the header text block
    paddingHorizontal: wp(5),
    paddingTop: hp(2)

  },
  txt1: {
    fontSize: Math.min(wp(5.5), 22),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContainer: {
    // Container for FormField components
    marginTop: hp(4),
    paddingHorizontal: wp(5),
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
    gap: wp(2),
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: wp(3),
    height: wp(3),
    backgroundColor: '#014CC4',
    borderRadius: 2,
  },
  termsText: {
    fontSize: Math.min(wp(4), 16),
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    marginHorizontal: wp(5),
    marginBottom: hp(4),
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: hp(60),
    width: '100%',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 15,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#014CC4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PasswordScreen;