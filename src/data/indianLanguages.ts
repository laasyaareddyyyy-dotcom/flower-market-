import { Language } from '../types';

export interface IndianLanguage {
  code: Language;
  nativeName: string;
  englishName: string;
  region: string;
  script: string;
  flagSymbol: string;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    region: 'National / All India',
    script: 'Latin',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'hi',
    nativeName: 'हिंदी',
    englishName: 'Hindi',
    region: 'North & Central India',
    script: 'Devanagari',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    region: 'Andhra Pradesh & Telangana',
    script: 'Telugu',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    region: 'Karnataka',
    script: 'Kannada',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    region: 'Tamil Nadu & Puducherry',
    script: 'Tamil',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    region: 'Maharashtra & Goa',
    script: 'Devanagari',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    region: 'Gujarat & Daman',
    script: 'Gujarati',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    region: 'West Bengal & Tripura',
    script: 'Bengali',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    region: 'Punjab & Chandigarh',
    script: 'Gurmukhi',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    region: 'Kerala & Lakshadweep',
    script: 'Malayalam',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    region: 'Odisha',
    script: 'Odia',
    flagSymbol: '🇮🇳'
  },
  {
    code: 'as',
    nativeName: 'অসমীয়া',
    englishName: 'Assamese',
    region: 'Assam',
    script: 'Bengali-Assamese',
    flagSymbol: '🇮🇳'
  }
];

export function getLanguageInfo(code: Language): IndianLanguage {
  return (
    INDIAN_LANGUAGES.find((lang) => lang.code === code) || INDIAN_LANGUAGES[0]
  );
}
