export interface QRCodeSettings {
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  quietZone: number;
  logoEnabled: boolean;
  logoImage: string | null;
  logoSizeRatio: number;
  logoCutout: boolean;
  backgroundEnabled: boolean;
  backgroundImage: string | null;
  frameEnabled: boolean;
  frameType: 'none' | 'simpleBorder' | 'textBottom' | 'scanMeBottom' | 'roundedBorderTextBottom';
  frameText: string;
}

export interface QRCodeData {
  id: string;
  content: string;
  contentType: ContentType;
  settings: QRCodeSettings;
  timestamp: number;
  displayContent: string;
}

export type ContentType = 'url' | 'wifi' | 'vcard' | 'vevent' | 'email' | 'sms' | 'geo' | 'whatsapp' | 'phone';

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface VEventData {
  summary: string;
  location: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SMSData {
  to: string;
  body: string;
}

export interface GeoData {
  latitude: string;
  longitude: string;
}

export interface WhatsAppData {
  to: string;
  message: string;
}

export interface PhoneData {
  to: string;
}