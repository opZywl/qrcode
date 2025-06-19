import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { EmailData } from '@/types';
import { generateEmailContent } from '@/utils/qr-content-generators';

interface EmailInputProps {
  onContentChange: (content: string) => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    if (emailData.to) {
      const content = generateEmailContent(emailData);
      onContentChange(content);
    }
  }, [emailData, onContentChange]);

  const updateEmailData = (updates: Partial<EmailData>) => {
    setEmailData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-to">{t('contentTypes.email.to.label')}</Label>
        <Input
          id="email-to"
          type="email"
          value={emailData.to}
          onChange={(e) => updateEmailData({ to: e.target.value })}
          placeholder={t('contentTypes.email.to.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-subject">{t('contentTypes.email.subject.label')}</Label>
        <Input
          id="email-subject"
          value={emailData.subject}
          onChange={(e) => updateEmailData({ subject: e.target.value })}
          placeholder={t('contentTypes.email.subject.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-body">{t('contentTypes.email.body.label')}</Label>
        <Textarea
          id="email-body"
          value={emailData.body}
          onChange={(e) => updateEmailData({ body: e.target.value })}
          placeholder={t('contentTypes.email.body.placeholder')}
          rows={4}
        />
      </div>
    </div>
  );
};