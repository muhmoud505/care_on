import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'
import FormField from '../../../components/FormInput'
import { hp, wp } from '../../../utils/responsive'

const AddRecordSelector = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const [selectedValue, setSelectedValue] = useState(null)


  const recordTypes = [
    {
      key: 'addResult',
      label: t('add_selector.add_result'),
      screen: 'addResult',
    },
    {
      key: 'addEshaa',
      label: t('add_selector.add_xray'),
      screen: 'addEshaa',
    },
    {
      key: 'addReport',
      label: t('add_selector.add_report'),
      screen: 'addReport',
    },
    {
      key: 'addMedicine',
      label: t('add_selector.add_medicine'),
      screen: 'addMedicine',
    },
  ]

  const pickerItems = recordTypes.map((item) => ({
    label: item.label,
    value: item.screen,
  }))

  const handleContinue = () => {
    // Replace the current screen with the new one.
    // This makes 'goBack()' from the add screen return to the previous screen (lastReports).
    if (selectedValue)
      navigation.replace(selectedValue)
  }

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <CustomHeader text={t('add_selector.title')} />
      <View style={styles.content}>
        <FormField
          title={t('add_selector.prompt')}
          placeholder={t('add_selector.placeholder')}
          type="picker"
          pickerItems={pickerItems}
          value={selectedValue}
          onChangeText={setSelectedValue}
        />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selectedValue && styles.buttonDisabled]}
          disabled={!selectedValue}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default AddRecordSelector

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    padding: wp(5),
    paddingTop: hp(3),
  },
  footer: {
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: '#014CC4',
    paddingVertical: hp(2),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
})
