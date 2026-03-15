import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ added import
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { I18nManager, StyleSheet, Text, TouchableOpacity } from 'react-native';
import RNRestart from 'react-native-restart';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const currentLanguage = i18n.language;
  const newLanguage = currentLanguage.startsWith('ar') ? 'en' : 'ar';

  const toggleLanguage = () => {
    try {
      navigation.closeDrawer();
    } catch (error) {
      console.log('Could not close drawer:', error);
    }

    setTimeout(() => {
      i18n.changeLanguage(newLanguage).then(async () => { // ✅ async moved here inside .then()
        const isRTL = newLanguage.startsWith('ar');
        I18nManager.forceRTL(isRTL);
        await AsyncStorage.setItem('app_language', newLanguage); // ✅ now valid async/await
        RNRestart.Restart();
      });
    }, 300);
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