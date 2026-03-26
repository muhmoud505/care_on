import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { I18nManager, StyleSheet, Text, TouchableOpacity } from 'react-native';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const newLanguage = currentLanguage.startsWith('ar') ? 'en' : 'ar';

  const toggleLanguage = async () => {
    const isRTL = newLanguage.startsWith('ar');

    // Persist the choice so it survives cold starts
    await AsyncStorage.setItem('app_language', newLanguage);

    // Set native RTL hint for next cold start (TextInput cursor direction etc.)
    // Note: this does NOT require a restart in JS-driven apps — all direction
    // logic in this app reads i18n.dir() which updates instantly below.
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);

    // THIS is the key call — react-i18next broadcasts the change to every
    // useTranslation() subscriber in the tree, so all components re-render
    // instantly with the correct isRTL value. No restart needed.
    await i18n.changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.container}>
      <Text style={styles.text}>{newLanguage.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    color: '#014CC4',
  },
});

export default LanguageSwitch;