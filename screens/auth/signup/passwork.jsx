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
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

// The specific green from your image
const THEME_GREEN = '#82D481';
const DISABLED_GREEN = '#B9E8BD';

const PasswordScreen = ({ route }) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { signup, isAuthLoading } = useAuth();
  const isRTL = i18n.dir() === 'rtl';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { form, errors, handleChange, checkFormValidity } = useForm({
    password: '',
    password_confirmation: '',
  });

  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { signupData ,isChild } = route.params || {};
  
  console.log(isChild);
  

  if (!signupData) {
    return null;
  }

  const formIsValid = checkFormValidity();

  const handleSignup = async () => {
    if (!formIsValid || form.password !== form.password_confirmation) {
      Alert.alert(t('common.error'), t('auth.passwords_do_not_match'));
      return;
    }

    if (!agreedToTerms) {
      Alert.alert(t('common.error'), t('auth.must_agree_terms'));
      return;
    }

    signupData.password = form.password;
    signupData.password_confirmation = form.password_confirmation;

    try {
      const response = await signup(signupData);
      
      if (signupData.isParentAddingChild) {
        if (response && response.token) {
          const existingChildAccounts = await AsyncStorage.getItem('child_accounts');
          const childAccounts = existingChildAccounts ? JSON.parse(existingChildAccounts) : [];
          childAccounts.push({ id: response.user?.id, token: response.token, name: response.user?.name });
          await AsyncStorage.setItem('child_accounts', JSON.stringify(childAccounts));
        }
        navigation.navigate('accounts');
        Alert.alert(t('common.success'), t('auth.child_account_created'));
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'welcome', params: { sessionData: response } }],
          })
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader text={t('auth.signup')} />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { direction: isRTL ? 'ltr' : 'ltr' }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Text matching the image exactly */}
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {(() => {
              const fullText = t('auth.set_password_header'); // لتعيين كلمة سر حسابك
              const highlightText = t('auth.password_highlight'); // كلمة سر
              const parts = fullText.split(highlightText);
              return (
                <>
                  <Text>{parts[0]}</Text>
                  <Text style={[styles.headerHighlight,{color:isChild ? THEME_GREEN : '#fff'}]}>{highlightText}</Text>
                  <Text>{parts[1]}</Text>
                </>
              );
            })()}
          </Text>
        </View>

        <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
          <FormField
            required
            title={t('auth.password')}
            placeholder={t('auth.password_placeholder')}
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            error={errors.password}
            secureTextEntry={isPasswordSecure}
            type="password"
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
            type="password"
            onToggleSecureEntry={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}
          />
          
          {/* Rules text below confirm field as seen in image */}
          <Text style={[styles.rulesText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('auth.password_rules')}
          </Text>
        </View>

        {/* Spacing to push checkbox and button down */}
        <View style={{ flex: 1, minHeight: hp(10) }} />

        {/* Terms and Conditions Checkbox */}
        <View style={[styles.termsContainer, { flexDirection: rowDirection }]}>
          <TouchableOpacity
            style={[styles.checkbox, agreedToTerms && { borderColor: THEME_GREEN ,}]}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            {agreedToTerms && <View style={styles.checkboxInner} />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            {t('auth.agree_prefix')}
            <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
              {t('auth.terms_only')}
            </Text>
          </Text>
        </View>

        {/* Submit Button matching image style */}
        <TouchableOpacity
          onPress={handleSignup}
          activeOpacity={0.7}
          disabled={!formIsValid || isAuthLoading || !agreedToTerms}
          style={[
            styles.submitButton, 
            (!formIsValid || isAuthLoading || !agreedToTerms) && {backgroundColor: DISABLED_GREEN,
    elevation: 0,},
            {backgroundColor:isChild ? THEME_GREEN : '#ccc'}
          ]}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('auth.create_account_button')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Terms Modal ... keeps existing code */}
      <Modal animationType="slide" transparent visible={showTermsModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <TouchableOpacity style={styles.closeIconContainer} onPress={() => setShowTermsModal(false)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('auth.terms_title')}</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{t('auth.terms_full_text')}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setAgreedToTerms(true); setShowTermsModal(false); }}>
              <Text style={styles.modalCloseButtonText}>{t('auth.agree')}</Text>
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
    backgroundColor: '#F8FAFF', // Slightly tinted background like your image
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
  },
  headerTextContainer: {
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  headerText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#000',
    lineHeight: wp(8),
  },
  headerHighlight: {
    color: THEME_GREEN,
  },
  formContainer: {
    marginTop: hp(2),
    gap: hp(1),
  },
  rulesText: {
    fontSize: wp(2.8),
    color: '#A0A0A0',
    lineHeight: wp(4),
    marginTop: hp(0.5),
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
    gap: wp(3),
  },
  checkbox: {
    width: wp(5.5),
    height: wp(5.5),
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxInner: {
    width: wp(3.5),
    height: wp(3.5),
    backgroundColor: THEME_GREEN,
    borderRadius: 4,
  },
  termsText: {
    fontSize: wp(3.8),
    color: '#000',
    fontWeight: '600',
  },
  termsLink: {
    color: '#014CC4', // Link remains blue for clarity
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: THEME_GREEN,
    height: hp(7.5),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: DISABLED_GREEN,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(7),
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: hp(60) },
  closeIconContainer: { position: 'absolute', top: 15, right: 15, zIndex: 1, width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { fontSize: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  modalScroll: { marginBottom: 15 },
  modalText: { fontSize: 14, lineHeight: 22 },
  modalCloseButton: { backgroundColor: '#014CC4', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default PasswordScreen;