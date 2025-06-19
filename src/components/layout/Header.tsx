import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { PortfolioDialog } from '@/components/common/PortfolioDialog';
import { ScanLine, History as HistoryIcon, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onScannerOpen: () => void;
  onHistoryOpen: () => void;
  onPortfolioOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScannerOpen,
  onHistoryOpen,
  onPortfolioOpen
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onScannerOpen}
            aria-label={t('scanQrCode.button')}
          >
            <ScanLine size={20} className="text-primary animate-text-glow-primary" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onHistoryOpen}
            aria-label={t('viewHistory.button')}
          >
            <HistoryIcon size={20} className="text-primary animate-text-glow-primary" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={onPortfolioOpen}
            aria-label={t('portfolioPopup.viewPortfolio.buttonAriaLabel')}
          >
            <Info size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};