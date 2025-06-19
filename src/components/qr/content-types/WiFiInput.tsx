import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { WiFiData } from '@/types';
import { generateWiFiContent } from '@/utils/qr-content-generators';
import { WIFI_ENCRYPTION_TYPES } from '@/constants/qr-defaults';

interface WiFiInputProps {
  onContentChange: (content: string) => void;
}

export const WiFiInput: React.FC<WiFiInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [wifiData, setWifiData] = useState<WiFiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  });

  useEffect(() => {
    if (wifiData.ssid) {
      const content = generateWiFiContent(wifiData);
      onContentChange(content);
    }
  }, [wifiData, onContentChange]);

  const updateWifiData = (updates: Partial<WiFiData>) => {
    setWifiData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wifi-ssid">{t('wifiDialog.ssid.label')}</Label>
        <Input
          id="wifi-ssid"
          value={wifiData.ssid}
          onChange={(e) => updateWifiData({ ssid: e.target.value })}
          placeholder={t('wifiDialog.ssid.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wifi-password">{t('wifiDialog.password.label')}</Label>
        <Input
          id="wifi-password"
          type="password"
          value={wifiData.password}
          onChange={(e) => updateWifiData({ password: e.target.value })}
          placeholder={t('wifiDialog.password.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('wifiDialog.encryption.label')}</Label>
        <Select
          value={wifiData.encryption}
          onValueChange={(value: 'WPA' | 'WEP' | 'nopass') => updateWifiData({ encryption: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('wifiDialog.encryption.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {WIFI_ENCRYPTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {t(`wifiDialog.encryption.${type.value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="wifi-hidden"
          checked={wifiData.hidden}
          onCheckedChange={(checked) => updateWifiData({ hidden: !!checked })}
        />
        <Label htmlFor="wifi-hidden">{t('wifiDialog.hidden.label')}</Label>
      </div>
    </div>
  );
};