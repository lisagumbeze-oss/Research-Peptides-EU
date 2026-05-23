export type LocaleCode =
  | 'en'
  | 'nl'
  | 'fr'
  | 'de'
  | 'es'
  | 'it'
  | 'pt'
  | 'hr'
  | 'pl'
  | 'ro'
  | 'cs'
  | 'da'
  | 'sv'
  | 'fi'
  | 'el'
  | 'hu'
  | 'sk'
  | 'sl'
  | 'bg';

export type LocaleDefinition = {
  code: LocaleCode;
  label: string;
  nativeName: string;
  flag: string;
};

export const supportedLocales: LocaleDefinition[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'hr', label: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'pl', label: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ro', label: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'cs', label: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'da', label: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'sv', label: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', label: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'el', label: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hu', label: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'sk', label: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', label: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'bg', label: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
];

const localeCodes = new Set(supportedLocales.map((l) => l.code));

export function isLocaleCode(value: string): value is LocaleCode {
  return localeCodes.has(value as LocaleCode);
}

export function detectBrowserLocale(): LocaleCode {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.split('-')[0].toLowerCase();
  return isLocaleCode(lang) ? lang : 'en';
}

export function getLocaleDefinition(code: LocaleCode): LocaleDefinition {
  return supportedLocales.find((l) => l.code === code) ?? supportedLocales[0];
}
