import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'
import DatePick from '../../../components/datePicker'
import FormField from '../../../components/FormInput'
import Uploader from '../../../components/Uploader'
import { useAuth } from '../../../contexts/authContext'
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext'
import useForm from '../../../hooks/useForm'
import { hp, wp } from '../../../utils/responsive'

const AddReportScreen = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form, errors, handleChange, checkFormValidity } = useForm({
    reportTitle: '',
    doctorName: '',
    specialty: '',
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
      Alert.alert(t('common.error'), result.error);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <CustomHeader text={t('add_report.title')} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <FormField
            title={t('add_report.report_title')}
            placeholder={t('add_report.report_title_placeholder')}
            value={form.reportTitle}
            onChangeText={(text) => handleChange('reportTitle', text)}
            error={errors.reportTitle}
            required
          />
          <FormField
            title={t('add_report.doctor_name')}
            placeholder={t('add_report.doctor_name_placeholder')}
            value={form.doctorName}
            onChangeText={(text) => handleChange('doctorName', text)}
            error={errors.doctorName}
            required
          />
          <FormField
            title={t('add_report.specialty')}
            placeholder={t('add_report.specialty_placeholder')}
            value={form.specialty}
            onChangeText={(text) => handleChange('specialty', text)}
            error={errors.specialty}
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
            title={t('add_report.notes')}
            placeholder={t('add_report.notes_placeholder')}
            value={form.notes}
            onChangeText={(text) => handleChange('notes', text)}
            error={errors.notes}
            type="long"
          />
          <Uploader
            title={t('add_report.upload_file')}
            onFileSelect={(file) => handleChange('documents', file)}
            error={errors.documents}
            required
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
  },
  saveButton: {
    backgroundColor: '#007AFF', // Example color, change to your theme color
    borderRadius: 8,
    marginHorizontal: wp(7.5),
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
})