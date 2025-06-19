import React, { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeData, QRCodeSettings } from '@/types';
import { downloadQRCode, copyQRCodeToClipboard, shareQRCode } from '@/utils/qr-generator';
import { useToast } from '@/hooks/use-toast';

interface QRDisplayProps {
  qrData: QRCodeData | null;
  settings: QRCodeSettings;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ qrData, settings }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (!canvasRef.current) {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.noQrToDownload'),
        variant: 'destructive'
      });
      return;
    }

    const filename = `qrcode-${Date.now()}.png`;
    downloadQRCode(canvasRef.current, filename);
    
    toast({
      title: t('toast.downloaded.title'),
      description: t('toast.downloaded.descriptionPng', { filename })
    });
  };

  const handleCopy = async () => {
    if (!canvasRef.current) {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.noQrToCopy'),
        variant: 'destructive'
      });
      return;
    }

    const success = await copyQRCodeToClipboard(canvasRef.current);
    
    if (success) {
      toast({
        title: t('toast.copied.title'),
        description: t('toast.copied.description')
      });
    } else {
      toast({
        title: t('toast.copyFailed.title'),
        description: t('toast.copyFailed.description'),
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.noQrToShare'),
        variant: 'destructive'
      });
      return;
    }

    const success = await shareQRCode(canvasRef.current, 'QR Code');
    
    if (success) {
      toast({
        title: t('toast.shared.title'),
        description: t('toast.shared.description')
      });
    } else {
      toast({
        title: t('toast.shareFailed.title'),
        description: t('toast.shareFailed.description'),
        variant: 'destructive'
      });
    }
  };

  if (!qrData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('generateQrCode.button')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('qrCodeMinimal.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Canvas */}
        <div className="flex justify-center">
          <QRCodeCanvas
            ref={canvasRef}
            value={qrData.content}
            size={settings.size}
            fgColor={settings.foregroundColor}
            bgColor={settings.backgroundColor}
            level={settings.errorCorrectionLevel}
            marginSize={settings.quietZone}
            imageSettings={settings.logoEnabled && settings.logoImage ? {
              src: settings.logoImage,
              height: settings.size * settings.logoSizeRatio,
              width: settings.size * settings.logoSizeRatio,
              excavate: settings.logoCutout
            } : undefined}
          />
        </div>
        
        {/* Content Info */}
        <div className="text-sm text-muted-foreground">
          <p><strong>{t('encodedContent.label')}</strong> {qrData.displayContent}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('downloadQrCode.button')}
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            {t('copyImage.button')}
          </Button>
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            {t('shareQrCode.button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};