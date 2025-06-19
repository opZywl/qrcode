import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { VEventData } from '@/types';
import { generateVEventContent } from '@/utils/qr-content-generators';

interface VEventInputProps {
  onContentChange: (content: string) => void;
}

export const VEventInput: React.FC<VEventInputProps> = ({ onContentChange }) => {
  const { t } = useTranslation();
  const [eventData, setEventData] = useState<VEventData>({
    summary: '',
    location: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false
  });

  useEffect(() => {
    if (eventData.summary && eventData.startDate) {
      const content = generateVEventContent(eventData);
      onContentChange(content);
    }
  }, [eventData, onContentChange]);

  const updateEventData = (updates: Partial<VEventData>) => {
    setEventData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="event-summary">{t('contentTypes.vevent.summary.label')}</Label>
        <Input
          id="event-summary"
          value={eventData.summary}
          onChange={(e) => updateEventData({ summary: e.target.value })}
          placeholder={t('contentTypes.vevent.summary.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-location">{t('contentTypes.vevent.location.label')}</Label>
        <Input
          id="event-location"
          value={eventData.location}
          onChange={(e) => updateEventData({ location: e.target.value })}
          placeholder={t('contentTypes.vevent.location.placeholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">{t('contentTypes.vevent.description.label')}</Label>
        <Textarea
          id="event-description"
          value={eventData.description}
          onChange={(e) => updateEventData({ description: e.target.value })}
          placeholder={t('contentTypes.vevent.description.placeholder')}
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="event-allDay"
          checked={eventData.allDay}
          onCheckedChange={(checked) => updateEventData({ allDay: !!checked })}
        />
        <Label htmlFor="event-allDay">{t('contentTypes.vevent.allDay.label')}</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-startDate">{t('contentTypes.vevent.startDate.label')}</Label>
          <Input
            id="event-startDate"
            type="date"
            value={eventData.startDate}
            onChange={(e) => updateEventData({ startDate: e.target.value })}
          />
        </div>

        {!eventData.allDay && (
          <div className="space-y-2">
            <Label htmlFor="event-startTime">{t('contentTypes.vevent.startTime.label')}</Label>
            <Input
              id="event-startTime"
              type="time"
              value={eventData.startTime}
              onChange={(e) => updateEventData({ startTime: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event-endDate">{t('contentTypes.vevent.endDate.label')}</Label>
          <Input
            id="event-endDate"
            type="date"
            value={eventData.endDate}
            onChange={(e) => updateEventData({ endDate: e.target.value })}
          />
        </div>

        {!eventData.allDay && (
          <div className="space-y-2">
            <Label htmlFor="event-endTime">{t('contentTypes.vevent.endTime.label')}</Label>
            <Input
              id="event-endTime"
              type="time"
              value={eventData.endTime}
              onChange={(e) => updateEventData({ endTime: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};