// Simple translation hook - English only
import { t } from '../i18n';

export function useTranslation() {
  return t;
}

export function useLanguage() {
  return {
    language: 'en',
    setLanguage: () => {} // No-op, language is fixed
  };
}
