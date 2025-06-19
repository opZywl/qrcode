import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { SMSData } from '@/types';
import { generateSMSContent } from '@/utils/qr-content-generators';

interface SMSInputProps {
  onContentChange: (content: string) => void;
}

export const SMSInput: React.FC<SMSInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [smsData, setSmsData] = useState<SMSData>({
    to: '',
    body: ''
  });

  useEffect(() => {
    if (smsData.to) {
      const content = generateSMSContent(smsData);
      onContentChange(content);
    }
  }, [smsData, onContentChange]);

  const updateSmsData = (updates: Partial<SMSData>) => {
    setSmsData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sms-to">{t('contentTypes.sms.to.label')}</Label>
        <Input
          id="sms-to"
          type="tel"
          value={smsData.to}
          onChange={(e) => updateSmsData({ to: e.target.value })}
          placeholder={t('contentTypes.sms.to.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sms-body">{t('contentTypes.sms.body.label')}</Label>
        <Textarea
          id="sms-body"
          value={smsData.body}
          onChange={(e) => updateSmsData({ body: e.target.value })}
          placeholder={t('contentTypes.sms.body.placeholder')}
          rows={3}
        />
      </div>
    </div>
  );
};