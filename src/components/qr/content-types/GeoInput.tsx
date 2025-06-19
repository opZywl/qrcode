import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { GeoData } from '@/types';
import { generateGeoContent } from '@/utils/qr-content-generators';

interface GeoInputProps {
  onContentChange: (content: string) => void;
}

export const GeoInput: React.FC<GeoInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [geoData, setGeoData] = useState<GeoData>({
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (geoData.latitude && geoData.longitude) {
      const content = generateGeoContent(geoData);
      onContentChange(content);
    }
  }, [geoData, onContentChange]);

  const updateGeoData = (updates: Partial<GeoData>) => {
    setGeoData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="geo-latitude">{t('contentTypes.geo.latitude.label')}</Label>
          <Input
            id="geo-latitude"
            type="number"
            step="any"
            value={geoData.latitude}
            onChange={(e) => updateGeoData({ latitude: e.target.value })}
            placeholder={t('contentTypes.geo.latitude.placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="geo-longitude">{t('contentTypes.geo.longitude.label')}</Label>
          <Input
            id="geo-longitude"
            type="number"
            step="any"
            value={geoData.longitude}
            onChange={(e) => updateGeoData({ longitude: e.target.value })}
            placeholder={t('contentTypes.geo.longitude.placeholder')}
          />
        </div>
      </div>
    </div>
  );
};