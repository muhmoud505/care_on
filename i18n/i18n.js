import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

const resources = {
  en: { translation: require('./locales/en/en.json') },
  ar: { translation: require('./locales/ar/ar.json') },
};

const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;
const deviceDefault = deviceLanguageCode?.startsWith('ar') ? 'ar' : 'en';

// Init with device default first (sync) so i18next is ready immediately
i18next.use(initReactI18next).init({
  resources,
  lng: deviceDefault,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

// Then override with saved preference if it exists (async)
AsyncStorage.getItem('app_language').then((savedLang) => {
  if (savedLang && savedLang !== i18next.language) {
    i18next.changeLanguage(savedLang);
    const isRTL = savedLang.startsWith('ar');
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  } else {
    // No saved preference — apply RTL based on device locale
    const isRTL = deviceDefault === 'ar';
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }
});

export default i18next;