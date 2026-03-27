// addReportScreen.jsx - Fully Fixed RTL + Dynamic Pickers

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
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
  const navigation = useNavigation();
  const { addRecord, fetchReports } = useMedicalRecords();
  const isRTL = i18n.dir() === 'rtl';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [labItems, setLabItems] = useState([
    { label: t('lab_test.blood_test', { defaultValue: 'تحليل دم' }), value: t('lab_test.blood_test', { defaultValue: 'تحليل دم' }) },
    { label: t('lab_test.urine_test', { defaultValue: 'تحليل بول' }), value: t('lab_test.urine_test', { defaultValue: 'تحليل بول' }) },
    { label: t('lab_test.sugar_test', { defaultValue: 'تحليل سكر' }), value: t('lab_test.sugar_test', { defaultValue: 'تحليل سكر' }) },
  ]);

  const [scanItems, setScanItems] = useState([
    { label: t('scan.xray', { defaultValue: 'اشعة x ray' }), value: t('scan.xray', { defaultValue: 'اشعة x ray' }) },
    { label: t('scan.ct_scan', { defaultValue: 'اشعة مقطعية' }), value: t('scan.ct_scan', { defaultValue: 'اشعة مقطعية' }) },
    { label: t('scan.mri', { defaultValue: 'رنين مغناطيسي' }), value: t('scan.mri', { defaultValue: 'رنين مغناطيسي' }) },
  ]);

  const { form, errors, handleChange, checkFormValidity } = useForm({
    doctorName: '',
    date: null,
    type: '',
    RequiredTests: '',
    RequiredScans: '',
    diagnosis: '',
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) return;
    setIsSubmitting(true);

    const typeMap = {
      'كشف': 'diagnosis',
      'روشتة': 'consultation',
    };

    const apiType = typeMap[form.type] || 'diagnosis';

    const descriptionObj = {
      date: form.date,
      RequiredTests: form.RequiredTests,
      RequiredScans: form.RequiredScans,
      diagnosis: form.diagnosis,
      notes: form.notes,
    };

    const payload = {
      type: apiType,
      title: form.doctorName,
      description: JSON.stringify(descriptionObj),
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

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
          <View style={[styles.formContainer, { direction: isRTL ? 'rtl' : 'ltr' }]}>
            <Text style={[styles.txt, { textAlign: isRTL ? 'right' : 'left' }]}>
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
                { label: t('report_type.checkup', { defaultValue: 'كشف' }), value: t('report_type.checkup', { defaultValue: 'كشف' }) },
                { label: t('report_type.prescription', { defaultValue: 'روشتة' }), value: t('report_type.prescription', { defaultValue: 'روشتة' }) },
              ]}
            />

            {/* Lab Tests Picker with Add Others */}
            <FormField
              title={t('add_report.required_tests')}
              placeholder={t('add_report.required_tests_placeholder')}
              value={form.RequiredTests}
              onChangeText={(v) => handleChange('RequiredTests', v)}
              error={errors.RequiredTests}
              type="picker"
              pickerItems={labItems}
              addOthers
              addLabel={t('add_report.create_new_test')}
              addModalTitle={t('add_report.add_new_test')}
              addArabicLabel={t('add_report.test_name_arabic')}
              addEnglishLabel={t('add_report.test_name_english')}
              onAddConfirm={(arabic) => {
                const newItem = { label: arabic, value: arabic };
                setLabItems(prev => [...prev, newItem]);
                handleChange('RequiredTests', arabic);
              }}
            />

            {/* Scans Picker with Add Others */}
            <FormField
              title={t('add_report.required_scans')}
              placeholder={t('add_report.required_scans_placeholder')}
              value={form.RequiredScans}
              onChangeText={(v) => handleChange('RequiredScans', v)}
              error={errors.RequiredScans}
              type="picker"
              pickerItems={scanItems}
              addOthers
              addLabel={t('add_report.create_new_scan')}
              addModalTitle={t('add_report.add_new_scan')}
              addArabicLabel={t('add_report.scan_name_arabic')}
              addEnglishLabel={t('add_report.scan_name_english')}
              onAddConfirm={(arabic) => {
                const newItem = { label: arabic, value: arabic };
                setScanItems(prev => [...prev, newItem]);
                handleChange('RequiredScans', arabic);
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