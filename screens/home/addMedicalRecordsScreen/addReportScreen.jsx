// addReportScreen.jsx - Fixed: send lab_tests/radiology_exams with proper id format

import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
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

const AddReportScreen = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigation = useNavigation();
  const {
    addRecord,
    fetchReports,
    labTests,
    radiologyExams,
    fetchLabTests,
    fetchRadiologyExams,
  } = useMedicalRecords();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for custom items added via "Add Others"
  const [customLabTests, setCustomLabTests] = useState([]);
  const [customRadiologyExams, setCustomRadiologyExams] = useState([]);

  useEffect(() => {
    fetchLabTests();
    fetchRadiologyExams();
  }, [fetchLabTests, fetchRadiologyExams]);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    doctorName: '',
    date: null,
    type: '',
    RequiredTests: [],   // stores selected IDs (strings)
    RequiredScans: [],   // stores selected IDs (strings)
    diagnosis: '',
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) {
      showValidationError('form', t('add_report.report_validation_error'));
      return;
    }
    
    setIsSubmitting(true);

    const typeMap = {
      'كشف':  'diagnosis',
      'روشتة': 'consultation',
    };
    const apiType = typeMap[form.type] || 'diagnosis';

    const descriptionObj = {
      date:      form.date,
      diagnosis: form.diagnosis,
      notes:     form.notes,
    };

    // Separate custom items (send as name) from existing items (send as id)
    const selectedCustomLabTests = form.RequiredTests.filter(id => id.startsWith('custom_'));
    const validLabTests = form.RequiredTests.filter(id => !id.startsWith('custom_'));
    const selectedCustomRadiologyExams = form.RequiredScans.filter(id => id.startsWith('custom_'));
    const validRadiologyExams = form.RequiredScans.filter(id => !id.startsWith('custom_'));

    // Build payload with proper structure for server
    const payload = {
      type:            apiType,
      title:           form.doctorName,
      description:     JSON.stringify(descriptionObj),
      // Existing items: send as { id }
      lab_tests: validLabTests.map(id => ({ id })),
      radiology_exams: validRadiologyExams.map(id => ({ id })),
      // Custom items: send as new_lab_tests and new_radiology_exams with name[en]/name[ar]
      new_lab_tests: selectedCustomLabTests.map(customId => {
        const customItem = customLabTests.find(item => item.value === customId);
        return {
          name: {
            en: customItem?.label || customId.replace('custom_', ''),
            ar: customItem?.label || customId.replace('custom_', '')
          }
        };
      }),
      new_radiology_exams: selectedCustomRadiologyExams.map(customId => {
        const customItem = customRadiologyExams.find(item => item.value === customId);
        return {
          name: {
            en: customItem?.label || customId.replace('custom_', ''),
            ar: customItem?.label || customId.replace('custom_', '')
          }
        };
      }),
      patient_id: 1,
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

    console.log('=== Payload to send ===', JSON.stringify(payload, null, 2));

    try {
      const result = await addRecord(payload);
      setIsSubmitting(false);

      if (result.success) {
        await fetchReports({ force: true });
        showSuccess(
          t('common.success'),
          t('add_report.report_created_success'),
          { duration: 3000 }
        );
        navigation.goBack();
      } else {
        // Enhanced error handling with specific error types
        if (result.error?.message?.includes('Network request failed') || result.error?.message?.includes('network')) {
          showNetworkError(
            t('add_report.report_network_error'),
            () => handleSave() // Retry function
          );
        } else if (result.error?.message?.includes('file') || result.error?.message?.includes('upload') || result.error?.message?.includes('size')) {
          showFileError(form.documents?.name || 'report document');
        } else if (result.error?.message?.includes('permission') || result.error?.message?.includes('unauthorized')) {
          showPermissionError(
            t('add_report.report_permission_error'),
            { duration: 4000 }
          );
        } else if (result.error?.message?.includes('server') || result.error?.message?.includes('500')) {
          showServerError(
            t('add_report.report_server_error'),
            { duration: 4000 }
          );
        } else {
          showError(
            t('add_report.report_creation_failed'),
            result.error?.message || t('common.something_went_wrong'),
            { duration: 4000 }
          );
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      
      // Enhanced error handling for exceptions
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('add_report.report_network_error'),
          () => handleSave() // Retry function
        );
      } else if (error.message?.includes('file') || error.message?.includes('upload')) {
        showFileError(form.documents?.name || 'report document');
      } else {
        showError(
          t('add_report.report_creation_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text={t('add_report.title')} />

      <FlatList
        data={[]}
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <View style={[styles.formContainer,{direction:isRTL ? 'ltr' : 'ltr'}]}>
            <Text style={[styles.txt,{direction:isRTL ? 'rtl' : 'ltr'}]}>
              {t('add_medicine.enter_following_data')}
            </Text>

            <FormField
              title={t('add_report.doctor_name')}
              placeholder={t('add_report.doctor_name_placeholder')}
              value={form.doctorName}
              onChangeText={(text) => handleChange('doctorName', text)}
              error={errors.doctorName}
              required
            />

            <DatePick
              title={t('add_report.date')}
              placeholder={t('add_report.date_placeholder')}
              value={form.date}
              onDateSelect={(date) => handleChange('date', date)}
              error={errors.date}
              required
            />

            <FormField
              title={t('add_report.type')}
              placeholder={t('add_report.type_placeholder')}
              value={form.type}
              onChangeText={(v) => handleChange('type', v)}
              error={errors.type}
              type="picker"
              pickerItems={[
                { label: t('report_type.checkup',      { defaultValue: 'كشف' }),   value: t('report_type.checkup',      { defaultValue: 'كشف' }) },
                { label: t('report_type.prescription', { defaultValue: 'روشتة' }), value: t('report_type.prescription', { defaultValue: 'روشتة' }) },
              ]}
            />

            {/* ✅ pickerItems use item.id as value so selection stores the real DB id */}
            <FormField
              title={t('add_report.required_tests')}
              placeholder={t('add_report.required_tests_placeholder')}
              value={form.RequiredTests}
              onChangeText={(v) => handleChange('RequiredTests', v)}
              error={errors.RequiredTests}
              type="picker"
              pickerItems={[...labTests.map(item => ({
                label: item.label,
                value: String(item.id), // ✅ value = id, not name
              })), ...customLabTests]}
              multiSelect={true}
              addOthers
              addLabel={t('add_report.create_new_test')}
              addModalTitle={t('add_report.add_new_test')}
              addArabicLabel={t('add_report.test_name_arabic')}
              addEnglishLabel={t('add_report.test_name_english')}
              onAddConfirm={(arabic) => {
                const customId = `custom_${Date.now()}`;
                setCustomLabTests(prev => [...prev, { label: arabic, value: customId }]);
                const currentTests = form.RequiredTests || [];
                handleChange('RequiredTests', [...currentTests, customId]);
              }}
            />

            <FormField
              title={t('add_report.required_scans')}
              placeholder={t('add_report.required_scans_placeholder')}
              value={form.RequiredScans}
              onChangeText={(v) => handleChange('RequiredScans', v)}
              error={errors.RequiredScans}
              type="picker"
              pickerItems={[...radiologyExams.map(item => ({
                label: item.label,
                value: String(item.id), // ✅ value = id, not name
              })), ...customRadiologyExams]}
              multiSelect={true}
              addOthers
              addLabel={t('add_report.create_new_scan')}
              addModalTitle={t('add_report.add_new_scan')}
              addArabicLabel={t('add_report.scan_name_arabic')}
              addEnglishLabel={t('add_report.scan_name_english')}
              onAddConfirm={(arabic) => {
                const customId = `custom_${Date.now()}`;
                setCustomRadiologyExams(prev => [...prev, { label: arabic, value: customId }]);
                const currentScans = form.RequiredScans || [];
                handleChange('RequiredScans', [...currentScans, customId]);
              }}
            />

            <FormField
              title={t('add_report.diagnosis')}
              placeholder={t('add_report.diagnosis_placeholder')}
              value={form.diagnosis}
              onChangeText={(v) => handleChange('diagnosis', v)}
              error={errors.diagnosis}
            />

            <FormField
              title={t('add_report.medical_notes')}
              placeholder={t('add_report.medical_notes_placeholder')}
              value={form.notes}
              onChangeText={(v) => handleChange('notes', v)}
              error={errors.notes}
              type="long"
            />

            <Uploader
              title={t('add_report.prescription_or_report')}
              onFileSelect={(file) => handleChange('documents', file)}
              error={errors.documents}
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!formIsValid || isSubmitting) && styles.disabledButton,
              ]}
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
        }
      />
      <Toast />
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
    paddingBottom: hp(5),
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
  txt: {
    fontWeight: '700',
    fontSize: Math.min(wp(5), 20),
    marginBottom: hp(2),
  },
});

export default AddReportScreen;