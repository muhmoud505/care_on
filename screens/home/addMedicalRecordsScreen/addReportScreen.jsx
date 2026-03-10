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
    { label: 'تحليل دم', value: 'تحليل دم' },
    { label: 'تحليل بول', value: 'تحليل بول' },
    { label: 'تحليل سكر', value: 'تحليل سكر' },
  ]);
  const [scanItems, setScanItems] = useState([
    { label: 'اشعة x ray', value: 'اشعة x ray' },
    { label: 'اشعة مقطعية', value: 'اشعة مقطعية' },
    { label: 'رنين مغناطيسي', value: 'رنين مغناطيسي' },
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
    if (form.date)          descriptionParts.push(`التاريخ: ${form.date}`);
    if (form.RequiredTests) descriptionParts.push(`التحاليل المطلوبة: ${form.RequiredTests}`);
    if (form.RequiredScans) descriptionParts.push(`الاشعة المطلوبة: ${form.RequiredScans}`);
    if (form.diagnosis)     descriptionParts.push(`التشخيص: ${form.diagnosis}`);
    if (form.notes)         descriptionParts.push(`الوصف الطبي: ${form.notes}`);

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
        title={'النوع'}
        placeholder={'اختر نوع الكشف'}
        value={form.type}
        onChangeText={(v) => handleChange('type', v)}
        error={errors.type}
        type="picker"
        pickerItems={[
          { label: 'كشف', value: 'كشف' },
          { label: 'روشتة', value: 'روشتة' },
        ]}
        addOthers={false}
      />

      {/* التحاليل المطلوبة */}
      <FormField
        title={'التحاليل المطلوبة'}
        placeholder={'اختر التحاليل المطلوبة'}
        value={form.RequiredTests}
        onChangeText={(v) => handleChange('RequiredTests', v)}
        error={errors.RequiredTests}
        type="picker"
        pickerItems={labItems}
        addOthers
        addLabel={'انشئ تحليل جديد'}
        addModalTitle={'اضافة تحليل جديد'}
        addArabicLabel={'اسم التحليل بالعربية'}
        addEnglishLabel={'اسم التحليل بالانجليزية'}
        addDescLabel={'الوصف الطبي'}
        onAddConfirm={(arabic, english, desc) => {
          const newItem = { label: arabic, value: arabic };
          setLabItems(prev => [...prev, newItem]);
          handleChange('RequiredTests', arabic);
        }}
      />

      {/* الاشعة المطلوبة */}
      <FormField
        title={'الاشعة المطلوبة'}
        placeholder={'اختر الاشعة المطلوبة'}
        value={form.RequiredScans}
        onChangeText={(v) => handleChange('RequiredScans', v)}
        error={errors.RequiredScans}
        type="picker"
        pickerItems={scanItems}
        addOthers
        addLabel={'انشئ اشعة جديدة'}
        addModalTitle={'اضافة اشعة جديدة'}
        addArabicLabel={'اسم الاشعة بالعربية'}
        addEnglishLabel={'اسم الاشعة الانجليزية'}
        addDescLabel={'الوصف الطبي'}
        onAddConfirm={(arabic, english, desc) => {
          const newItem = { label: arabic, value: arabic };
          setScanItems(prev => [...prev, newItem]);
          handleChange('RequiredScans', arabic);
        }}
      />

      {/* التشخيص */}
      <FormField
        title={'التشخيص'}
        placeholder={'ادخل تشخيص الدكتور'}
        value={form.diagnosis}
        onChangeText={(v) => handleChange('diagnosis', v)}
        error={errors.diagnosis}
      />

      {/* الوصف الطبي */}
      <FormField
        title={'الوصف الطبي'}
        placeholder={'ادخل وصف الدكتور'}
        value={form.notes}
        onChangeText={(v) => handleChange('notes', v)}
        error={errors.notes}
        type="long"
      />

      {/* الروشتة او التقرير */}
      <Uploader
        title={'الروشتة او التقرير'}
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