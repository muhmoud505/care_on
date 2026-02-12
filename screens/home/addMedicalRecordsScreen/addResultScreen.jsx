import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useAuth } from '../../../contexts/authContext';
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';


const AddResultScreen = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
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
    if (!formIsValid) return;
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
      <CustomHeader text={t('add_result.title')} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
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

export default AddResultScreen


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
})