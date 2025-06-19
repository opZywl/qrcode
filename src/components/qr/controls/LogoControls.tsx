import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSettings } from '@/types';

interface LogoControlsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
}

export const LogoControls: React.FC<LogoControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('toast.uploadError.title'),
        description: t('toast.uploadError.descriptionImageFile'),
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onSettingsChange({
        logoEnabled: true,
        logoImage: result
      });
      
      toast({
        title: t('toast.logoUploaded.title'),
        description: t('toast.logoUploaded.description')
      });
    };
    
    reader.onerror = () => {
      toast({
        title: t('toast.readError.title'),
        description: t('toast.readError.description'),
        variant: 'destructive'
      });
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable-logo"
          checked={settings.logoEnabled}
          onCheckedChange={(checked) => onSettingsChange({ logoEnabled: !!checked })}
        />
        <Label htmlFor="enable-logo">{t('enableLogo.label')}</Label>
      </div>

      {settings.logoEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="logo-upload">{t('uploadLogo.label')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadLogo.label')}
              </Button>
            </div>
          </div>

          {settings.logoImage && (
            <div className="space-y-2">
              <Label>Logo Preview</Label>
              <img
                src={settings.logoImage}
                alt="Logo preview"
                className="w-16 h-16 object-contain border rounded"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('logoSizeRatio.label')}: {settings.logoSizeRatio.toFixed(2)}</Label>
            <Slider
              value={[settings.logoSizeRatio]}
              onValueChange={([value]) => onSettingsChange({ logoSizeRatio: value })}
              max={0.4}
              min={0.05}
              step={0.01}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="logo-cutout"
              checked={settings.logoCutout}
              onCheckedChange={(checked) => onSettingsChange({ logoCutout: !!checked })}
            />
            <Label htmlFor="logo-cutout">{t('cutoutAreaBehindLogo.label')}</Label>
          </div>
        </>
      )}
    </div>
  );
};