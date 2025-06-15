
"use client";

import QRCodeGenerator from '@/components/qrcode-generator';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { PortfolioPopup } from '@/components/portfolio-popup'; // Added this import
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Info, ScanLine, History as HistoryIcon, User, ScanQrCode as AppIcon } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function HomePage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = React.useState(false);
  const [isScannerDialogOpen, setIsScannerDialogOpen] = React.useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = React.useState(false);

  if (isMobile === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><AppIcon className="w-12 h-12 text-primary animate-pulse" /></div>;
  }

  return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsScannerDialogOpen(true)}
                  aria-label={t('scanQrCode.button')}
              >
                <ScanLine size={20} className="text-primary animate-text-glow-primary" />
              </Button>
              <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsHistorySheetOpen(true)}
                  aria-label={t('viewHistory.button')}
              >
                <HistoryIcon size={20} className="text-primary animate-text-glow-primary" />
              </Button>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <LanguageToggle />
              <ThemeToggle />
              <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                      variant="outline"
                      size="icon"
                      aria-label={t('portfolioPopup.viewPortfolio.buttonAriaLabel')}
                  >
                    <Info size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs w-[90vw] rounded-lg">
                  <DialogHeader className="pt-2">
                    <DialogTitle className="flex flex-col items-center text-center space-y-2">
                      <Avatar className="h-16 w-16 mb-2 border-2 border-primary/50">
                        <AvatarImage src="https://placehold.co/64x64.png?text=LL" alt="Lucas Lima" data-ai-hint="avatar person"/>
                        <AvatarFallback><User size={32}/></AvatarFallback>
                      </Avatar>
                      <p className="text-xl font-semibold text-card-foreground">Lucas Lima</p>
                      <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                    </DialogTitle>
                    <DialogDescription className="text-center pt-3 text-sm">
                      {t('portfolioPopup.message')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="pt-4">
                    <Button
                        variant="default"
                        className="w-full group"
                        onClick={() => {
                          window.open("https://lucas-lima.vercel.app", "_blank");
                          setIsPortfolioDialogOpen(false);
                        }}
                    >
                      {t('portfolioPopup.viewPortfolio.button')}
                      <User className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <QRCodeGenerator
              scannerOpen={isScannerDialogOpen}
              onScannerOpenChange={setIsScannerDialogOpen}
              historySheetOpen={isHistorySheetOpen}
              onHistorySheetOpenChange={setIsHistorySheetOpen}
          />
        </main>
        {!isMobile && <PortfolioPopup />}
      </div>
  );
}
