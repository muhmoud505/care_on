// addEshaaScreen.jsx - Fixed RTL
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
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
  const { addRecord, radiologyExams, fetchRadiologyExams } = useMedicalRecords();
  console.log(radiologyExams);
  
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customRadiologyExams, setCustomRadiologyExams] = useState([]);

  // Fetch radiology exams when component mounts
  useEffect(() => {
    fetchRadiologyExams();
  }, [fetchRadiologyExams]);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    xrayName: '',
    notes: '',
    RequiredScans: [], // ✅ Stores selected IDs (strings)
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

    // ✅ Separate custom scans from existing DB scans (same as addReportScreen)
    const selectedCustomRadiologyExams = form.RequiredScans.filter(id => id.startsWith('custom_'));
    const validRadiologyExams = form.RequiredScans.filter(id => !id.startsWith('custom_'));

    // ✅ Build payload with proper structure for server
    const payload = {
      type: 'radiology',
      title: form.xrayName,
      description: form.notes,
      // ✅ Existing items: send as { id }
      radiology_exams: validRadiologyExams.map(id => ({ id })),
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

    // ✅ Only add new_radiology_exams if custom items exist
    if (selectedCustomRadiologyExams.length > 0) {
      payload.new_radiology_exams = selectedCustomRadiologyExams.map((customId, index) => {
        const customItem = customRadiologyExams.find(item => item.value === customId);
        return {
          name: {
            en: customItem?.label || `Custom Radiology Exam ${index + 1}`,
            ar: customItem?.label || `Custom Radiology Exam ${index + 1}` 
          }
        };
      });
    }

    console.log('=== Eshaa Payload ===', JSON.stringify(payload, null, 2));

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