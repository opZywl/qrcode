import React, { useState } from 'react';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { QRControls } from '@/components/qr/QRControls';
import { QRScanner } from '@/components/qr/QRScanner';
import { QRHistory } from '@/components/qr/QRHistory';
import { PortfolioPopup } from '@/components/common/PortfolioPopup';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { Button } from '@/components/ui/button';
import { ScanLine, History as HistoryIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeData, QRCodeSettings, ContentType } from '@/types';

interface DesktopLayoutProps {
  qrData: QRCodeData | null;
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
  onGenerate: (content: string, contentType: ContentType) => void;
  onReset: () => void;
  history: QRCodeData[];
  onHistoryClear: () => void;
  onHistoryReuse: (data: QRCodeData) => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsScannerOpen(true)}
          aria-label={t('scanQrCode.button')}
        >
          <ScanLine size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsHistoryOpen(true)}
          aria-label={t('viewHistory.button')}
        >
          <HistoryIcon size={20} />
        </Button>
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <QRControls
              settings={settings}
              onSettingsChange={onSettingsChange}
              onGenerate={onGenerate}
              onReset={onReset}
            />
          </div>
          
          {/* Right Column - QR Display */}
          <div className="lg:sticky lg:top-8">
            <QRDisplay qrData={qrData} settings={settings} />
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
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
      
      <PortfolioPopup />
    </div>
  );
};