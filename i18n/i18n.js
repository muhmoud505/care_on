import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
const resources={
    en:{
        translation:require('./locales/en/en.json')
    },
    ar:{
        translation:require('./locales/ar/ar.json')
    }
}
const isRTL=Localization.getLocales()[0].textDirection==='rtl';

if(isRTL){
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true)
}
const deviceLanguage = Localization.getLocales()[0].languageCode;
const defaultLanguage = ['en', 'ar'].includes(deviceLanguage) ? deviceLanguage : 'en';

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage, // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    compatibilityJSON: 'v3' // For Android compatibility
  });
  export default i18next;
