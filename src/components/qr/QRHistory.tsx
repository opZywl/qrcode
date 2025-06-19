import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, RotateCcw, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeData } from '@/types';
import { format } from 'date-fns';

interface QRHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: QRCodeData[];
  onClear: () => void;
  onReuse: (data: QRCodeData) => void;
}

export const QRHistory: React.FC<QRHistoryProps> = ({
  open,
  onOpenChange,
  history,
  onClear,
  onReuse
}) => {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('qrCodeHistory.title')}
          </SheetTitle>
          <SheetDescription>
            {t('history.sheetDescription')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {history.length > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('clearHistory.button')}
              </Button>
            </div>
          )}
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('history.empty.title')}</h3>
                <p className="text-muted-foreground">{t('history.empty.description')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.id}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.displayContent}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onReuse(item);
                            onOpenChange(false);
                          }}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {t('reuse.button')}
                        </Button>
                      </div>
                    </div>
                    {index < history.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};