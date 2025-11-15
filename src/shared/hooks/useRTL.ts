import { useState, useEffect } from 'react';
import i18n from '../../lib/i18n';

/**
 * Custom hook to detect and track RTL (Right-to-Left) layout direction
 * based on the current i18n language
 */
export const useRTL = () => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check initial direction
    const rtlLanguages = ['fa', 'ar', 'he', 'ur'];
    const currentLang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
    setIsRTL(rtlLanguages.includes(currentLang));

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      setIsRTL(rtlLanguages.includes(lng));
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup listener on unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return isRTL;
};
