// Simple English-only i18n - no language switching needed
import en from './en.json';

export const translations = en;

// Helper to get translation by key path
export function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  
  // Replace parameters like {{min}}, {{max}}
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => params[param] || match);
  }
  
  return value || key;
}
