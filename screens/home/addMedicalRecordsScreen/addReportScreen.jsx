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
    if (!formIsValid) return;
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

    // ✅ Build lab_tests and radiology_exams as arrays of { id } objects
    // The server expects: lab_tests[0][id], lab_tests[1][id], ...
    // form.RequiredTests stores the selected values (which are the item IDs from pickerItems)
    const lab_tests = form.RequiredTests.map(id => ({ id }));
    const radiology_exams = form.RequiredScans.map(id => ({ id }));

    const payload = {
      type:            apiType,
      title:           form.doctorName,
      description:     JSON.stringify(descriptionObj),
      lab_tests,        // array of { id } — handled by context's FormData builder
      radiology_exams,  // array of { id } — handled by context's FormData builder
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

    console.log('=== Payload to send ===', JSON.stringify(payload, null, 2));

    const result = await addRecord(payload);
    setIsSubmitting(false);

    if (result.success) {
      await fetchReports({ force: true });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: result.error,
        position: 'top',
      });
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
              pickerItems={labTests.map(item => ({
                label: item.label,
                value: String(item.id), // ✅ value = id, not name
              }))}
              multiSelect={true}
              addOthers
              addLabel={t('add_report.create_new_test')}
              addModalTitle={t('add_report.add_new_test')}
              addArabicLabel={t('add_report.test_name_arabic')}
              addEnglishLabel={t('add_report.test_name_english')}
              onAddConfirm={(arabic) => {
                // For custom items we don't have a real id yet — use name as fallback
                handleChange('RequiredTests', [...form.RequiredTests, arabic]);
              }}
            />

            <FormField
              title={t('add_report.required_scans')}
              placeholder={t('add_report.required_scans_placeholder')}
              value={form.RequiredScans}
              onChangeText={(v) => handleChange('RequiredScans', v)}
              error={errors.RequiredScans}
              type="picker"
              pickerItems={radiologyExams.map(item => ({
                label: item.label,
                value: String(item.id), // ✅ value = id, not name
              }))}
              multiSelect={true}
              addOthers
              addLabel={t('add_report.create_new_scan')}
              addModalTitle={t('add_report.add_new_scan')}
              addArabicLabel={t('add_report.scan_name_arabic')}
              addEnglishLabel={t('add_report.scan_name_english')}
              onAddConfirm={(arabic) => {
                handleChange('RequiredScans', [...form.RequiredScans, arabic]);
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
