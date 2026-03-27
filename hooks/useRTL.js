import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for RTL/LTR direction handling.
 * Reactive — updates automatically when language changes.
 */
const useRTL = () => {
  const { i18n } = useTranslation();

  const isRTL = i18n.dir() === 'rtl';

  return useMemo(() => {
    const direction = isRTL ? 'rtl' : 'ltr';

    return {
      isRTL,
      dir: direction,                    // 'rtl' | 'ltr'
      writingDirection: direction,       // for Text component: writingDirection prop
      textAlign: isRTL ? 'right' : 'left',
      rowDirection: isRTL ? 'row-reverse' : 'row',     // for flexDirection
      reverseRowDirection: isRTL ? 'row' : 'row-reverse',
      
      // Optional: useful aliases
      flexDirection: isRTL ? 'row-reverse' : 'row',
    };
  }, [isRTL]);   // or [i18n.language] / [i18n.resolvedLanguage] if you prefer
};

export default useRTL;