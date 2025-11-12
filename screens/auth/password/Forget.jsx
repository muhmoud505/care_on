import { useNavigation } from '@react-navigation/native';
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
import { useAuth } from '../../../contexts/authContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const Forget = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    email: '',
  });
  const { forgotPassword, isAuthLoading } = useAuth();

  const formIsValid = checkFormValidity();

  const handleNext = async () => {
    if (!formIsValid) return;
    try {
      // Call the API to request a password reset code
      await forgotPassword({ email: form.email });

      // On success, navigate to the code verification screen
      navigation.navigate('code', { email: form.email });
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password')} />
      <View style={styles.container}>
        <Text style={styles.infoText}>
          {t('auth.enter_email_to_reset')}
        </Text>

        <FormField
          title={t('auth.email')}
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          error={errors.email}
          keyboardType="email-address"
          required
          placeholder={t('auth.email_placeholder')}
        />

        <TouchableOpacity
          style={[styles.button, (!formIsValid || isAuthLoading) && styles.disabledButton]}
          onPress={handleNext}
          disabled={!formIsValid || isAuthLoading}
          activeOpacity={0.7}
        >
          {isAuthLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('common.next')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight
    
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
  },
  infoText: {
    fontSize: Math.min(wp(4.5), 18),
    textAlign: 'center',
    marginHorizontal: wp(5),
    marginBottom: hp(3),
    color: '#333',
  },
  button: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
    marginBottom: hp(8),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Forget;