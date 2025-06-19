import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import { QRCodeSettings } from '@/types';
import { ERROR_CORRECTION_LEVELS, QR_SIZE_OPTIONS } from '@/constants/qr-defaults';

interface AppearanceControlsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
}

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fg-color">{t('foregroundColor.label')}</Label>
          <Input
            id="fg-color"
            type="color"
            value={settings.foregroundColor}
            onChange={(e) => onSettingsChange({ foregroundColor: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bg-color">{t('backgroundColor.label')}</Label>
          <Input
            id="bg-color"
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
            disabled={settings.backgroundEnabled || settings.frameEnabled}
          />
          {(settings.backgroundEnabled || settings.frameEnabled) && (
            <p className="text-xs text-muted-foreground">
              {t('backgroundColorDisabledHint')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('sizePx.label')}</Label>
        <Select
          value={settings.size.toString()}
          onValueChange={(value) => onSettingsChange({ size: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QR_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('errorCorrection.label')}</Label>
        <Select
          value={settings.errorCorrectionLevel}
          onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => onSettingsChange({ errorCorrectionLevel: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ERROR_CORRECTION_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {t(`errorCorrection.level${level.value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('quietZone.label')}: {settings.quietZone}</Label>
        <Slider
          value={[settings.quietZone]}
          onValueChange={([value]) => onSettingsChange({ quietZone: value })}
          max={10}
          min={0}
          step={1}
        />
      </div>
    </div>
  );
};