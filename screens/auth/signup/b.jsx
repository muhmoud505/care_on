import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import { hp, wp } from '../../../utils/responsive';

const S2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userType, isParentAddingChild } = route.params || {};
  console.log('S2 Screen Params:', route.params); // Debugging line
     
  const { t } = useTranslation();
  // If userType is passed (from account screen), set it, otherwise start fresh.
  const [flowType, setFlowType] = useState(userType || null); // 'adult' or 'child'
  const [formData, setFormData] = useState({
    birthdate: null,
    gender: '',
  });

  // This effect ensures that if the screen receives new parameters (e.g., from the Account screen),
  // it updates its internal state to reflect the new flow.
  useEffect(() => {
    if (userType) {
      setFlowType(userType);
    }
  }, [userType]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    return formData.birthdate && formData.gender;
  }, [formData]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const parts = birthDate.split('/');
    const birth = new Date(parts[2], parts[1] - 1, parts[0]);
    if (birth > today) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
    return age;
  };

  const handleProceed = () => {
    if (!isFormValid) return;

    const age = calculateAge(formData.birthdate);

    // Reformat the date from DD/MM/YYYY to YYYY-MM-DD for the API
    const parts = formData.birthdate.split('/');
    const formattedApiDate = `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;

    const dataToPass = { 
      ...formData, 
      birthdate: formattedApiDate, // Use the API-friendly format
      age,
      isParentAddingChild: !!isParentAddingChild, // Ensure the flag is passed as a boolean
    };

    if (flowType === 'adult') {
      if (age < 18) {
        Alert.alert("Error", "Users must be 18 or older to create a personal account.");
        return;
      }
      navigation.navigate('Signup', {
        title: t('auth.create_account', { defaultValue: 'إنشاء حساب' }),
        isChild: false,
        ...dataToPass,
      });
    } else {
      if (age >= 18) {
        Alert.alert("Error", "For users 18 and over, please create a personal account.");
        return;
      }
      navigation.navigate('signupBaby', {
        title: t('auth.create_child_account', { defaultValue: 'إنشاء حساب لطفل' }),
        ...dataToPass,
      });
    }
  };

  const resetFlow = () => {
    setFlowType(null);
    setFormData({ birthdate: null, gender: '' }); 
    // If we came from the account screen, pressing back should go back to the account screen,
    // not the selection page within S2.
    if (isParentAddingChild) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader text={t('auth.signup', { defaultValue: 'Sign up' })} />
      
      {!flowType ? (
        <View style={styles.container}>
          <Text style={styles.title}>{t('auth.choose_account_type', { defaultValue: 'اختر نوع الحساب' })}</Text>

          <TouchableOpacity style={styles.card} onPress={() => setFlowType('adult')} activeOpacity={0.7}>
            <Image source={require('../../../assets2/images/img1.png')} style={styles.icon} />
            <Text style={styles.cardText}>{t('auth.personal_account', { defaultValue: 'حساب شخصي' })}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setFlowType('child')} activeOpacity={0.7}>
            <Image source={require('../../../assets2/images/img2.png')} style={styles.icon} />
            <Text style={styles.cardText}>{t('auth.child_account', { defaultValue: 'حساب لطفل' })}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {flowType === 'adult' ? 'ادخل بياناتك' : 'ادخل بيانات الطفل'}
          </Text>
          <View style={{rowGap: hp(3)}}>
          <DatePick 
            title={t('profile.dob', { defaultValue: 'تاريخ الميلاد' })}
            required
            placeholder={'ادخل تاريخ الميلاد'}
            value={formData.birthdate}
            onDateSelect={(date) => handleFieldChange('birthdate', date)}
          />
          <FormField
            required
            title={'الجنس'}
            placeholder={'اختر الجنس'}
            value={formData.gender}
            onChangeText={(value) => handleFieldChange('gender', value)} // This line might need adjustment based on how your onChangeText works with picker
            type="picker"
            pickerItems={[{ label: 'ذكر', value: 'male' }, { label: 'أنثى', value: 'female' }]}
          />
          </View>
          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.disabledButton]}
            onPress={handleProceed}
            disabled={!isFormValid}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>{t('common.next', { defaultValue: 'Next' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={resetFlow}>
            <Text style={styles.backButtonText}>{t('common.back', { defaultValue: 'Back' })}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default S2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: wp(5),
  },
  title: {
    fontSize: Math.min(wp(6), 24),
    fontWeight: 'bold',
    marginBottom: hp(5),
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f4ff',
    width: '100%',
    paddingVertical: hp(3),
    paddingHorizontal: wp(5),
    borderRadius: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: '#014CC4',
  },
  icon: {
    width: wp(12),
    height: wp(12),
    resizeMode: 'contain',
    marginRight: wp(4),
  },
  cardText: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: '600',
    color: '#014CC4',
  },
  backButton: {
    marginTop: hp(3),
    padding: wp(3),
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Math.min(wp(4.5), 18),
    color: '#014CC4',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(5), 20),
  },
  disabledButton: {
    opacity: 0.5,
  },
});