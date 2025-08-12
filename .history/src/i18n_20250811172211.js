// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zh from './locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // If a translation is missing, fallback to English
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
