import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
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
    resultValue: '',
    notes: '',
    documents: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) return;
    console.log('User national number being sent:', user.user.resource.national_number);
    
    setIsSubmitting(true);

    const descriptionObject = {
      resultValue: form.resultValue,
      notes: form.notes,
    };

    const payload = {
      user_national_number: user.user.resource.national_number,
      type: 'lab_test',
      title: form.testName,
      description: JSON.stringify(descriptionObject),
    };
``
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
      <CustomHeader text={t('add_result.title', { defaultValue: 'Add Result' })} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <FormField
            title={t('add_result.test_name', { defaultValue: 'Test Name' })}
            placeholder={t('add_result.test_name_placeholder', { defaultValue: 'Test Name' })}
            value={form.testName}
            onChangeText={(text) => handleChange('testName', text)}
            error={errors.testName}
            required
          />
          <FormField
            title={t('add_result.result_value', { defaultValue: 'Result Value' })}
            placeholder={t('add_result.result_value_placeholder', { defaultValue: 'Result Value' })}
            value={form.resultValue}
            onChangeText={(text) => handleChange('resultValue', text)}
            error={errors.resultValue}
            required
          />
          <FormField
            title={t('add_result.notes', { defaultValue: 'Notes' })}
            placeholder={t('add_result.notes_placeholder', { defaultValue: 'Notes (optional)' })}
            value={form.notes}
            onChangeText={(text) => handleChange('notes', text)}
            error={errors.notes}
            type="long"
          />
          <Uploader
            title={t('add_result.upload_file', { defaultValue: 'Upload File' })}
            onFileSelect={(file) => handleChange('documents', file)}
            error={errors.documents}
          />
          <TouchableOpacity style={[styles.saveButton, (!formIsValid || isSubmitting) && styles.disabledButton]} onPress={handleSave} disabled={!formIsValid || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('common.save', { defaultValue: 'Save' })}</Text>
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