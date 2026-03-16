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
  const { addRecord } = useMedicalRecords();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) return;
    setIsSubmitting(true);

    // Map Arabic UI labels to API type strings
    const typeMap = {
      'كشف':   'diagnosis',
      'روشتة': 'prescription',
    };
    const apiType = typeMap[form.type] || 'diagnosis';

    // Build description as plain text — API expects a flat string, not JSON.
    // Only include fields that actually have a value.
    const descriptionParts = [];
    if (form.date)          descriptionParts.push(`${t('report.date', { defaultValue: 'التاريخ' })}: ${form.date}`);
    if (form.RequiredTests) descriptionParts.push(`${t('report.required_tests', { defaultValue: 'التحاليل المطلوبة' })}: ${form.RequiredTests}`);
    if (form.RequiredScans) descriptionParts.push(`${t('report.required_scans', { defaultValue: 'الاشعة المطلوبة' })}: ${form.RequiredScans}`);
    if (form.diagnosis)     descriptionParts.push(`${t('report.diagnosis', { defaultValue: 'التشخيص' })}: ${form.diagnosis}`);
    if (form.notes)         descriptionParts.push(`${t('report.medical_notes', { defaultValue: 'الوصف الطبي' })}: ${form.notes}`);

    const payload = {
      type:        apiType,
      title:       form.doctorName,
      description: descriptionParts.join('\n') || form.doctorName,
    };

    if (form.documents) {
      payload.documents = [form.documents];
    }

    const result = await addRecord(payload);
    setIsSubmitting(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: result.error,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.txt, { textAlign: 'right' }]}>
        {t('add_medicine.enter_following_data', { defaultValue: 'يرجي ادخال البيانات التالية' })}
      </Text>

      {/* اسم الدكتور */}
      <FormField
        title={t('add_report.doctor_name', { defaultValue: 'اسم الدكتور' })}
        placeholder={t('add_report.doctor_name_placeholder', { defaultValue: 'ادخل اسم الدكتور' })}
        value={form.doctorName}
        onChangeText={(text) => handleChange('doctorName', text)}
        error={errors.doctorName}
        required
      />

      {/* التاريخ */}
      <DatePick
        title={t('add_report.date', { defaultValue: 'التاريخ' })}
        placeholder={t('add_report.date_placeholder', { defaultValue: 'ادخل التاريخ' })}
        value={form.date}
        onDateSelect={(date) => handleChange('date', date)}
        error={errors.date}
      />

      {/* النوع */}
      <FormField
        title={t('add_report.type', { defaultValue: 'النوع' })}
        placeholder={t('add_report.type_placeholder', { defaultValue: 'اختر نوع الكشف' })}
        value={form.type}
        onChangeText={(v) => handleChange('type', v)}
        error={errors.type}
        type="picker"
        pickerItems={[
          { label: t('report_type.checkup', { defaultValue: 'كشف' }), value: t('report_type.checkup', { defaultValue: 'كشف' }) },
          { label: t('report_type.prescription', { defaultValue: 'روشتة' }), value: t('report_type.prescription', { defaultValue: 'روشتة' }) },
        ]}
        addOthers={false}
      />

      {/* التحاليل المطلوبة */}
      <FormField
        title={t('add_report.required_tests', { defaultValue: 'التحاليل المطلوبة' })}
        placeholder={t('add_report.required_tests_placeholder', { defaultValue: 'اختر التحاليل المطلوبة' })}
        value={form.RequiredTests}
        onChangeText={(v) => handleChange('RequiredTests', v)}
        error={errors.RequiredTests}
        type="picker"
        pickerItems={labItems}
        addOthers
        addLabel={t('add_report.create_new_test', { defaultValue: 'انشئ تحليل جديد' })}
        addModalTitle={t('add_report.add_new_test', { defaultValue: 'اضافة تحليل جديد' })}
        addArabicLabel={t('add_report.test_name_arabic', { defaultValue: 'اسم التحليل بالعربية' })}
        addEnglishLabel={t('add_report.test_name_english', { defaultValue: 'اسم التحليل بالانجليزية' })}
        addDescLabel={t('add_report.medical_description', { defaultValue: 'الوصف الطبي' })}
        onAddConfirm={(arabic, english, desc) => {
          const newItem = { label: arabic, value: arabic };
          setLabItems(prev => [...prev, newItem]);
          handleChange('RequiredTests', arabic);
        }}
      />

      {/* الاشعة المطلوبة */}
      <FormField
        title={t('add_report.required_scans', { defaultValue: 'الاشعة المطلوبة' })}
        placeholder={t('add_report.required_scans_placeholder', { defaultValue: 'اختر الاشعة المطلوبة' })}
        value={form.RequiredScans}
        onChangeText={(v) => handleChange('RequiredScans', v)}
        error={errors.RequiredScans}
        type="picker"
        pickerItems={scanItems}
        addOthers
        addLabel={t('add_report.create_new_scan', { defaultValue: 'انشئ اشعة جديدة' })}
        addModalTitle={t('add_report.add_new_scan', { defaultValue: 'اضافة اشعة جديدة' })}
        addArabicLabel={t('add_report.scan_name_arabic', { defaultValue: 'اسم الاشعة بالعربية' })}
        addEnglishLabel={t('add_report.scan_name_english', { defaultValue: 'اسم الاشعة الانجليزية' })}
        addDescLabel={t('add_report.medical_description', { defaultValue: 'الوصف الطبي' })}
        onAddConfirm={(arabic, english, desc) => {
          const newItem = { label: arabic, value: arabic };
          setScanItems(prev => [...prev, newItem]);
          handleChange('RequiredScans', arabic);
        }}
      />

      {/* التشخيص */}
      <FormField
        title={t('add_report.diagnosis', { defaultValue: 'التشخيص' })}
        placeholder={t('add_report.diagnosis_placeholder', { defaultValue: 'ادخل تشخيص الدكتور' })}
        value={form.diagnosis}
        onChangeText={(v) => handleChange('diagnosis', v)}
        error={errors.diagnosis}
      />

      {/* الوصف الطبي */}
      <FormField
        title={t('add_report.medical_notes', { defaultValue: 'الوصف الطبي' })}
        placeholder={t('add_report.medical_notes_placeholder', { defaultValue: 'ادخل وصف الدكتور' })}
        value={form.notes}
        onChangeText={(v) => handleChange('notes', v)}
        error={errors.notes}
        type="long"
      />

      {/* الروشتة او التقرير */}
      <Uploader
        title={t('add_report.prescription_or_report', { defaultValue: 'الروشتة او التقرير' })}
        onFileSelect={(file) => handleChange('documents', file)}
        error={errors.documents}
      />

      {/* حفظ */}
      <TouchableOpacity
        style={[styles.saveButton, (!formIsValid || isSubmitting) && styles.disabledButton]}
        onPress={handleSave}
        disabled={!formIsValid || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>{t('common.save', { defaultValue: 'حفظ' })}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <CustomHeader text={t('add_report.title', { defaultValue: 'تقارير الدكاترة' })} />
      <FlatList
        data={[]}
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={renderForm()}
      />
      <Toast />
    </SafeAreaView>
  );
};

export default AddReportScreen;

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