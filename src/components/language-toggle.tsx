"use client";

import * as React from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import '@/lib/i18n';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' || i18n.language.startsWith('en-') ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [currentLanguage, setCurrentLanguage] = React.useState(i18n.language);

  React.useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    setCurrentLanguage(i18n.language);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const isPortuguese = currentLanguage === 'pt' || currentLanguage.startsWith('pt-');

  return (
      <Button
          variant="outline"
          size="icon"
          onClick={toggleLanguage}
          aria-label={i18n.t('languageToggle.ariaLabel')}
      >
        {isPortuguese ? (
            <span role="img" aria-label="Bandeira dos Estados Unidos">🇺🇸</span>
        ) : (
            <span role="img" aria-label="Bandeira do Brasil">🇧🇷</span>
        )}
      </Button>
  );
}