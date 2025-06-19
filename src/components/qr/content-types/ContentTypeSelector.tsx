import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { URLInput } from './URLInput';
import { WiFiInput } from './WiFiInput';
import { VCardInput } from './VCardInput';
import { VEventInput } from './VEventInput';
import { EmailInput } from './EmailInput';
import { SMSInput } from './SMSInput';
import { GeoInput } from './GeoInput';
import { WhatsAppInput } from './WhatsAppInput';
import { PhoneInput } from './PhoneInput';
import { useTranslation } from 'react-i18next';
import { ContentType } from '@/types';

interface ContentTypeSelectorProps {
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
  content: string;
  onContentChange: (content: string) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  contentType,
  onContentTypeChange,
  content,
  onContentChange
}) => {
  const { t } = useTranslation();

  return (
    <Tabs value={contentType} onValueChange={(value) => onContentTypeChange(value as ContentType)}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
        <TabsTrigger value="url">{t('contentTypes.url.tab')}</TabsTrigger>
        <TabsTrigger value="wifi">{t('contentTypes.wifi.tab')}</TabsTrigger>
        <TabsTrigger value="vcard">{t('contentTypes.vcard.tab')}</TabsTrigger>
        <TabsTrigger value="vevent">{t('contentTypes.vevent.tab')}</TabsTrigger>
        <TabsTrigger value="email">{t('contentTypes.email.tab')}</TabsTrigger>
        <TabsTrigger value="sms" className="hidden lg:block">{t('contentTypes.sms.tab')}</TabsTrigger>
        <TabsTrigger value="geo" className="hidden lg:block">{t('contentTypes.geo.tab')}</TabsTrigger>
        <TabsTrigger value="whatsapp" className="hidden lg:block">{t('contentTypes.whatsapp.tab')}</TabsTrigger>
        <TabsTrigger value="phone" className="hidden lg:block">{t('contentTypes.phone.tab')}</TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="url">
          <URLInput content={content} onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="wifi">
          <WiFiInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="vcard">
          <VCardInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="vevent">
          <VEventInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="sms">
          <SMSInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="geo">
          <GeoInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <WhatsAppInput onContentChange={onContentChange} />
        </TabsContent>
        
        <TabsContent value="phone">
          <PhoneInput onContentChange={onContentChange} />
        </TabsContent>
      </div>
    </Tabs>
  );
};