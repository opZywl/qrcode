import { useState, useEffect } from 'react';
import { QRCodeData } from '@/types';

const HISTORY_KEY = 'qr-code-history';
const MAX_HISTORY_ITEMS = 10;

export const useQRHistory = () => {
  const [history, setHistory] = useState<QRCodeData[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse QR history:', error);
      }
    }
  }, []);

  const addToHistory = (qrData: QRCodeData) => {
    setHistory(prev => {
      const newHistory = [qrData, ...prev.filter(item => item.id !== qrData.id)]
        .slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};