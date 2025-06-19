import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { PhoneData } from '@/types';
import { generatePhoneContent } from '@/utils/qr-content-generators';

interface PhoneInputProps {
  onContentChange: (content: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [phoneData, setPhoneData] = useState<PhoneData>({
    to: ''
  });

  useEffect(() => {
    if (phoneData.to) {
      const content = generatePhoneContent(phoneData);
      onContentChange(content);
    }
  }, [phoneData, onContentChange]);

  const updatePhoneData = (updates: Partial<PhoneData>) => {
    setPhoneData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-to">{t('contentTypes.phone.to.label')}</Label>
        <Input
          id="phone-to"
          type="tel"
          value={phoneData.to}
          onChange={(e) => updatePhoneData({ to: e.target.value })}
          placeholder={t('contentTypes.phone.to.placeholder')}
        />
      </div>
    </div>
  );
};