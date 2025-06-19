import { 
  WiFiData, 
  VCardData, 
  VEventData, 
  EmailData, 
  SMSData, 
  GeoData, 
  WhatsAppData, 
  PhoneData,
  ContentType 
} from '@/types';

export const generateWiFiContent = (data: WiFiData): string => {
  const { ssid, password, encryption, hidden } = data;
  return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
};

export const generateVCardContent = (data: VCardData): string => {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  
  if (data.firstName || data.lastName) {
    lines.push(`FN:${data.firstName} ${data.lastName}`.trim());
    lines.push(`N:${data.lastName};${data.firstName};;;`);
  }
  
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);
  
  if (data.address || data.city || data.state || data.zip || data.country) {
    lines.push(`ADR:;;${data.address};${data.city};${data.state};${data.zip};${data.country}`);
  }
  
  lines.push('END:VCARD');
  return lines.join('\n');
};

export const generateVEventContent = (data: VEventData): string => {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT'];
  
  if (data.summary) lines.push(`SUMMARY:${data.summary}`);
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);
  
  // Format dates
  if (data.startDate) {
    const startDateTime = data.allDay 
      ? data.startDate.replace(/-/g, '')
      : `${data.startDate.replace(/-/g, '')}T${data.startTime.replace(/:/g, '')}00`;
    lines.push(`DTSTART:${startDateTime}`);
  }
  
  if (data.endDate) {
    const endDateTime = data.allDay 
      ? data.endDate.replace(/-/g, '')
      : `${data.endDate.replace(/-/g, '')}T${data.endTime.replace(/:/g, '')}00`;
    lines.push(`DTEND:${endDateTime}`);
  }
  
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
};

export const generateEmailContent = (data: EmailData): string => {
  const params = new URLSearchParams();
  if (data.subject) params.append('subject', data.subject);
  if (data.body) params.append('body', data.body);
  
  return `mailto:${data.to}${params.toString() ? '?' + params.toString() : ''}`;
};

export const generateSMSContent = (data: SMSData): string => {
  return `sms:${data.to}${data.body ? `?body=${encodeURIComponent(data.body)}` : ''}`;
};

export const generateGeoContent = (data: GeoData): string => {
  return `geo:${data.latitude},${data.longitude}`;
};

export const generateWhatsAppContent = (data: WhatsAppData): string => {
  const message = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
  return `https://wa.me/${data.to}${message}`;
};

export const generatePhoneContent = (data: PhoneData): string => {
  return `tel:${data.to}`;
};

export const getDisplayContent = (content: string, contentType: ContentType): string => {
  switch (contentType) {
    case 'wifi':
      return content.replace(/WIFI:T:([^;]*);S:([^;]*);P:([^;]*);H:([^;]*);/, 
        (_, encryption, ssid, password, hidden) => 
          `Wi-Fi: ${ssid} (${encryption}${hidden === 'true' ? ', Hidden' : ''})`
      );
    case 'vcard':
      const nameMatch = content.match(/FN:([^\n\r]*)/);
      const orgMatch = content.match(/ORG:([^\n\r]*)/);
      return `Contact: ${nameMatch?.[1] || orgMatch?.[1] || 'Unknown'}`;
    case 'vevent':
      const summaryMatch = content.match(/SUMMARY:([^\n\r]*)/);
      return `Event: ${summaryMatch?.[1] || 'Untitled Event'}`;
    case 'email':
      const emailMatch = content.match(/mailto:([^?]*)/);
      return `Email: ${emailMatch?.[1] || content}`;
    case 'sms':
      const smsMatch = content.match(/sms:([^?]*)/);
      return `SMS: ${smsMatch?.[1] || content}`;
    case 'geo':
      const geoMatch = content.match(/geo:([^,]*),([^,]*)/);
      return geoMatch ? `Location: ${geoMatch[1]}, ${geoMatch[2]}` : content;
    case 'whatsapp':
      const waMatch = content.match(/https:\/\/wa\.me\/([^?]*)/);
      return `WhatsApp: ${waMatch?.[1] || content}`;
    case 'phone':
      const phoneMatch = content.match(/tel:(.+)/);
      return `Phone: ${phoneMatch?.[1] || content}`;
    default:
      return content;
  }
};