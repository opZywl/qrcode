import QRCode from 'qrcode.react';
import { QRCodeSettings } from '@/types';

export const generateQRCodeSVG = (
  content: string, 
  settings: QRCodeSettings
): string => {
  // This is a simplified version - in a real implementation,
  // you'd need to properly generate SVG content
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${settings.size}" height="${settings.size}">
    <!-- QR Code SVG content would go here -->
  </svg>`;
};

export const downloadQRCode = (
  canvas: HTMLCanvasElement | null,
  filename: string,
  format: 'png' | 'svg' = 'png'
): void => {
  if (!canvas) return;
  
  if (format === 'png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
};

export const copyQRCodeToClipboard = async (
  canvas: HTMLCanvasElement | null
): Promise<boolean> => {
  if (!canvas) return false;
  
  try {
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const shareQRCode = async (
  canvas: HTMLCanvasElement | null,
  title: string = 'QR Code'
): Promise<boolean> => {
  if (!canvas || !navigator.share) return false;
  
  try {
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
    
    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
    
    await navigator.share({
      title,
      files: [file]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
};