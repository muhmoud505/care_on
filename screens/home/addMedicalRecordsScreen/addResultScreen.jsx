// addResultScreen.jsx - Fixed RTL

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const AddResultScreen = () => {
  const navigation = useNavigation();
  const { addRecord } = useMedicalRecords();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    testName: '',
    labName: '',
    date: null,
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) {
      showValidationError(
        'form',
        t('add_result.result_validation_error'),
        { duration: 4000 }
      );
      return;
    }
    setIsSubmitting(true);

    const descriptionObject = {
      labName: form.labName,
      notes: form.notes,
      date: form.date,
    };

    const payload = {
      type: 'lab_test',
      title: form.testName,
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
          t('add_result.result_created_success'),
          { duration: 3000 }
        );
        navigation.goBack();
      } else {
        // Enhanced error handling for result creation
        if (result.error?.includes('Network request failed') || result.error?.includes('network')) {
          showNetworkError(
            t('add_result.result_network_error'),
            () => handleSave() // Retry function
          );
        } else if (result.error?.includes('permission') || result.error?.includes('unauthorized')) {
          showPermissionError(
            t('add_result.result_permission_error'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('server') || result.error?.includes('500')) {
          showServerError(
            t('add_result.result_server_error'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('duplicate') || result.error?.includes('exists')) {
          showError(
            t('add_result.result_duplicate_error'),
            result.error || t('common.something_went_wrong'),
            { duration: 4000 }
          );
        } else if (result.error?.includes('file') || result.error?.includes('upload')) {
          showFileError(
            t('add_result.result_upload_failed'),
            { duration: 4000 }
          );
        } else {
          showError(
            t('add_result.result_creation_failed'),
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
          t('add_result.result_network_error'),
          () => handleSave() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('add_result.result_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('add_result.result_server_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('file') || error.message?.includes('upload')) {
        showFileError(
          t('add_result.result_upload_failed'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('add_result.result_creation_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('add_result.title')} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.formContainer, { direction: isRTL ? 'ltr' : 'ltr' }]}>
          <FormField
            title={t('add_result.test_name')}
            placeholder={t('add_result.test_name_placeholder')}
            value={form.testName}
            onChangeText={(text) => handleChange('testName', text)}
            error={errors.testName}
            required
          />

          <FormField
            title={t('add_result.lab_name')}
            placeholder={t('add_result.lab_name_placeholder')}
            value={form.labName}
            onChangeText={(text) => handleChange('labName', text)}
            error={errors.labName}
            required
          />

          <DatePick
            title={t('add_result.date')}
            placeholder={t('add_result.date_placeholder')}
            value={form.date}
            onDateSelect={(date) => handleChange('date', date)}
            error={errors.date}
            required
          />

          <FormField
            title={t('add_result.notes')}
            placeholder={t('add_result.notes_placeholder')}
            value={form.notes}
            onChangeText={(text) => handleChange('notes', text)}
            error={errors.notes}
            type="long"
          />

          <Uploader
            title={t('add_result.upload_file')}
            onFileSelect={(file) => handleChange('documents', file)}
            error={errors.documents}
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

export default AddResultScreen;