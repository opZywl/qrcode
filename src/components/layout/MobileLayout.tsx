import React, { useState } from 'react';
import { Header } from './Header';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { QRControls } from '@/components/qr/QRControls';
import { QRScanner } from '@/components/qr/QRScanner';
import { QRHistory } from '@/components/qr/QRHistory';
import { PortfolioDialog } from '@/components/common/PortfolioDialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeData, QRCodeSettings, ContentType } from '@/types';

interface MobileLayoutProps {
  qrData: QRCodeData | null;
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
  onGenerate: (content: string, contentType: ContentType) => void;
  onReset: () => void;
  history: QRCodeData[];
  onHistoryClear: () => void;
  onHistoryReuse: (data: QRCodeData) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  qrData,
  settings,
  onSettingsChange,
  onGenerate,
  onReset,
  history,
  onHistoryClear,
  onHistoryReuse
}) => {
  const { t } = useTranslation();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onScannerOpen={() => setIsScannerOpen(true)}
        onHistoryOpen={() => setIsHistoryOpen(true)}
        onPortfolioOpen={() => setIsPortfolioOpen(true)}
      />
      
      <main className="flex-1 flex flex-col">
        {/* QR Display Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          {qrData ? (
            <QRDisplay qrData={qrData} settings={settings} />
          ) : (
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('mobile.noQrGenerated.title')}</h3>
              <p className="text-muted-foreground">{t('mobile.noQrGenerated.description')}</p>
            </div>
          )}
        </div>
        
        {/* Bottom Controls */}
        <div className="border-t bg-background p-4">
          <Sheet open={isControlsOpen} onOpenChange={setIsControlsOpen}>
            <SheetTrigger asChild>
              <Button className="w-full" size="lg">
                <Settings className="w-5 h-5 mr-2" />
                {t('mobile.editOrNewLabel')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">{t('mobile.controlsPanel.title')}</h2>
                <QRControls
                  settings={settings}
                  onSettingsChange={onSettingsChange}
                  onGenerate={onGenerate}
                  onReset={onReset}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </main>
      
      {/* Dialogs and Sheets */}
      <QRScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
      />
      
      <QRHistory
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        history={history}
        onClear={onHistoryClear}
        onReuse={onHistoryReuse}
      />
      
      <PortfolioDialog
        open={isPortfolioOpen}
        onOpenChange={setIsPortfolioOpen}
      />
    </div>
  );
};