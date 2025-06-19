import { useState } from 'react';
import { QRCodeSettings } from '@/types';
import { DEFAULT_QR_SETTINGS } from '@/constants/qr-defaults';

export const useQRSettings = () => {
  const [settings, setSettings] = useState<QRCodeSettings>(DEFAULT_QR_SETTINGS);

  const updateSettings = (updates: Partial<QRCodeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_QR_SETTINGS);
  };

  const loadSettings = (newSettings: QRCodeSettings) => {
    setSettings(newSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    loadSettings
  };
};