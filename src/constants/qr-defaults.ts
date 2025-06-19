import { QRCodeSettings } from '@/types';

export const DEFAULT_QR_SETTINGS: QRCodeSettings = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  size: 256,
  errorCorrectionLevel: 'M',
  quietZone: 4,
  logoEnabled: false,
  logoImage: null,
  logoSizeRatio: 0.2,
  logoCutout: true,
  backgroundEnabled: false,
  backgroundImage: null,
  frameEnabled: false,
  frameType: 'none',
  frameText: 'Scan Me'
};

export const QR_SIZE_OPTIONS = [128, 256, 512, 1024];

export const ERROR_CORRECTION_LEVELS = [
  { value: 'L', label: 'Low (L) - approx 7%' },
  { value: 'M', label: 'Medium (M) - approx 15%' },
  { value: 'Q', label: 'Quartile (Q) - approx 25%' },
  { value: 'H', label: 'High (H) - approx 30%' }
] as const;

export const FRAME_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'simpleBorder', label: 'Simple Border' },
  { value: 'textBottom', label: 'Text Below' },
  { value: 'scanMeBottom', label: 'Scan Me Below' },
  { value: 'roundedBorderTextBottom', label: 'Rounded Border & Text Below' }
] as const;

export const WIFI_ENCRYPTION_TYPES = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'None (Open Network)' }
] as const;