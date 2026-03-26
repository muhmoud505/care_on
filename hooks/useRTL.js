import { useTranslation } from 'react-i18next';

/**
 * useRTL — shared hook for direction-aware layout.
 *
 * Returns:
 *   isRTL       — true when current language is Arabic (or any RTL language)
 *   dir         — 'rtl' | 'ltr'
 *   textAlign   — 'right' | 'left'  (reading-start alignment)
 *   rowDir      — 'row-reverse' | 'row'
 *   writingDir  — 'rtl' | 'ltr'
 *
 * All values are reactive: they update instantly when i18n.changeLanguage() is called,
 * because this hook subscribes to react-i18next's language change events.
 */
const useRTL = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    rowDir: isRTL ? 'row-reverse' : 'row',
    rowDirection: isRTL ? 'row-reverse' : 'row',
    reverseRowDirection: isRTL ? 'row' : 'row-reverse',
    writingDir: isRTL ? 'rtl' : 'ltr',
  };
};

export default useRTL;
