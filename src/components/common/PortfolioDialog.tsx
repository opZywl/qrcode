import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PortfolioDialog: React.FC<PortfolioDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onOpenChange(false);
            }}
          >
            {t('portfolioPopup.viewPortfolio.button')}
            <User className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};