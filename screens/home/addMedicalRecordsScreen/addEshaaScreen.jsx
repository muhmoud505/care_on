// addEshaaScreen.jsx - Fixed RTL

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';
import {
    showError,
    showFileError,
    showNetworkError,
    showPermissionError,
    showServerError,
    showSuccess,
    showValidationError,
} from '../../../utils/toastService';

const AddEshaaScreen = () => {
  const navigation = useNavigation();
  const { addRecord } = useMedicalRecords();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    xrayName: '',
    date: null,
    labName: '',
    doctorName: '',
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) {
      showValidationError(
        'form',
        t('add_eshaa.eshaa_validation_error'),
        { duration: 4000 }
      );
      return;
    }
    setIsSubmitting(true);

    const descriptionObject = {
      date: form.date,
      labName: form.labName,
      doctorName: form.doctorName,
      notes: form.notes,
    };

    const payload = {
      type: 'radiology',
      title: form.xrayName,
      description: JSON.stringify(descriptionObject),
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

    try {
      const result = await addRecord(payload);
      setIsSubmitting(false);

      if (result.success) {
        showSuccess(
          t('common.success'),
          t('add_eshaa.eshaa_created_success'),
          { duration: 3000 }
        );
        navigation.goBack();
      } else {
        // Enhanced error handling for eshaa creation
        if (result.error?.includes('Network request failed') || result.error?.includes('network')) {
          showNetworkError(
            t('add_eshaa.eshaa_network_error'),
            () => handleSave() // Retry function
          );
        } else if (result.error?.includes('permission') || result.error?.includes('unauthorized')) {
          showPermissionError(
            t('add_eshaa.eshaa_permission_error'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('server') || result.error?.includes('500')) {
          showServerError(
            t('add_eshaa.eshaa_server_error'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('duplicate') || result.error?.includes('exists')) {
          showError(
            t('add_eshaa.eshaa_duplicate_error'),
            result.error || t('common.something_went_wrong'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('file') || result.error?.includes('upload')) {
          showFileError(
            t('add_eshaa.eshaa_upload_failed'),
            { duration: 4000 }
          );
        } else {
          showError(
            t('add_eshaa.eshaa_creation_failed'),
            result.error || t('common.something_went_wrong'),
            { duration: 4000 }
          );
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      // Enhanced error handling for exceptions
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('add_eshaa.eshaa_network_error'),
          () => handleSave() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('add_eshaa.eshaa_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('add_eshaa.eshaa_server_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('file') || error.message?.includes('upload')) {
        showFileError(
          t('add_eshaa.eshaa_upload_failed'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('add_eshaa.eshaa_creation_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('add_eshaa.title')} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
          <FormField
            title={t('add_eshaa.xray_name')}
            placeholder={t('add_eshaa.xray_name_placeholder')}
            value={form.xrayName}
            onChangeText={(text) => handleChange('xrayName', text)}
            error={errors.xrayName}
            required
          />

          <DatePick
            title={t('add_eshaa.date')}
            placeholder={t('add_eshaa.date_placeholder')}
            value={form.date}
            onDateSelect={(date) => handleChange('date', date)}
            error={errors.date}
            required
          />

          <FormField
            title={t('add_eshaa.lab_name')}
            placeholder={t('add_eshaa.lab_name_placeholder')}
            value={form.labName}
            onChangeText={(text) => handleChange('labName', text)}
            error={errors.labName}
            required
          />

          <FormField
            title={t('add_eshaa.doctor_name')}
            placeholder={t('add_eshaa.doctor_name_placeholder')}
            value={form.doctorName}
            onChangeText={(text) => handleChange('doctorName', text)}
            error={errors.doctorName}
            required
          />

          <FormField
            title={t('add_eshaa.notes')}
            placeholder={t('add_eshaa.notes_placeholder')}
            value={form.notes}
            onChangeText={(text) => handleChange('notes', text)}
            error={errors.notes}
            type="long"
          />

          <Uploader
            title={t('add_eshaa.upload_file')}
            onFileSelect={(file) => handleChange('documents', file)}
            error={errors.documents}
            required
          />

          <TouchableOpacity
            style={[styles.saveButton, (!formIsValid || isSubmitting) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!formIsValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    paddingTop: hp(3),
    paddingBottom: hp(4),
    paddingHorizontal: wp(5),
  },
  saveButton: {
    backgroundColor: '#014CC4',
    borderRadius: 8,
    paddingVertical: hp(2),
    alignItems: 'center',
    marginTop: hp(4),
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddEshaaScreen;