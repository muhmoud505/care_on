import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const Forget = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { form, errors, handleChange, checkFormValidity } = useForm({
    nationalId: '',
  });

  const formIsValid = checkFormValidity();

  const handleNext = () => {
    if (!formIsValid) return;
    // Navigate to the code verification screen
    navigation.navigate('code', { nationalId: form.nationalId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.reset_password', { defaultValue: 'إعادة تعيين كلمة السر' })} />
      <View style={styles.container}>
        <Text style={styles.infoText}>
          {t('auth.enter_national_id_to_reset', { defaultValue: 'برجاء إدخال رقمك القومي لإعادة تعيين كلمة السر' })}
        </Text>

        <FormField
          title={t('auth.national_id', { defaultValue: 'الرقم القومي' })}
          value={form.nationalId}
          onChangeText={(text) => handleChange('nationalId', text)}
          error={errors.nationalId}
          keyboardType="numeric"
          required
          placeholder={t('auth.enter_national_id', { defaultValue: 'ادخل رقمك القومي' })}
        />

        <TouchableOpacity
          style={[styles.button, !formIsValid && styles.disabledButton]}
          onPress={handleNext}
          disabled={!formIsValid}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{t('common.next', { defaultValue: 'التالي' })}</Text>
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
    width: wp(90),
    marginTop: hp(5),
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