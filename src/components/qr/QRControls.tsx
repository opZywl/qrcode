import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentTypeSelector } from './content-types/ContentTypeSelector';
import { AppearanceControls } from './controls/AppearanceControls';
import { LogoControls } from './controls/LogoControls';
import { BackgroundControls } from './controls/BackgroundControls';
import { FrameControls } from './controls/FrameControls';
import { Button } from '@/components/ui/button';
import { QrCode, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeSettings, ContentType } from '@/types';

interface QRControlsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
  onGenerate: (content: string, contentType: ContentType) => void;
  onReset: () => void;
}

export const QRControls: React.FC<QRControlsProps> = ({
  settings,
  onSettingsChange,
  onGenerate,
  onReset
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('url');

  const handleGenerate = () => {
    if (!content.trim()) return;
    onGenerate(content, contentType);
  };

  return (
    <div className="space-y-6">
      {/* Content Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t('qrCodeMinimal.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentTypeSelector
            contentType={contentType}
            onContentTypeChange={setContentType}
            content={content}
            onContentChange={setContent}
          />
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleGenerate} className="flex-1">
              <QrCode className="w-4 h-4 mr-2" />
              {t('generateQrCode.button')}
            </Button>
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('reset.button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>{t('customizeAppearance.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="frame">Frame</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="mt-4">
              <AppearanceControls
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            </TabsContent>
            
            <TabsContent value="logo" className="mt-4">
              <LogoControls
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            </TabsContent>
            
            <TabsContent value="background" className="mt-4">
              <BackgroundControls
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            </TabsContent>
            
            <TabsContent value="frame" className="mt-4">
              <FrameControls
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};