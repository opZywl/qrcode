import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { WhatsAppData } from '@/types';
import { generateWhatsAppContent } from '@/utils/qr-content-generators';

interface WhatsAppInputProps {
  onContentChange: (content: string) => void;
}

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [whatsappData, setWhatsappData] = useState<WhatsAppData>({
    to: '',
    message: ''
  });

  useEffect(() => {
    if (whatsappData.to) {
      const content = generateWhatsAppContent(whatsappData);
      onContentChange(content);
    }
  }, [whatsappData, onContentChange]);

  const updateWhatsappData = (updates: Partial<WhatsAppData>) => {
    setWhatsappData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="whatsapp-to">{t('contentTypes.whatsapp.to.label')}</Label>
        <Input
          id="whatsapp-to"
          type="tel"
          value={whatsappData.to}
          onChange={(e) => updateWhatsappData({ to: e.target.value })}
          placeholder={t('contentTypes.whatsapp.to.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp-message">{t('contentTypes.whatsapp.message.label')}</Label>
        <Textarea
          id="whatsapp-message"
          value={whatsappData.message}
          onChange={(e) => updateWhatsappData({ message: e.target.value })}
          placeholder={t('contentTypes.whatsapp.message.placeholder')}
          rows={3}
        />
      </div>
    </div>
  );
};