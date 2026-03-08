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
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useAuth } from '../../../contexts/authContext';
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';

const AddReportScreen = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form, errors, handleChange, checkFormValidity } = useForm({
   
    doctorName: '',
    RequiredTests: '',
    type: '',
    RequiredScans: '',
    date: null,
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) return;
    setIsSubmitting(true);

    const descriptionObject = {
      doctorName: form.doctorName,
      specialty: form.specialty,
      date: form.date,
      notes: form.notes,
    };

    const payload = {
      type: 'diagnosis',
      title: form.reportTitle,
      description: JSON.stringify(descriptionObject),
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
  }

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <CustomHeader text={t('add_report.title')} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
          
        <View style={styles.formContainer}>
         <Text style={[styles.txt,{textAlign:'left'}]}>{t('add_medicine.enter_following_data')} </Text>
       
          
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
            
          />
          <FormField
            title={'النوع'}
            placeholder={'اختر نوع الكشف'}
            value={form.type}
            onChangeText={(t) => {handleChange('type', t)}}
            error={errors.type}
            type={'picker'}
            pickerItems={[{ label: 'كشف', value: 'كشف' }, { label: 'روشتة', value: 'روشتة' }]}
            addOthers={false}
            
          />
          <FormField
            title={"التحاليل المطلوبة"}
            placeholder={'اختر التحاليل المطلوبة'}
            value={form.RequiredTests}
            onChangeText={(t) => {handleChange('RequiredTests', t)}}
            error={errors.RequiredTests}
            type={'picker'}
            pickerItems={[{ label: 'تحليل دم', value: 'تحليل دم' }, { label: t('profile.female'), value: 'female' }]}
            addLabel={'انشئ تحليل جديد'}
          />
          <FormField
            title={"الاشعة المطلوبة"}
            placeholder={'اختر الاشعة المطلوبة'}
            value={form.RequiredScans}
            onChangeText={(t) => {handleChange('RequiredScans', t)}}
            error={errors.RequiredScans}
            type={'picker'}
            pickerItems={[{ label: 'اشعة x ray', value: 'اشعة x ray' }]}
            addLabel={'انشئ اشعة جديدة'}
          />
           

          <Uploader
            title={t('الروشتة او التقرير')}
            onFileSelect={(file) => handleChange('documents', file)}
            error={errors.documents}
          
          />
          <TouchableOpacity style={[styles.saveButton, (!formIsValid || isSubmitting) && styles.disabledButton]} onPress={handleSave} disabled={!formIsValid || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AddReportScreen

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
    backgroundColor: '#007AFF', // Example color, change to your theme color
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
   txt:{
    fontWeight:'700',
   fontSize: Math.min(wp(5), 20),
   marginBottom: hp(2)
  }
})