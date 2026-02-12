import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Toast,
  TouchableOpacity,
  View
} from 'react-native'
import CustomHeader from '../../../components/CustomHeader'
import DatePick from '../../../components/datePicker'
import FormField from '../../../components/FormInput'
import Uploader from '../../../components/Uploader'
import { useAuth } from '../../../contexts/authContext'
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext'
import useForm from '../../../hooks/useForm'
import { hp, wp } from '../../../utils/responsive'

const AddEshaaScreen = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
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
    if (!formIsValid) return;
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
      <CustomHeader text={t('add_eshaa.title')} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
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

export default AddEshaaScreen

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
    paddingBottom: hp(4), // Add padding to the bottom
    paddingHorizontal: wp(5), // Add horizontal padding to center the content
  },
  saveButton: {
    backgroundColor: '#007AFF', // Example color, change to your theme color
    borderRadius: 8,
    // marginHorizontal is no longer needed as padding is on the container
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
