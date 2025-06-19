import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSettings } from '@/types';

interface BackgroundControlsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        backgroundEnabled: true,
        backgroundImage: result
      });
      
      toast({
        title: t('toast.bgImageUploaded.title'),
        description: t('toast.bgImageUploaded.description')
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

  const handleRemoveBackground = () => {
    onSettingsChange({
      backgroundEnabled: false,
      backgroundImage: null
    });
    
    toast({
      title: t('toast.bgImageRemoved.title'),
      description: t('toast.bgImageRemoved.description')
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="enable-background"
          checked={settings.backgroundEnabled}
          onCheckedChange={(checked) => onSettingsChange({ backgroundEnabled: !!checked })}
        />
        <Label htmlFor="enable-background">{t('enableBackground.label')}</Label>
      </div>

      {settings.backgroundEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="bg-upload">{t('uploadBackgroundImage.label')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="bg-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('bg-upload')?.click()}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('uploadBackgroundImage.label')}
              </Button>
              
              {settings.backgroundImage && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveBackground}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {settings.backgroundImage && (
            <div className="space-y-2">
              <Label>{t('backgroundImagePreview.alt')}</Label>
              <img
                src={settings.backgroundImage}
                alt={t('backgroundImagePreview.alt')}
                className="w-full h-32 object-cover border rounded"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};