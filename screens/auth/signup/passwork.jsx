import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
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
import CustomHeader from '../../../components/CustomHeader'; // Assuming CustomHeader exists
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const PasswordScreen = ({ route }) => { // Accept route as a prop
  const { t, i18n } = useTranslation();
  const navigation =useNavigation()
  const { signup, isAuthLoading, login } = useAuth(); // Get login function from context
  const { form, errors, handleChange, checkFormValidity } = useForm({
    password: '',
    password_confirmation: '',
  });
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
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
        Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.passwords_do_not_match', { defaultValue: 'Passwords do not match' }));

        return;
    };

    // Safely get signupData from route.params inside the handler
    const { signupData } = route.params || {};
    // Defensive check to ensure signupData exists before using it.
    if (!signupData) {
      console.error("Critical Error: signupData is missing in PasswordScreen.");
      Alert.alert("Error", "An unexpected error occurred. Please start the signup process again.");
      return;
    }

    // Add the password fields to the object.
    signupData.password = form.password;
    signupData.password_confirmation = form.password_confirmation;
    signupData.isChild = route.params?.signupData?.isChild;

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
        Alert.alert("Success", "Child account created successfully.");
      } else {
        // For a regular signup, manually log the new user in by saving their data.
        await AsyncStorage.setItem('user', JSON.stringify(response));
        // This will trigger the user state change in the context and navigate to the main app.
        // We can just reset to a known screen in the main stack.
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'welcome' }] }));
      }
    } catch (error) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { direction: 'rtl' }]}>
      <CustomHeader text={route.params?.title || t('auth.create_account', { defaultValue: 'إنشاء حساب' })}/>
      <View style={[styles.headerTextContainer, { direction: i18n.dir() }]}>
        <Text numberOfLines={2} style={styles.txt1}>
          الخطوة الأخيرة، <Text style={{ color: '#014CC4' }}>كلمة المرور</Text>
        </Text>
      </View>

      <View style={styles.formContainer}>
        <FormField
          required
          title={'كلمة المرور'}
          placeholder={'ادخل كلمة المرور'}
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          error={errors.password}
          secureTextEntry={isPasswordSecure}
          type={'password'}
          onToggleSecureEntry={() => setIsPasswordSecure(!isPasswordSecure)}
        />
        <FormField
          required
          title={'تأكيد كلمة المرور'}
          placeholder={'أعد إدخال كلمة المرور'}
          value={form.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
          error={errors.password_confirmation}
          secureTextEntry={isConfirmPasswordSecure}
          type={'password'}
          onToggleSecureEntry={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)}

        />
      </View>

      <TouchableOpacity
        onPress={handleSignup}
        activeOpacity={0.7}
        disabled={!formIsValid || isAuthLoading}
        style={[styles.submitButton, (!formIsValid || isAuthLoading) && styles.disabledButton]}
      >
        {isAuthLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{t('auth.create_account_button', { defaultValue: 'إنشاء الحساب' })}</Text>
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
    marginTop: hp(4),
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

export default PasswordScreen;