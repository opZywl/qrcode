import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { QRCodeSettings } from '@/types';
import { FRAME_TYPES } from '@/constants/qr-defaults';

interface FrameControlsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
}

export const FrameControls: React.FC<FrameControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable-frame"
          checked={settings.frameEnabled}
          onCheckedChange={(checked) => onSettingsChange({ frameEnabled: !!checked })}
        />
        <Label htmlFor="enable-frame">{t('enableFrame.label')}</Label>
      </div>

      {settings.frameEnabled && (
        <>
          <div className="space-y-2">
            <Label>{t('frameType.label')}</Label>
            <Select
              value={settings.frameType}
              onValueChange={(value: any) => onSettingsChange({ frameType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('frameType.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {FRAME_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(`frameType.${type.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(settings.frameType === 'textBottom' || 
            settings.frameType === 'roundedBorderTextBottom') && (
            <div className="space-y-2">
              <Label htmlFor="frame-text">{t('frameText.label')}</Label>
              <Input
                id="frame-text"
                value={settings.frameText}
                onChange={(e) => onSettingsChange({ frameText: e.target.value })}
                placeholder={t('frameText.placeholder')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};