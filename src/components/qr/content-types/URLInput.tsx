import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface URLInputProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const URLInput: React.FC<URLInputProps> = ({ content, onContentChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="url-input">{t('urlOrTextToEncode.label')}</Label>
      <Input
        id="url-input"
        type="text"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={t('urlOrTextToEncode.placeholder')}
      />
    </div>
  );
};