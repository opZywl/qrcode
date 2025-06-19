"use client";

import React, { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQRSettings } from '@/hooks/use-qr-settings';
import { useQRHistory } from '@/hooks/use-qr-history';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { QRCodeData, ContentType } from '@/types';
import { getDisplayContent } from '@/utils/qr-content-generators';
import { ScanQrCode as AppIcon } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { settings, updateSettings, resetSettings, loadSettings } = useQRSettings();
  const { history, addToHistory, clearHistory } = useQRHistory();
  
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const handleGenerate = (content: string, contentType: ContentType) => {
    if (!content.trim()) {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.enterUrlOrText'),
        variant: 'destructive'
      });
      return;
    }

    const newQrData: QRCodeData = {
      id: Date.now().toString(),
      content,
      contentType,
      settings: { ...settings },
      timestamp: Date.now(),
      displayContent: getDisplayContent(content, contentType)
    };

    setQrData(newQrData);
    addToHistory(newQrData);

    toast({
      title: t('toast.success.title'),
      description: t('toast.success.qrGenerated')
    });
  };

  const handleReset = () => {
    resetSettings();
    setQrData(null);
    
    toast({
      title: t('toast.customizationReset.title'),
      description: t('toast.customizationReset.description')
    });
  };

  const handleHistoryClear = () => {
    clearHistory();
    
    toast({
      title: t('toast.historyCleared.title'),
      description: t('toast.historyCleared.description')
    });
  };

  const handleHistoryReuse = (data: QRCodeData) => {
    setQrData(data);
    loadSettings(data.settings);
    
    toast({
      title: t('toast.settingsLoaded.title'),
      description: t('toast.settingsLoaded.description')
    });
  };

  if (isMobile === undefined || !clientMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AppIcon className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const commonProps = {
    qrData,
    settings,
    onSettingsChange: updateSettings,
    onGenerate: handleGenerate,
    onReset: handleReset,
    history,
    onHistoryClear: handleHistoryClear,
    onHistoryReuse: handleHistoryReuse
  };

  return isMobile ? (
    <MobileLayout {...commonProps} />
  ) : (
    <DesktopLayout {...commonProps} />
  );
}