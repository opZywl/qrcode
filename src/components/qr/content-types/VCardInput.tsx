import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { VCardData } from '@/types';
import { generateVCardContent } from '@/utils/qr-content-generators';

interface VCardInputProps {
  onContentChange: (content: string) => void;
}

export const VCardInput: React.FC<VCardInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    if (vcardData.firstName || vcardData.lastName || vcardData.organization) {
      const content = generateVCardContent(vcardData);
      onContentChange(content);
    }
  }, [vcardData, onContentChange]);

  const updateVCardData = (updates: Partial<VCardData>) => {
    setVcardData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vcard-firstName">{t('contentTypes.vcard.firstName.label')}</Label>
          <Input
            id="vcard-firstName"
            value={vcardData.firstName}
            onChange={(e) => updateVCardData({ firstName: e.target.value })}
            placeholder={t('contentTypes.vcard.firstName.placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vcard-lastName">{t('contentTypes.vcard.lastName.label')}</Label>
          <Input
            id="vcard-lastName"
            value={vcardData.lastName}
            onChange={(e) => updateVCardData({ lastName: e.target.value })}
            placeholder={t('contentTypes.vcard.lastName.placeholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vcard-organization">{t('contentTypes.vcard.organization.label')}</Label>
        <Input
          id="vcard-organization"
          value={vcardData.organization}
          onChange={(e) => updateVCardData({ organization: e.target.value })}
          placeholder={t('contentTypes.vcard.organization.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vcard-title">{t('contentTypes.vcard.title.label')}</Label>
        <Input
          id="vcard-title"
          value={vcardData.title}
          onChange={(e) => updateVCardData({ title: e.target.value })}
          placeholder={t('contentTypes.vcard.title.placeholder')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vcard-phone">{t('contentTypes.vcard.phone.label')}</Label>
          <Input
            id="vcard-phone"
            value={vcardData.phone}
            onChange={(e) => updateVCardData({ phone: e.target.value })}
            placeholder={t('contentTypes.vcard.phone.placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vcard-email">{t('contentTypes.vcard.email.label')}</Label>
          <Input
            id="vcard-email"
            type="email"
            value={vcardData.email}
            onChange={(e) => updateVCardData({ email: e.target.value })}
            placeholder={t('contentTypes.vcard.email.placeholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vcard-website">{t('contentTypes.vcard.website.label')}</Label>
        <Input
          id="vcard-website"
          value={vcardData.website}
          onChange={(e) => updateVCardData({ website: e.target.value })}
          placeholder={t('contentTypes.vcard.website.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vcard-address">{t('contentTypes.vcard.address.label')}</Label>
        <Input
          id="vcard-address"
          value={vcardData.address}
          onChange={(e) => updateVCardData({ address: e.target.value })}
          placeholder={t('contentTypes.vcard.address.placeholder')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vcard-city">{t('contentTypes.vcard.city.label')}</Label>
          <Input
            id="vcard-city"
            value={vcardData.city}
            onChange={(e) => updateVCardData({ city: e.target.value })}
            placeholder={t('contentTypes.vcard.city.placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vcard-state">{t('contentTypes.vcard.state.label')}</Label>
          <Input
            id="vcard-state"
            value={vcardData.state}
            onChange={(e) => updateVCardData({ state: e.target.value })}
            placeholder={t('contentTypes.vcard.state.placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vcard-zip">{t('contentTypes.vcard.zip.label')}</Label>
          <Input
            id="vcard-zip"
            value={vcardData.zip}
            onChange={(e) => updateVCardData({ zip: e.target.value })}
            placeholder={t('contentTypes.vcard.zip.placeholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vcard-country">{t('contentTypes.vcard.country.label')}</Label>
        <Input
          id="vcard-country"
          value={vcardData.country}
          onChange={(e) => updateVCardData({ country: e.target.value })}
          placeholder={t('contentTypes.vcard.country.placeholder')}
        />
      </div>
    </div>
  );
};