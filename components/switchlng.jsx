import { useTranslation } from 'react-i18next';
import { I18nManager, StyleSheet, Text, TouchableOpacity } from 'react-native';
import RNRestart from 'react-native-restart';

const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const newLanguage = currentLanguage.startsWith('ar') ? 'en' : 'ar';

  const toggleLanguage = () => {
    i18n.changeLanguage(newLanguage).then(() => {
      const isRTL = newLanguage.startsWith('ar');
      I18nManager.forceRTL(isRTL);
      // Restart the app to apply RTL changes
      RNRestart.Restart();
    });
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