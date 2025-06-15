
"use client";

import * as React from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import '@/lib/i18n'; // Ensures i18n is initialized

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  // Store the language state locally to react to changes from i18n
  const [currentClientLanguage, setCurrentClientLanguage] = React.useState('');

  React.useEffect(() => {
    // Set mounted to true only on the client
    setMounted(true);

    const handleLanguageChanged = (lng: string) => {
      setCurrentClientLanguage(lng);
    };
    // Set initial language from i18n instance once mounted
    setCurrentClientLanguage(i18n.language);
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]); // Effect runs once on mount and when i18n instance changes

  const toggleLanguage = () => {
    const newLang = currentClientLanguage.startsWith('pt') ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  if (!mounted) {
    // Placeholder to avoid hydration mismatch.
    // Ensure this placeholder is simple and doesn't use t() or i18n.language.
    return (
        <Button variant="outline" size="icon" aria-label="Change language" disabled>
          <span role="img" aria-label="loading language">⏳</span>
        </Button>
    );
  }

  // Now that it's mounted, we can safely use the determined language
  const isPortuguese = currentClientLanguage.startsWith('pt');

  return (
      <Button
          variant="outline"
          size="icon"
          onClick={toggleLanguage}
          aria-label={t('languageToggle.ariaLabel')} // Safe to use t() now
      >
        {isPortuguese ? (
            <span role="img" aria-label={t('languageToggle.ariaLabelUSFlag', 'US Flag')}>🇺🇸</span>
        ) : (
            <span role="img" aria-label={t('languageToggle.ariaLabelBRFlag', 'Brazil Flag')}>🇧🇷</span>
        )}
      </Button>
  );
}