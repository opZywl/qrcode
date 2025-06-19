import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [scannedData, setScannedData] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          toast({
            title: t('toast.error.title'),
            description: t('scannerDialog.scanImage.canvasError'),
            variant: 'destructive'
          });
          setIsScanning(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          setScannedData(code.data);
          toast({
            title: t('scannerDialog.scanImage.successTitle'),
            description: t('scannerDialog.scanImage.successDescription', { data: code.data })
          });
        } else {
          toast({
            title: t('scannerDialog.scanImage.notFoundTitle'),
            description: t('scannerDialog.scanImage.notFoundDescription'),
            variant: 'destructive'
          });
        }
        
        setIsScanning(false);
      };
      
      img.onerror = () => {
        toast({
          title: t('toast.error.title'),
          description: t('scannerDialog.scanImage.loadError'),
          variant: 'destructive'
        });
        setIsScanning(false);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  const handleCopyResult = async () => {
    if (!scannedData) return;
    
    try {
      await navigator.clipboard.writeText(scannedData);
      toast({
        title: t('toast.copied.title'),
        description: t('toast.copied.descriptionScanResult')
      });
    } catch (error) {
      toast({
        title: t('toast.copyFailed.title'),
        description: t('toast.copyFailed.descriptionScanResult'),
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('scannerDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('scannerDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <Camera className="w-4 h-4 mr-2" />
              {t('scannerDialog.tabCamera')}
            </TabsTrigger>
            <TabsTrigger value="image">
              <Upload className="w-4 h-4 mr-2" />
              {t('scannerDialog.tabImage')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="mt-4">
            <div className="text-center py-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Camera scanning not implemented in this demo
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-image-upload">{t('scannerDialog.scanImage.uploadLabel')}</Label>
              <Input
                id="qr-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isScanning}
              />
            </div>
            
            {isScanning && (
              <p className="text-sm text-muted-foreground">
                {t('scannerDialog.scanImage.loading')}
              </p>
            )}
            
            {scannedData && (
              <div className="space-y-2">
                <Label>{t('scannerDialog.scanImage.resultLabel')}</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm break-all">{scannedData}</p>
                </div>
                <Button onClick={handleCopyResult} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  {t('scannerDialog.scanImage.copyResultButton')}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};