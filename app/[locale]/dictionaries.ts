import 'server-only';

const dictionaries = {
  en: () => import('../../i18n/en.json').then((module) => module.default),
  de: () => import('../../i18n/de.json').then((module) => module.default),
  ar: () => import('../../i18n/ar.json').then((module) => module.default),
  it: () => import('../../i18n/it.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'de' | 'ar' | 'it') =>
  dictionaries[locale](); 