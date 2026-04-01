// addMedicineScreen.jsx - Fixed RTL

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';
import {
  showError,
  showNetworkError,
  showPermissionError,
  showServerError,
  showSuccess,
  showValidationError,
} from '../../../utils/toastService';

const AddMedicineScreen = () => {
  const navigation = useNavigation();
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    medicineName: '',
    dosage: '',
    startDate: null,
    endDate: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) {
      showValidationError('form', t('add_medicine.medicine_validation_error'), t);
      return;
    }
    
    setIsSubmitting(true);

    // Validate date logic
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      showError(
        t('add_medicine.medicine_date_error'),
        t('add_medicine.medicine_date_error'),
        t,
        { duration: 4000 }
      );
      setIsSubmitting(false);
      return;
    }

    const descriptionObject = {
      dosage: form.dosage,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const payload = {
      type: 'prescription',
      title: form.medicineName,
      description: JSON.stringify(descriptionObject),
    };

    try {
      const result = await addRecord(payload);
      setIsSubmitting(false);

      if (result.success) {
        showSuccess(
          t('common.success'),
          t('add_medicine.medicine_created_success'),
          t,
          { duration: 3000 }
        );
        navigation.goBack();
      } else {
        // Enhanced error handling with specific error types
        if (result.error?.message?.includes('Network request failed') || result.error?.message?.includes('network')) {
          showNetworkError(
            t('add_medicine.medicine_network_error'),
            () => handleSave(), // Retry function
            t
          );
        } else if (result.error?.message?.includes('permission') || result.error?.message?.includes('unauthorized')) {
          showPermissionError(
            t('add_medicine.medicine_permission_error'),
            t,
            { duration: 4000 }
          );
        } else if (result.error?.message?.includes('duplicate') || result.error?.message?.includes('exists')) {
          showError(
            t('add_medicine.medicine_duplicate_error'),
            result.error?.message || t('common.something_went_wrong'),
            t,
            { duration: 4000 }
          );
        } else if (result.error?.message?.includes('server') || result.error?.message?.includes('500')) {
          showServerError(
            t('add_medicine.medicine_server_error'),
            t,
            { duration: 4000 }
          );
        } else {
          showError(
            t('add_medicine.medicine_creation_failed'),
            result.error?.message || t('common.something_went_wrong'),
            t,
            { duration: 4000 }
          );
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      
      // Enhanced error handling for exceptions
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('add_medicine.medicine_network_error'),
          () => handleSave(), // Retry function
          t
        );
      } else {
        showError(
          t('add_medicine.medicine_creation_failed'),
          error.message || t('common.something_went_wrong'),
          t,
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('add_medicine.title')} />

      <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
        <Text style={[styles.txt, { textAlign: isRTL ? 'right' : 'left' }]}>
          {t('add_medicine.enter_following_data')}
        </Text>

        <FormField
          title={t('add_medicine.medicine_name')}
          placeholder={t('add_medicine.medicine_name_placeholder')}
          value={form.medicineName}
          onChangeText={(text) => handleChange('medicineName', text)}
          error={errors.medicineName}
          required
        />

        <FormField
          title={t('add_medicine.dosage')}
          placeholder={t('add_medicine.dosage_placeholder')}
          value={form.dosage}
          onChangeText={(text) => handleChange('dosage', text)}
          error={errors.dosage}
          required
        />

        <DatePick
          title={t('add_medicine.start_date')}
          required
          placeholder={t('add_medicine.start_date_placeholder')}
          value={form.startDate}
          onDateSelect={(date) => handleChange('startDate', date)}
          error={errors.startDate}
        />

        <DatePick
          title={t('add_medicine.end_date')}
          required
          placeholder={t('add_medicine.end_date_placeholder')}
          value={form.endDate}
          onDateSelect={(date) => handleChange('endDate', date)}
          error={errors.endDate}
        />

        <TouchableOpacity
          style={[styles.nextButton, (!formIsValid || isSubmitting) && styles.disabledButton]}
          onPress={handleSave}
          disabled={!formIsValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  formContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  txt: {
    fontWeight: '700',
    fontSize: Math.min(wp(5), 20),
    marginBottom: hp(2),
  },
});

export default AddMedicineScreen;