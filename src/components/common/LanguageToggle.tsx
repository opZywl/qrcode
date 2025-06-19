"use client";

import * as React from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import '@/lib/i18n';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  const [currentClientLanguage, setCurrentClientLanguage] = React.useState('');

  React.useEffect(() => {
    setMounted(true);

    const handleLanguageChanged = (lng: string) => {
      setCurrentClientLanguage(lng);
    };
    
    setCurrentClientLanguage(i18n.language);
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = currentClientLanguage.startsWith('pt') ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Change language" disabled>
        <span role="img" aria-label="loading language">⏳</span>
      </Button>
    );
  }

  const isPortuguese = currentClientLanguage.startsWith('pt');

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      aria-label={t('languageToggle.ariaLabel')}
    >
      {isPortuguese ? (
        <span role="img" aria-label={t('languageToggle.ariaLabelUSFlag', 'US Flag')}>🇺🇸</span>
      ) : (
        <span role="img" aria-label={t('languageToggle.ariaLabelBRFlag', 'Brazil Flag')}>🇧🇷</span>
      )}
    </Button>
  );
}