import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, Text } from 'react-native';

const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage).then(() => {
      // Force RTL layout for Arabic
      if (newLanguage === 'ar') {
        I18nManager.forceRTL(true);
      } else {
        I18nManager.forceRTL(false);
      }
    });
  };

  return (
    <Pressable onPress={toggleLanguage}>
      <Text style={{ padding: 10, color: 'blue' }}>
        {t('switch_language')}
      </Text>
    </Pressable>
  );
};

export default LanguageSwitch;