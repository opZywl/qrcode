
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Palette, ScanQrCode, RefreshCw, Settings2, ShieldCheck, Maximize, Share2, ImagePlus, History as HistoryIcon, Trash2, LinkIcon, FileJson, ClipboardCopy, Wifi, ScanLine, CameraOff, Image as ImageIcon, Frame, User, CalendarDays, Mail, MessageSquareText, Phone, MapPin, X, Info, Settings, Edit3, UploadCloud, Copy, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type QRContentType = 'url' | 'wifi' | 'vcard' | 'vevent' | 'email' | 'sms' | 'geo' | 'whatsapp' | 'phone';
type WifiEncryptionType = 'WPA' | 'WEP' | 'nopass';
type FrameType = 'none' | 'textBottom' | 'scanMeBottom' | 'simpleBorder' | 'roundedBorderTextBottom';

type QRCodeEntry = {
  id: string;
  contentType: QRContentType;
  originalInput: string;
  qrValue: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: ErrorCorrectionLevel;
  margin: number;
  logoDataUri?: string;
  logoSizeRatio?: number;
  excavateLogo?: boolean;
  backgroundImage?: string;
  timestamp: number;

  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: WifiEncryptionType;
  wifiHidden?: boolean;

  vcardFirstName?: string;
  vcardLastName?: string;
  vcardOrganization?: string;
  vcardTitle?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardWebsite?: string;
  vcardAddress?: string;
  vcardCity?: string;
  vcardState?: string;
  vcardZip?: string;
  vcardCountry?: string;

  veventSummary?: string;
  veventDescription?: string;
  veventLocation?: string;
  veventStartDate?: string;
  veventStartTime?: string;
  veventEndDate?: string;
  veventEndTime?: string;
  veventIsAllDay?: boolean;

  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;

  smsTo?: string;
  smsBody?: string;

  geoLatitude?: string;
  geoLongitude?: string;

  whatsappTo?: string;
  whatsappMessage?: string;

  phoneTo?: string;

  enableLogoCustomization?: boolean;
  enableBackgroundCustomization?: boolean;
  enableFrameCustomization?: boolean;
  selectedFrameType?: FrameType;
  frameText?: string;
};

interface QRCodeGeneratorProps {
  scannerOpen: boolean;
  onScannerOpenChange: (isOpen: boolean) => void;
  initialScannerTab: 'camera' | 'image';
  onScannerTabChange: (tab: 'camera' | 'image') => void;
  historySheetOpen: boolean;
  onHistorySheetOpenChange: (isOpen: boolean) => void;
}

const DEFAULT_FG_COLOR = '#000000';
const FRAME_TEXT_AREA_HEIGHT = 40;
const FRAME_PADDING = 10;
const FRAME_BORDER_RADIUS = 8;


export default function QRCodeGenerator({
                                          scannerOpen,
                                          onScannerOpenChange,
                                          initialScannerTab,
                                          onScannerTabChange,
                                          historySheetOpen,
                                          onHistorySheetOpenChange,
                                        }: QRCodeGeneratorProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  const [activeContentType, setActiveContentType] = useState<QRContentType>('url');

  const [urlInput, setUrlInput] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [fgColor, setFgColor] = useState<string>(DEFAULT_FG_COLOR);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>('H');
  const [quietZone, setQuietZone] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [logoDataUri, setLogoDataUri] = useState<string>('');
  const [logoSizeRatio, setLogoSizeRatio] = useState<number>(0.2);
  const [excavateLogo, setExcavateLogo] = useState<boolean>(true);
  const [history, setHistory] = useState<QRCodeEntry[]>([]);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageScanCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageScanInputRef = useRef<HTMLInputElement>(null);

  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  const [selectedFrameType, setSelectedFrameType] = useState<FrameType>('none');
  const [frameText, setFrameText] = useState<string>('');

  const [isControlsSheetOpen, setIsControlsSheetOpen] = useState<boolean>(false);
  const [mobileAccordionValue, setMobileAccordionValue] = useState<string[]>([]);

  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const [scannedImageQrResult, setScannedImageQrResult] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState<boolean>(false);

  const [enableLogoCustomization, setEnableLogoCustomization] = useState<boolean>(false);
  const [enableBackgroundCustomization, setEnableBackgroundCustomization] = useState<boolean>(false);
  const [enableFrameCustomization, setEnableFrameCustomization] = useState<boolean>(false);


  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<WifiEncryptionType>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  const [vcardFirstName, setVcardFirstName] = useState('');
  const [vcardLastName, setVcardLastName] = useState('');
  const [vcardOrganization, setVcardOrganization] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardWebsite, setVcardWebsite] = useState('');
  const [vcardAddress, setVcardAddress] = useState('');
  const [vcardCity, setVcardCity] = useState('');
  const [vcardState, setVcardState] = useState('');
  const [vcardZip, setVcardZip] = useState('');
  const [vcardCountry, setVcardCountry] = useState('');

  const [veventSummary, setVeventSummary] = useState('');
  const [veventDescription, setVeventDescription] = useState('');
  const [veventLocation, setVeventLocation] = useState('');
  const [veventStartDate, setVeventStartDate] = useState('');
  const [veventStartTime, setVeventStartTime] = useState('');
  const [veventEndDate, setVeventEndDate] = useState('');
  const [veventEndTime, setVeventEndTime] = useState('');
  const [veventIsAllDay, setVeventIsAllDay] = useState(false);

  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [smsTo, setSmsTo] = useState('');
  const [smsBody, setSmsBody] = useState('');

  const [geoLatitude, setGeoLatitude] = useState('');
  const [geoLongitude, setGeoLongitude] = useState('');

  const [whatsappTo, setWhatsappTo] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [phoneTo, setPhoneTo] = useState('');


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if(!isClient) return;
    const savedHistory = localStorage.getItem('qrCodeHistoryMinimal');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [isClient]);

  useEffect(() => {
    if(!isClient) return;
    if (history.length > 0) {
      localStorage.setItem('qrCodeHistoryMinimal', JSON.stringify(history));
    } else if (localStorage.getItem('qrCodeHistoryMinimal')) {
      localStorage.removeItem('qrCodeHistoryMinimal');
    }
  }, [history, isClient]);


  useEffect(() => {
    if (scannerOpen && initialScannerTab === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: t('toast.error.title'),
            description: t('scannerDialog.permissionDenied.description'),
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (initialScannerTab !== 'camera') {
        setHasCameraPermission(null);
      }
    }
  }, [scannerOpen, initialScannerTab, toast, t]);

  useEffect(() => {
    if (!scannerOpen) {
      setScannedImagePreview(null);
      setScannedImageQrResult(null);
      if (imageScanInputRef.current) {
        imageScanInputRef.current.value = "";
      }
    }
  }, [scannerOpen]);


  const sanitizeAndValidateUrl = (inputUrl: string): string => {
    let currentUrl = inputUrl.trim();
    if (!currentUrl) return "";

    if (/^https?:[^/][^/]/i.test(currentUrl) && !/^https?:\/\//i.test(currentUrl)) {
      currentUrl = currentUrl.replace(/^(https?:)/i, '$1//');
    }

    const protocolRegex = /^(http:\/\/|https:\/\/|ftp:\/\/|mailto:|tel:|geo:|sms:|smsto:|vcard:|vevent:|whatsapp:)/i;
    if (protocolRegex.test(currentUrl)) return currentUrl;

    const localhostRegex = /^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?$/;
    if (localhostRegex.test(currentUrl)) return `http://${currentUrl}`;

    const domainLikeRegex = /^([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}(:\d+)?(\/.*)?$/;
    if (domainLikeRegex.test(currentUrl) || (currentUrl.includes('.') && !currentUrl.includes(' ') && !currentUrl.startsWith('/'))) {
      return `https://${currentUrl}`;
    }
    return currentUrl;
  };


  const handleUrlBlur = () => {
    if (urlInput && activeContentType === 'url') {
      const sanitized = sanitizeAndValidateUrl(urlInput);
      setUrlInput(sanitized);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: t('toast.uploadError.title'), description: t('toast.uploadError.descriptionImageFile'), variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUri(reader.result as string);
        toast({ title: t('toast.logoUploaded.title'), description: t('toast.logoUploaded.description') });
      };
      reader.onerror = () => toast({ title: t('toast.readError.title'), description: t('toast.readError.description'), variant: "destructive" });
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: t('toast.uploadError.title'), description: t('toast.uploadError.descriptionImageFile'), variant: "destructive" });
        if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
        toast({ title: t('toast.bgImageUploaded.title'), description: t('toast.bgImageUploaded.description') });
      };
      reader.onerror = () => toast({ title: t('toast.readError.title'), description: t('toast.readError.description'), variant: "destructive" });
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImageFile = () => {
    setBackgroundImage('');
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = "";
    }
    toast({ title: t('toast.bgImageRemoved.title'), description: t('toast.bgImageRemoved.description') });
  };

  const escapeVCardString = (str: string | undefined): string => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  };

  const formatDateForVEvent = (dateStr: string, timeStr: string, isAllDay: boolean): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    if (isAllDay) {
      return `${year}${month}${day}`;
    }

    const [hours, minutes] = timeStr ? timeStr.split(':').map(s => s.padStart(2, '0')) : ['00', '00'];
    return `${year}${month}${day}T${hours}${minutes}00Z`;
  };

  const handleGenerateQRCode = () => {
    setIsLoading(true);

    let finalValueToEncode = "";
    let originalInputForHistory = "";
    let entryContentType: QRContentType = activeContentType;
    let contentSpecificDetails: Partial<QRCodeEntry> = {};

    switch (activeContentType) {
      case 'url':
        const rawUserInput = urlInput.trim();
        if (!rawUserInput) {
          toast({ title: t('toast.error.title'), description: t('toast.error.enterUrlOrText'), variant: "destructive" });
          setIsLoading(false);
          return;
        }
        originalInputForHistory = rawUserInput;
        finalValueToEncode = sanitizeAndValidateUrl(rawUserInput);
        setUrlInput(finalValueToEncode);
        break;
      case 'wifi':
        if (!wifiSsid.trim()) {
          toast({ title: t('toast.error.title'), description: t('toast.error.ssidRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        const escapeWifi = (str: string) => str.replace(/([\\;,":])/g, '\\$1');
        finalValueToEncode = `WIFI:T:${wifiEncryption};S:${escapeWifi(wifiSsid)};`;
        if (wifiEncryption !== 'nopass') finalValueToEncode += `P:${escapeWifi(wifiPassword)};`;
        if (wifiHidden) finalValueToEncode += `H:true;`;
        finalValueToEncode += ';';
        originalInputForHistory = wifiSsid;
        contentSpecificDetails = { wifiSsid, wifiPassword, wifiEncryption, wifiHidden };
        break;
      case 'vcard':
        if (!vcardFirstName.trim() && !vcardLastName.trim() && !vcardOrganization.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.vcard.error.minFields'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `BEGIN:VCARD\nVERSION:3.0\nN:${escapeVCardString(vcardLastName)};${escapeVCardString(vcardFirstName)}\nFN:${escapeVCardString(vcardFirstName)} ${escapeVCardString(vcardLastName)}\nORG:${escapeVCardString(vcardOrganization)}\nTITLE:${escapeVCardString(vcardTitle)}\nTEL;TYPE=WORK,VOICE:${escapeVCardString(vcardPhone)}\nEMAIL:${escapeVCardString(vcardEmail)}\nURL:${escapeVCardString(vcardWebsite)}\nADR;TYPE=WORK:;;${escapeVCardString(vcardAddress)};${escapeVCardString(vcardCity)};${escapeVCardString(vcardState)};${escapeVCardString(vcardZip)};${escapeVCardString(vcardCountry)}\nEND:VCARD`;
        originalInputForHistory = `${vcardFirstName} ${vcardLastName}`.trim() || vcardOrganization;
        contentSpecificDetails = { vcardFirstName, vcardLastName, vcardOrganization, vcardTitle, vcardPhone, vcardEmail, vcardWebsite, vcardAddress, vcardCity, vcardState, vcardZip, vcardCountry };
        break;
      case 'vevent':
        if (!veventSummary.trim() || !veventStartDate.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.vevent.error.minFields'), variant: "destructive" });
          setIsLoading(false); return;
        }
        const dtStart = formatDateForVEvent(veventStartDate, veventStartTime, veventIsAllDay);
        const dtEnd = formatDateForVEvent(veventEndDate || veventStartDate, veventEndTime || veventStartTime, veventIsAllDay);
        if (!dtStart || !dtEnd) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.vevent.error.invalidDate'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `BEGIN:VEVENT\nSUMMARY:${escapeVCardString(veventSummary)}\nDESCRIPTION:${escapeVCardString(veventDescription)}\nLOCATION:${escapeVCardString(veventLocation)}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT`;
        originalInputForHistory = veventSummary;
        contentSpecificDetails = { veventSummary, veventDescription, veventLocation, veventStartDate, veventStartTime, veventEndDate, veventEndTime, veventIsAllDay };
        break;
      case 'email':
        if (!emailTo.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.email.error.toRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        originalInputForHistory = emailTo;
        contentSpecificDetails = { emailTo, emailSubject, emailBody };
        break;
      case 'sms':
        if (!smsTo.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.sms.error.toRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `SMSTO:${smsTo}:${smsBody}`;
        originalInputForHistory = smsTo;
        contentSpecificDetails = { smsTo, smsBody };
        break;
      case 'geo':
        if (!geoLatitude.trim() || !geoLongitude.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.geo.error.latLonRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `geo:${geoLatitude},${geoLongitude}`;
        originalInputForHistory = `Lat: ${geoLatitude}, Lon: ${geoLongitude}`;
        contentSpecificDetails = { geoLatitude, geoLongitude };
        break;
      case 'whatsapp':
        if (!whatsappTo.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.whatsapp.error.toRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        const numberOnly = whatsappTo.replace(/\D/g, '');
        finalValueToEncode = `https://wa.me/${numberOnly}?text=${encodeURIComponent(whatsappMessage)}`;
        originalInputForHistory = whatsappTo;
        contentSpecificDetails = { whatsappTo, whatsappMessage };
        break;
      case 'phone':
        if (!phoneTo.trim()) {
          toast({ title: t('toast.error.title'), description: t('contentTypes.phone.error.toRequired'), variant: "destructive" });
          setIsLoading(false); return;
        }
        finalValueToEncode = `tel:${phoneTo.replace(/\D/g, '')}`;
        originalInputForHistory = phoneTo;
        contentSpecificDetails = { phoneTo };
        break;
      default:
        toast({ title: t('toast.error.title'), description: t('toast.error.invalidContentType'), variant: "destructive" });
        setIsLoading(false);
        return;
    }


    if (finalValueToEncode) {
      setQrValue(finalValueToEncode);

      const newEntry: QRCodeEntry = {
        id: Date.now().toString(),
        contentType: entryContentType,
        originalInput: originalInputForHistory,
        qrValue: finalValueToEncode,
        fgColor,
        bgColor,
        size,
        level: errorCorrectionLevel,
        margin: quietZone,
        enableLogoCustomization,
        logoDataUri: enableLogoCustomization && logoDataUri ? logoDataUri : undefined,
        logoSizeRatio: enableLogoCustomization && logoDataUri ? logoSizeRatio : undefined,
        excavateLogo: enableLogoCustomization && logoDataUri ? excavateLogo : undefined,
        enableBackgroundCustomization,
        backgroundImage: enableBackgroundCustomization && backgroundImage ? backgroundImage : undefined,
        enableFrameCustomization,
        selectedFrameType: enableFrameCustomization ? selectedFrameType : 'none',
        frameText: enableFrameCustomization && (selectedFrameType === 'textBottom' || selectedFrameType === 'roundedBorderTextBottom') ? frameText : undefined,
        timestamp: Date.now(),
        ...contentSpecificDetails,
      };
      setHistory(prevHistory => [newEntry, ...prevHistory.slice(0, 9)]);
      toast({ title: t('toast.success.title'), description: t('toast.success.qrGenerated') });
    }
    setIsLoading(false);
    if (isMobile) {
      setIsControlsSheetOpen(false);
    }
  };

  const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  }

  const handleDownloadQRCode = useCallback((format: 'png' | 'svg' = 'png') => {
    const useLogo = (enableLogoCustomization && mobileAccordionValue.includes("logo")) || (enableLogoCustomization && !isMobile && logoDataUri);
    const useBackground = (enableBackgroundCustomization && mobileAccordionValue.includes("background")) || (enableBackgroundCustomization && !isMobile && backgroundImage);
    const useFrame = (enableFrameCustomization && mobileAccordionValue.includes("frame")) || (enableFrameCustomization && !isMobile && selectedFrameType !== 'none');

    const activeBgImage = useBackground ? backgroundImage : '';
    const activeLogoImgDataUri = useLogo ? logoDataUri : '';
    const activeFrameSelType = useFrame ? selectedFrameType : 'none';
    const activeFrameTxt = (activeFrameSelType === 'textBottom' || activeFrameSelType === 'roundedBorderTextBottom') ? frameText : (activeFrameSelType === 'scanMeBottom' ? 'SCAN ME' : '');


    if (!qrValue || (format === 'png' && !qrCanvasRef.current)) {
      toast({ title: t('toast.error.title'), description: t('toast.error.noQrToDownload'), variant: "destructive" });
      return;
    }
    const filename = `qrcode_${getFormattedDate()}.${format}`;

    if (format === 'svg') {
      if (activeFrameSelType !== 'none') {
        toast({ title: t('toast.warning.title'), description: t('toast.warning.svgFrameNotSupported'), variant: "default" });
      }
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      let svgStringContent = '';
      try {
        const svgInstance = new QRCodeSVG({
          value: qrValue, size, fgColor, bgColor: activeBgImage ? 'transparent' : bgColor, level: errorCorrectionLevel, margin: quietZone, includeMargin: true,
          imageSettings: activeLogoImgDataUri ? { src: activeLogoImgDataUri, height: size * logoSizeRatio, width: size * logoSizeRatio, excavate: excavateLogo, x: undefined, y: undefined } : undefined
        });
        const ReactDOMServer = require('react-dom/server');
        const svgMarkup = ReactDOMServer.renderToStaticMarkup(svgInstance);
        const SvgElement = new DOMParser().parseFromString(svgMarkup, "image/svg+xml").documentElement;
        const pathElement = SvgElement.querySelector('path');
        const rectElements = SvgElement.querySelectorAll('rect');
        const imageElement = SvgElement.querySelector('image');

        let combinedPaths = '';
        if(pathElement) combinedPaths += pathElement.outerHTML;
        rectElements.forEach(rect => { combinedPaths += rect.outerHTML; });
        if(imageElement) combinedPaths += imageElement.outerHTML;
        svgStringContent = combinedPaths;

      } catch (e) {
        toast({ title: t('toast.error.title'), description: t('toast.error.svgGenerationError'), variant: "destructive" });
        document.body.removeChild(tempDiv);
        return;
      }
      document.body.removeChild(tempDiv);

      let finalSvgData;
      if (activeBgImage) {
        finalSvgData = `<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><image xlink:href="${activeBgImage}" x="0" y="0" height="${size}" width="${size}"/>${svgStringContent}</svg>`;
        toast({ title: t('toast.warning.title'), description: t('toast.warning.svgBgExperimental'), variant: "default" });
      } else {
        finalSvgData = `<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${svgStringContent}</svg>`;
      }

      const blob = new Blob([finalSvgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      toast({ title: t('toast.downloaded.title'), description: t('toast.downloaded.descriptionSvg', {filename}) });
      return;
    }


    const mainQrCanvas = qrCanvasRef.current!.querySelector('canvas');
    if (!mainQrCanvas) {
      toast({ title: t('toast.error.title'), description: t('toast.error.noQrToDownload'), variant: "destructive" });
      return;
    }

    const exportCanvas = document.createElement('canvas');
    let exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
      toast({ title: t('toast.error.title'), description: t('toast.error.canvasContextError'), variant: "destructive" });
      return;
    }

    let canvasWidth = size;
    let canvasHeight = size;
    let qrDrawX = 0;
    let qrDrawY = 0;

    if (activeFrameSelType !== 'none' && (activeFrameSelType === 'textBottom' || activeFrameSelType === 'scanMeBottom' || activeFrameSelType === 'roundedBorderTextBottom' || activeFrameSelType === 'simpleBorder')) {
      canvasWidth = size + 2 * FRAME_PADDING;
      qrDrawX = FRAME_PADDING;
      qrDrawY = FRAME_PADDING;
      if (activeFrameSelType === 'textBottom' || activeFrameSelType === 'scanMeBottom' || activeFrameSelType === 'roundedBorderTextBottom') {
        canvasHeight = size + 2 * FRAME_PADDING + FRAME_TEXT_AREA_HEIGHT;
      } else {
        canvasHeight = size + 2 * FRAME_PADDING;
      }
    }

    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;


    const drawFinalImage = () => {
      if (!exportCtx) return;
      exportCtx.fillStyle = activeBgImage ? 'transparent' : bgColor;
      exportCtx.fillRect(0, 0, canvasWidth, canvasHeight);


      if (activeBgImage) {
        const bgImg = new window.Image();
        bgImg.onload = () => {
          if (!exportCtx) return;
          exportCtx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
          drawQrAndFrame();
          finalizeDownload();
        };
        bgImg.onerror = () => {
          toast({ title: t('toast.error.title'), description: t('toast.error.loadImageError'), variant: "destructive" });
          drawQrAndFrame();
          finalizeDownload();
        };
        bgImg.src = activeBgImage;
      } else {
        drawQrAndFrame();
        finalizeDownload();
      }
    };

    const drawQrAndFrame = () => {
      if (!exportCtx) return;
      exportCtx.drawImage(mainQrCanvas, qrDrawX, qrDrawY, size, size);


      if (activeFrameSelType !== 'none') {
        exportCtx.strokeStyle = fgColor;
        exportCtx.lineWidth = 2;

        if (activeFrameSelType === 'roundedBorderTextBottom') {
          exportCtx.beginPath();
          exportCtx.moveTo(qrDrawX + FRAME_BORDER_RADIUS, qrDrawY);
          exportCtx.lineTo(qrDrawX + size - FRAME_BORDER_RADIUS, qrDrawY);
          exportCtx.quadraticCurveTo(qrDrawX + size, qrDrawY, qrDrawX + size, qrDrawY + FRAME_BORDER_RADIUS);
          exportCtx.lineTo(qrDrawX + size, qrDrawY + size - FRAME_BORDER_RADIUS);
          exportCtx.quadraticCurveTo(qrDrawX + size, qrDrawY + size, qrDrawX + size - FRAME_BORDER_RADIUS, qrDrawY + size);
          exportCtx.lineTo(qrDrawX + FRAME_BORDER_RADIUS, qrDrawY + size);
          exportCtx.quadraticCurveTo(qrDrawX, qrDrawY + size, qrDrawX, qrDrawY + size - FRAME_BORDER_RADIUS);
          exportCtx.lineTo(qrDrawX, qrDrawY + FRAME_BORDER_RADIUS);
          exportCtx.quadraticCurveTo(qrDrawX, qrDrawY, qrDrawX + FRAME_BORDER_RADIUS, qrDrawY);
          exportCtx.closePath();
          exportCtx.stroke();
        } else if (activeFrameSelType === 'simpleBorder' || activeFrameSelType === 'textBottom' || activeFrameSelType === 'scanMeBottom') {
          exportCtx.strokeRect(qrDrawX, qrDrawY, size, size);
        }


        if (activeFrameSelType === 'textBottom' || activeFrameSelType === 'scanMeBottom' || activeFrameSelType === 'roundedBorderTextBottom') {
          const textY = qrDrawY + size + FRAME_PADDING + (FRAME_TEXT_AREA_HEIGHT / 2);
          const textAreaX = qrDrawX;
          const textAreaY = qrDrawY + size + (2 * FRAME_PADDING);


          exportCtx.fillStyle = activeBgImage ? 'rgba(255,255,255,0.8)' : bgColor;
          exportCtx.fillRect(textAreaX, qrDrawY + size + FRAME_PADDING, size, FRAME_TEXT_AREA_HEIGHT);


          exportCtx.strokeStyle = fgColor;
          exportCtx.strokeRect(textAreaX, qrDrawY + size + FRAME_PADDING, size, FRAME_TEXT_AREA_HEIGHT);

          exportCtx.fillStyle = fgColor;
          exportCtx.font = 'bold 16px sans-serif';
          exportCtx.textAlign = 'center';
          exportCtx.textBaseline = 'middle';
          exportCtx.fillText(activeFrameTxt, textAreaX + size / 2, qrDrawY + size + FRAME_PADDING + FRAME_TEXT_AREA_HEIGHT / 2);
        }
      }
    };

    const finalizeDownload = () => {
      const pngUrl = exportCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({ title: t('toast.downloaded.title'), description: t('toast.downloaded.descriptionPng', {filename}) });
    };

    drawFinalImage();

  }, [qrValue, size, fgColor, bgColor, errorCorrectionLevel, quietZone, logoDataUri, logoSizeRatio, excavateLogo, backgroundImage, enableLogoCustomization, enableBackgroundCustomization, enableFrameCustomization, selectedFrameType, frameText, toast, t, mobileAccordionValue, isMobile]);


  const handleShareQRCode = async () => {
    const useBackground = (enableBackgroundCustomization && mobileAccordionValue.includes("background")) || (enableBackgroundCustomization && !isMobile && backgroundImage);
    const activeBgImage = useBackground ? backgroundImage : '';

    if (!qrValue || !qrCanvasRef.current) {
      toast({ title: t('toast.error.title'), description: t('toast.error.noQrToShare'), variant: "destructive" });
      return;
    }
    const canvasToShare = document.createElement('canvas');
    canvasToShare.width = size;
    canvasToShare.height = size;
    const ctxShare = canvasToShare.getContext('2d');
    const mainQrCanvas = qrCanvasRef.current.querySelector('canvas');

    if (!ctxShare || !mainQrCanvas) {
      toast({ title: t('toast.error.title'), description: t('toast.error.shareCreateBlobError'), variant: "destructive" });
      return;
    }

    const drawFinalImageForShare = (callback: (blob: Blob | null) => void) => {
      ctxShare.fillStyle = activeBgImage ? 'transparent' : bgColor;
      ctxShare.fillRect(0,0,size,size);

      if (activeBgImage) {
        const img = new window.Image();
        img.onload = () => {
          ctxShare.drawImage(img, 0, 0, size, size);
          ctxShare.drawImage(mainQrCanvas, 0, 0);
          canvasToShare.toBlob(callback, 'image/png');
        };
        img.onerror = () => {
          ctxShare.drawImage(mainQrCanvas, 0, 0);
          toast({ title: t('toast.error.title'), description: t('toast.error.loadImageError'), variant: "destructive" });
          canvasToShare.toBlob(callback, 'image/png');
        };
        img.src = activeBgImage;
      } else {
        ctxShare.drawImage(mainQrCanvas, 0, 0);
        canvasToShare.toBlob(callback, 'image/png');
      }
    };

    drawFinalImageForShare(async (blob) => {
      if (!blob) {
        toast({ title: t('toast.error.title'), description: t('toast.error.shareCreateBlobError'), variant: "destructive" });
        return;
      }
      const file = new File([blob], `qrcode_share.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: 'QR Code', text: `QR Code for ${qrValue}`, files: [file] });
          toast({ title: t('toast.shared.title'), description: t('toast.shared.description') });
        } catch (error) {
          if ((error as DOMException).name !== 'AbortError') {
            toast({ title: t('toast.shareFailed.title'), description: t('toast.shareFailed.description'), variant: "destructive" });
          }
        }
      } else {
        toast({ title: t('toast.shareNotSupported.title'), description: t('toast.shareNotSupported.description'), variant: "default" });
      }
    });
  };

  const handleCopyQRCodeImage = async () => {
    const useBackground = (enableBackgroundCustomization && mobileAccordionValue.includes("background")) || (enableBackgroundCustomization && !isMobile && backgroundImage);
    const activeBgImage = useBackground ? backgroundImage : '';


    if (!qrValue || !qrCanvasRef.current) {
      toast({ title: t('toast.error.title'), description: t('toast.error.noQrToCopy'), variant: "destructive" });
      return;
    }
    const canvasToCopy = document.createElement('canvas');
    canvasToCopy.width = size;
    canvasToCopy.height = size;
    const ctxCopy = canvasToCopy.getContext('2d');
    const mainQrCanvas = qrCanvasRef.current.querySelector('canvas');

    if (!ctxCopy || !mainQrCanvas) {
      toast({ title: t('toast.error.title'), description: t('toast.error.copyCreateBlobError'), variant: "destructive" });
      return;
    }

    const drawFinalImageForCopy = (callback: (blob: Blob | null) => void) => {
      ctxCopy.fillStyle = activeBgImage ? 'transparent' : bgColor;
      ctxCopy.fillRect(0,0,size,size);

      if (activeBgImage) {
        const img = new window.Image();
        img.onload = () => {
          ctxCopy.drawImage(img, 0, 0, size, size);
          ctxCopy.drawImage(mainQrCanvas, 0, 0);
          canvasToCopy.toBlob(callback, 'image/png');
        };
        img.onerror = () => {
          ctxCopy.drawImage(mainQrCanvas, 0, 0);
          toast({ title: t('toast.error.title'), description: t('toast.error.loadImageError'), variant: "destructive" });
          canvasToCopy.toBlob(callback, 'image/png');
        };
        img.src = activeBgImage;
      } else {
        ctxCopy.drawImage(mainQrCanvas, 0, 0);
        canvasToCopy.toBlob(callback, 'image/png');
      }
    };

    drawFinalImageForCopy(async (blob) => {
      if (!blob) {
        toast({ title: t('toast.error.title'), description: t('toast.error.copyCreateBlobError'), variant: "destructive" });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          const clipboardItem = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([clipboardItem]);
          toast({ title: t('toast.copied.title'), description: t('toast.copied.description') });
        } catch (error) {
          toast({ title: t('toast.copyFailed.title'), description: t('toast.copyFailed.description'), variant: "destructive" });
        }
      } else {
        toast({ title: t('toast.copyNotSupported.title'), description: t('toast.copyNotSupported.description'), variant: "default" });
      }
    });
  };

  const resetAppearanceCustomization = () => {
    setFgColor(DEFAULT_FG_COLOR);
    setBgColor('#FFFFFF');
    setSize(256);
    setErrorCorrectionLevel('H');
    setQuietZone(4);

    setLogoDataUri('');
    setLogoSizeRatio(0.2);
    setExcavateLogo(true);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setBackgroundImage('');
    if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = "";

    setSelectedFrameType('none');
    setFrameText('');

    setEnableLogoCustomization(false);
    setEnableBackgroundCustomization(false);
    setEnableFrameCustomization(false);
    setMobileAccordionValue([]);


    toast({ title: t('toast.customizationReset.title'), description: t('toast.customizationReset.description') });
  }

  useEffect(() => {
    setEnableLogoCustomization(mobileAccordionValue.includes("logo"));
    setEnableBackgroundCustomization(mobileAccordionValue.includes("background"));
    setEnableFrameCustomization(mobileAccordionValue.includes("frame"));

    if (!mobileAccordionValue.includes("logo")) {


    }
    if (!mobileAccordionValue.includes("background")) {


    }
    if (!mobileAccordionValue.includes("frame")) {


    }
  }, [mobileAccordionValue]);


  const resetContentSpecificFields = (contentTypeToReset?: QRContentType) => {
    setQrValue('');

    if (contentTypeToReset === 'url' || !contentTypeToReset) setUrlInput('');
    if (contentTypeToReset === 'wifi' || !contentTypeToReset) {
      setWifiSsid(''); setWifiPassword(''); setWifiEncryption('WPA'); setWifiHidden(false);
    }
    if (contentTypeToReset === 'vcard' || !contentTypeToReset) {
      setVcardFirstName(''); setVcardLastName(''); setVcardOrganization(''); setVcardTitle('');
      setVcardPhone(''); setVcardEmail(''); setVcardWebsite(''); setVcardAddress('');
      setVcardCity(''); setVcardState(''); setVcardZip(''); setVcardCountry('');
    }
    if (contentTypeToReset === 'vevent' || !contentTypeToReset) {
      setVeventSummary(''); setVeventDescription(''); setVeventLocation('');
      setVeventStartDate(''); setVeventStartTime(''); setVeventEndDate('');
      setVeventEndTime(''); setVeventIsAllDay(false);
    }
    if (contentTypeToReset === 'email' || !contentTypeToReset) {
      setEmailTo(''); setEmailSubject(''); setEmailBody('');
    }
    if (contentTypeToReset === 'sms' || !contentTypeToReset) {
      setSmsTo(''); setSmsBody('');
    }
    if (contentTypeToReset === 'geo' || !contentTypeToReset) {
      setGeoLatitude(''); setGeoLongitude('');
    }
    if (contentTypeToReset === 'whatsapp' || !contentTypeToReset) {
      setWhatsappTo(''); setWhatsappMessage('');
    }
    if (contentTypeToReset === 'phone' || !contentTypeToReset) {
      setPhoneTo('');
    }
  };

  const handleContentTypeChange = (newContentType: QRContentType) => {
    const contentTypeToReset = activeContentType;
    resetContentSpecificFields(contentTypeToReset);
    setActiveContentType(newContentType);
  };


  const loadFromHistory = (entry: QRCodeEntry) => {
    resetContentSpecificFields();
    setActiveContentType(entry.contentType);


    if (entry.contentType === 'url') setUrlInput(entry.originalInput);

    setWifiSsid(entry.wifiSsid || '');
    setWifiPassword(entry.wifiPassword || '');
    setWifiEncryption(entry.wifiEncryption || 'WPA');
    setWifiHidden(entry.wifiHidden || false);

    setVcardFirstName(entry.vcardFirstName || '');
    setVcardLastName(entry.vcardLastName || '');
    setVcardOrganization(entry.vcardOrganization || '');
    setVcardTitle(entry.vcardTitle || '');
    setVcardPhone(entry.vcardPhone || '');
    setVcardEmail(entry.vcardEmail || '');
    setVcardWebsite(entry.vcardWebsite || '');
    setVcardAddress(entry.vcardAddress || '');
    setVcardCity(entry.vcardCity || '');
    setVcardState(entry.vcardState || '');
    setVcardZip(entry.vcardZip || '');
    setVcardCountry(entry.vcardCountry || '');

    setVeventSummary(entry.veventSummary || '');
    setVeventDescription(entry.veventDescription || '');
    setVeventLocation(entry.veventLocation || '');
    setVeventStartDate(entry.veventStartDate || '');
    setVeventStartTime(entry.veventStartTime || '');
    setVeventEndDate(entry.veventEndDate || '');
    setVeventEndTime(entry.veventEndTime || '');
    setVeventIsAllDay(entry.veventIsAllDay || false);

    setEmailTo(entry.emailTo || '');
    setEmailSubject(entry.emailSubject || '');
    setEmailBody(entry.emailBody || '');

    setSmsTo(entry.smsTo || '');
    setSmsBody(entry.smsBody || '');

    setGeoLatitude(entry.geoLatitude || '');
    setGeoLongitude(entry.geoLongitude || '');

    setWhatsappTo(entry.whatsappTo || '');
    setWhatsappMessage(entry.whatsappMessage || '');
    setPhoneTo(entry.phoneTo || '');


    setQrValue(entry.qrValue);
    setFgColor(entry.fgColor);
    setBgColor(entry.bgColor);
    setSize(entry.size);
    setErrorCorrectionLevel(entry.level);
    setQuietZone(entry.margin);

    const newAccordionValues: string[] = [];

    setEnableLogoCustomization(!!entry.enableLogoCustomization);
    setEnableBackgroundCustomization(!!entry.enableBackgroundCustomization);
    setEnableFrameCustomization(!!entry.enableFrameCustomization);

    if (entry.enableLogoCustomization) newAccordionValues.push("logo");
    if (entry.enableBackgroundCustomization) newAccordionValues.push("background");
    if (entry.enableFrameCustomization) newAccordionValues.push("frame");


    const hasNonDefaultAppearance = entry.fgColor !== DEFAULT_FG_COLOR ||
        entry.bgColor !== '#FFFFFF' ||
        entry.size !== 256 ||
        entry.level !== 'H' ||
        entry.margin !== 4;

    if (hasNonDefaultAppearance) {
      newAccordionValues.push("appearance");
    }

    setMobileAccordionValue(newAccordionValues);


    if (entry.logoDataUri) {
      setLogoDataUri(entry.logoDataUri);
      setLogoSizeRatio(entry.logoSizeRatio || 0.2);
      setExcavateLogo(entry.excavateLogo === undefined ? true : entry.excavateLogo);
    } else {
      setLogoDataUri('');
    }
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (entry.backgroundImage) {
      setBackgroundImage(entry.backgroundImage);
    } else {
      setBackgroundImage('');
    }
    if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = "";

    setSelectedFrameType(entry.selectedFrameType || 'none');
    setFrameText(entry.frameText || '');

    toast({ title: t('toast.settingsLoaded.title'), description: t('toast.settingsLoaded.description') });
    if (typeof onHistorySheetOpenChange === 'function') {
      onHistorySheetOpenChange(false);
    }
    if (isMobile) {
      setIsControlsSheetOpen(true);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast({ title: t('toast.historyCleared.title'), description: t('toast.historyCleared.description') });
  };


  const useActualBackground = (enableBackgroundCustomization && mobileAccordionValue.includes("background")) || (enableBackgroundCustomization && !isMobile && backgroundImage);
  const qrCanvasActualBgColor = useActualBackground ? 'transparent' : bgColor;
  const logoActuallyActive = (enableLogoCustomization && logoDataUri && mobileAccordionValue.includes("logo")) || (enableLogoCustomization && logoDataUri && !isMobile) ;
  const frameActuallyActive = (enableFrameCustomization && selectedFrameType !== 'none' && mobileAccordionValue.includes("frame")) || (enableFrameCustomization && selectedFrameType !== 'none' && !isMobile);
  const textForFrame = selectedFrameType === 'scanMeBottom' ? "SCAN ME" : frameText;
  const displaySize = Math.min(size, isMobile ? 200 : 260);

  const getQrWrapperStyle = () => {
    const style: React.CSSProperties = {
      padding: '0px',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.375rem',
      display: 'inline-block',
      position: 'relative',
      backgroundColor: useActualBackground ? 'transparent' : (frameActuallyActive ? bgColor : 'hsl(var(--muted))'),
    };

    if (useActualBackground) {
      style.backgroundImage = `url(${backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }

    if (frameActuallyActive) {
      style.padding = `${FRAME_PADDING}px`;
      style.border = `2px solid ${fgColor}`;
      if (selectedFrameType === 'roundedBorderTextBottom') {
        style.borderRadius = `${FRAME_BORDER_RADIUS}px`;
      } else {
        style.borderRadius = '0.375rem';
      }
    } else {
      style.padding = '0px';
      style.border = useActualBackground ? 'none' : '1px solid hsl(var(--border))';
    }
    return style;
  }

  const qrCanvasWrapperStyle: React.CSSProperties = {
    backgroundColor: qrCanvasActualBgColor,
    display: 'inline-block',
    maxWidth: '100%',
    borderRadius: frameActuallyActive ? '0px' : 'calc(0.375rem - 1px)',
    padding: '0px',
  };


  const processQrImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: t('toast.uploadError.title'), description: t('toast.uploadError.descriptionImageFile'), variant: "destructive" });
      return;
    }
    setIsScanningImage(true);
    setScannedImageQrResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setScannedImagePreview(e.target?.result as string);
      const img = new window.Image();
      img.onload = () => {
        const canvas = imageScanCanvasRef.current;
        if (!canvas) {
          toast({ title: t('toast.error.title'), description: t('scannerDialog.scanImage.canvasError'), variant: "destructive" });
          setIsScanningImage(false);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          toast({ title: t('toast.error.title'), description: t('scannerDialog.scanImage.canvasError'), variant: "destructive" });
          setIsScanningImage(false);
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          setScannedImageQrResult(code.data);
          toast({ title: t('scannerDialog.scanImage.successTitle'), description: t('scannerDialog.scanImage.successDescription', { data: code.data.substring(0, 50) + (code.data.length > 50 ? '...' : '') }) });
        } else {
          setScannedImageQrResult(null);
          toast({ variant: 'destructive', title: t('scannerDialog.scanImage.notFoundTitle'), description: t('scannerDialog.scanImage.notFoundDescription') });
        }
        setIsScanningImage(false);
      };
      img.onerror = () => {
        toast({ title: t('toast.error.title'), description: t('scannerDialog.scanImage.loadError'), variant: "destructive" });
        setIsScanningImage(false);
        setScannedImagePreview(null);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast({ title: t('toast.readError.title'), description: t('toast.readError.description'), variant: "destructive" });
      setIsScanningImage(false);
      setScannedImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileForScanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processQrImage(file);
    }
  };

  const handlePasteImageForScan = async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast({ variant: "destructive", title: t('toast.error.title'), description: t('scannerDialog.pasteNotSupported') });
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            processQrImage(new File([blob], "pasted_image.png", { type: blob.type }));
            return;
          }
        }
      }
      toast({ variant: "destructive", title: t('toast.error.title'), description: t('scannerDialog.noImageInClipboard') });
    } catch (err) {
      console.error("Paste error:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        toast({ variant: "destructive", title: t('toast.error.title'), description: t('scannerDialog.pastePermissionDenied') });
      } else {
        toast({ variant: "destructive", title: t('toast.error.title'), description: t('scannerDialog.pasteFailed') });
      }
    }
  };

  const handleCopyScannedResult = () => {
    if (scannedImageQrResult) {
      navigator.clipboard.writeText(scannedImageQrResult)
          .then(() => toast({ title: t('toast.copied.title'), description: t('toast.copied.descriptionScanResult') }))
          .catch(() => toast({ variant: 'destructive', title: t('toast.copyFailed.title'), description: t('toast.copyFailed.descriptionScanResult') }));
    }
  };


  const renderCurrentForm = (isMobileLayout: boolean = false) => {
    const inputHeightClass = "h-9";
    const inputPaddingClass = "py-1.5";
    const mainInputPaddingClass = isMobileLayout ? "py-1.5" : "py-2";


    switch (activeContentType) {
      case 'url':
        return (
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm font-medium text-foreground">{t('urlOrTextToEncode.label')}</Label>
              <Input
                  id="url-input"
                  type="text"
                  placeholder={t('urlOrTextToEncode.placeholder')}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onBlur={handleUrlBlur}
                  className={`${isMobileLayout ? `h-9 ${mainInputPaddingClass}` : 'h-10 py-2'} transition-all duration-300 focus:shadow-outline-primary`}
              />
            </div>
        );
      case 'wifi':
        return (
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="wifi-ssid" className="text-sm font-medium text-foreground">{t('wifiDialog.ssid.label')}</Label>
                <Input id="wifi-ssid" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder={t('wifiDialog.ssid.placeholder')} className={inputHeightClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="wifi-password" className="text-sm font-medium text-foreground">{t('wifiDialog.password.label')}</Label>
                <Input id="wifi-password" type="password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder={t('wifiDialog.password.placeholder')} disabled={wifiEncryption === 'nopass'} className={inputHeightClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="wifi-encryption" className="text-sm font-medium text-foreground">{t('wifiDialog.encryption.label')}</Label>
                <Select value={wifiEncryption} onValueChange={(v) => setWifiEncryption(v as WifiEncryptionType)}>
                  <SelectTrigger id="wifi-encryption" className={`${inputHeightClass} text-sm`}>
                    <SelectValue placeholder={t('wifiDialog.encryption.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA" className="text-sm">{t('wifiDialog.encryption.wpa')}</SelectItem>
                    <SelectItem value="WEP" className="text-sm">{t('wifiDialog.encryption.wep')}</SelectItem>
                    <SelectItem value="nopass" className="text-sm">{t('wifiDialog.encryption.none')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="wifi-hidden" checked={wifiHidden} onCheckedChange={(c) => setWifiHidden(c as boolean)} />
                <Label htmlFor="wifi-hidden" className="text-sm font-medium text-foreground">{t('wifiDialog.hidden.label')}</Label>
              </div>
            </div>
        );
      case 'vcard':
        return (
            <ScrollArea className="h-[250px] sm:h-[300px] pr-3">
              <div className="space-y-3">
                <div className={`grid grid-cols-1 ${isMobileLayout ? '' : 'sm:grid-cols-2'} gap-3`}>
                  <div><Label htmlFor="vcard-firstName" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.firstName.label')}</Label><Input id="vcard-firstName" value={vcardFirstName} onChange={(e) => setVcardFirstName(e.target.value)} placeholder={t('contentTypes.vcard.firstName.placeholder')} className={inputHeightClass} /></div>
                  <div><Label htmlFor="vcard-lastName" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.lastName.label')}</Label><Input id="vcard-lastName" value={vcardLastName} onChange={(e) => setVcardLastName(e.target.value)} placeholder={t('contentTypes.vcard.lastName.placeholder')} className={inputHeightClass} /></div>
                </div>
                <div><Label htmlFor="vcard-organization" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.organization.label')}</Label><Input id="vcard-organization" value={vcardOrganization} onChange={(e) => setVcardOrganization(e.target.value)} placeholder={t('contentTypes.vcard.organization.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vcard-title" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.title.label')}</Label><Input id="vcard-title" value={vcardTitle} onChange={(e) => setVcardTitle(e.target.value)} placeholder={t('contentTypes.vcard.title.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vcard-phone" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.phone.label')}</Label><Input id="vcard-phone" type="tel" value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} placeholder={t('contentTypes.vcard.phone.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vcard-email" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.email.label')}</Label><Input id="vcard-email" type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} placeholder={t('contentTypes.vcard.email.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vcard-website" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.website.label')}</Label><Input id="vcard-website" type="url" value={vcardWebsite} onChange={(e) => setVcardWebsite(e.target.value)} placeholder={t('contentTypes.vcard.website.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vcard-address" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.address.label')}</Label><Input id="vcard-address" value={vcardAddress} onChange={(e) => setVcardAddress(e.target.value)} placeholder={t('contentTypes.vcard.address.placeholder')} className={inputHeightClass} /></div>
                <div className={`grid grid-cols-1 ${isMobileLayout ? '' : 'sm:grid-cols-2'} gap-3`}>
                  <div><Label htmlFor="vcard-city" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.city.label')}</Label><Input id="vcard-city" value={vcardCity} onChange={(e) => setVcardCity(e.target.value)} placeholder={t('contentTypes.vcard.city.placeholder')} className={inputHeightClass} /></div>
                  <div><Label htmlFor="vcard-state" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.state.label')}</Label><Input id="vcard-state" value={vcardState} onChange={(e) => setVcardState(e.target.value)} placeholder={t('contentTypes.vcard.state.placeholder')} className={inputHeightClass} /></div>
                </div>
                <div className={`grid grid-cols-1 ${isMobileLayout ? '' : 'sm:grid-cols-2'} gap-3`}>
                  <div><Label htmlFor="vcard-zip" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.zip.label')}</Label><Input id="vcard-zip" value={vcardZip} onChange={(e) => setVcardZip(e.target.value)} placeholder={t('contentTypes.vcard.zip.placeholder')} className={inputHeightClass} /></div>
                  <div><Label htmlFor="vcard-country" className="text-sm font-medium text-foreground">{t('contentTypes.vcard.country.label')}</Label><Input id="vcard-country" value={vcardCountry} onChange={(e) => setVcardCountry(e.target.value)} placeholder={t('contentTypes.vcard.country.placeholder')} className={inputHeightClass} /></div>
                </div>
              </div>
            </ScrollArea>
        );
      case 'vevent':
        return (
            <ScrollArea className="h-[250px] sm:h-[300px] pr-3">
              <div className="space-y-3">
                <div><Label htmlFor="vevent-summary" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.summary.label')}</Label><Input id="vevent-summary" value={veventSummary} onChange={(e) => setVeventSummary(e.target.value)} placeholder={t('contentTypes.vevent.summary.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vevent-location" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.location.label')}</Label><Input id="vevent-location" value={veventLocation} onChange={(e) => setVeventLocation(e.target.value)} placeholder={t('contentTypes.vevent.location.placeholder')} className={inputHeightClass} /></div>
                <div><Label htmlFor="vevent-description" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.description.label')}</Label><Textarea id="vevent-description" value={veventDescription} onChange={(e) => setVeventDescription(e.target.value)} placeholder={t('contentTypes.vevent.description.placeholder')} className={isMobileLayout ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`} /></div>
                <div className={`grid grid-cols-1 ${isMobileLayout ? '' : 'sm:grid-cols-2'} gap-3`}>
                  <div><Label htmlFor="vevent-startDate" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.startDate.label')}</Label><Input id="vevent-startDate" type="date" value={veventStartDate} onChange={(e) => setVeventStartDate(e.target.value)} className={inputHeightClass} /></div>
                  <div><Label htmlFor="vevent-startTime" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.startTime.label')}</Label><Input id="vevent-startTime" type="time" value={veventStartTime} onChange={(e) => setVeventStartTime(e.target.value)} disabled={veventIsAllDay} className={inputHeightClass} /></div>
                </div>
                <div className={`grid grid-cols-1 ${isMobileLayout ? '' : 'sm:grid-cols-2'} gap-3`}>
                  <div><Label htmlFor="vevent-endDate" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.endDate.label')}</Label><Input id="vevent-endDate" type="date" value={veventEndDate} onChange={(e) => setVeventEndDate(e.target.value)} className={inputHeightClass} /></div>
                  <div><Label htmlFor="vevent-endTime" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.endTime.label')}</Label><Input id="vevent-endTime" type="time" value={veventEndTime} onChange={(e) => setVeventEndTime(e.target.value)} disabled={veventIsAllDay} className={inputHeightClass} /></div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="vevent-isAllDay" checked={veventIsAllDay} onCheckedChange={(c) => setVeventIsAllDay(c as boolean)} />
                  <Label htmlFor="vevent-isAllDay" className="text-sm font-medium text-foreground">{t('contentTypes.vevent.allDay.label')}</Label>
                </div>
              </div>
            </ScrollArea>
        );
      case 'email':
        return (
            <div className="space-y-3">
              <div><Label htmlFor="email-to" className="text-sm font-medium text-foreground">{t('contentTypes.email.to.label')}</Label><Input id="email-to" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder={t('contentTypes.email.to.placeholder')} className={inputHeightClass} /></div>
              <div><Label htmlFor="email-subject" className="text-sm font-medium text-foreground">{t('contentTypes.email.subject.label')}</Label><Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder={t('contentTypes.email.subject.placeholder')} className={inputHeightClass} /></div>
              <div><Label htmlFor="email-body" className="text-sm font-medium text-foreground">{t('contentTypes.email.body.label')}</Label><Textarea id="email-body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder={t('contentTypes.email.body.placeholder')} className={isMobileLayout ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`} /></div>
            </div>
        );
      case 'sms':
        return (
            <div className="space-y-3">
              <div><Label htmlFor="sms-to" className="text-sm font-medium text-foreground">{t('contentTypes.sms.to.label')}</Label><Input id="sms-to" type="tel" value={smsTo} onChange={(e) => setSmsTo(e.target.value)} placeholder={t('contentTypes.sms.to.placeholder')} className={inputHeightClass} /></div>
              <div><Label htmlFor="sms-body" className="text-sm font-medium text-foreground">{t('contentTypes.sms.body.label')}</Label><Textarea id="sms-body" value={smsBody} onChange={(e) => setSmsBody(e.target.value)} placeholder={t('contentTypes.sms.body.placeholder')} className={isMobileLayout ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`} /></div>
            </div>
        );
      case 'geo':
        return (
            <div className="space-y-3">
              <div><Label htmlFor="geo-latitude" className="text-sm font-medium text-foreground">{t('contentTypes.geo.latitude.label')}</Label><Input id="geo-latitude" type="number" step="any" value={geoLatitude} onChange={(e) => setGeoLatitude(e.target.value)} placeholder={t('contentTypes.geo.latitude.placeholder')} className={inputHeightClass} /></div>
              <div><Label htmlFor="geo-longitude" className="text-sm font-medium text-foreground">{t('contentTypes.geo.longitude.label')}</Label><Input id="geo-longitude" type="number" step="any" value={geoLongitude} onChange={(e) => setGeoLongitude(e.target.value)} placeholder={t('contentTypes.geo.longitude.placeholder')} className={inputHeightClass} /></div>
            </div>
        );
      case 'whatsapp':
        return (
            <div className="space-y-3">
              <div><Label htmlFor="whatsapp-to" className="text-sm font-medium text-foreground">{t('contentTypes.whatsapp.to.label')}</Label><Input id="whatsapp-to" type="tel" value={whatsappTo} onChange={(e) => setWhatsappTo(e.target.value)} placeholder={t('contentTypes.whatsapp.to.placeholder')} className={inputHeightClass} /></div>
              <div><Label htmlFor="whatsapp-message" className="text-sm font-medium text-foreground">{t('contentTypes.whatsapp.message.label')}</Label><Textarea id="whatsapp-message" value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} placeholder={t('contentTypes.whatsapp.message.placeholder')} className={isMobileLayout ? `min-h-[60px] ${inputPaddingClass}` : `min-h-[80px] py-2`} /></div>
            </div>
        );
      case 'phone':
        return (
            <div className="space-y-3">
              <div><Label htmlFor="phone-to" className="text-sm font-medium text-foreground">{t('contentTypes.phone.to.label')}</Label><Input id="phone-to" type="tel" value={phoneTo} onChange={(e) => setPhoneTo(e.target.value)} placeholder={t('contentTypes.phone.to.placeholder')} className={inputHeightClass} /></div>
            </div>
        );
      default:
        return null;
    }
  };

  const renderDesktopLayout = () => (
      <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 bg-background">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <ScanQrCode className="w-8 h-8 sm:w-10 sm:h-10 text-primary mr-2 animate-text-glow-primary" />
                  <CardTitle className="text-2xl sm:text-3xl font-headline text-primary animate-text-glow-primary">{t('qrCodeMinimal.title')}</CardTitle>
                </div>
                <CardDescription className="font-body text-xs sm:text-sm text-muted-foreground">
                  {t('qrCodeMinimal.description')}
                </CardDescription>
              </div>
              <div className="hidden md:flex items-center space-x-1 sm:space-x-2 shrink-0 ml-4">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>

          <div className="px-4 sm:px-6 pb-2 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <Button variant="outline" className="w-full sm:w-auto hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary" onClick={() => { onScannerOpenChange(true);}}>
              <ScanLine className="w-5 h-5 mr-2 animate-text-glow-primary" /> {t('scanQrCode.button')}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary" onClick={() => onHistorySheetOpenChange(true)}>
              <HistoryIcon className="w-5 h-5 mr-2 animate-text-glow-primary" /> {t('viewHistory.button')}
            </Button>
          </div>


          <Tabs value={activeContentType} onValueChange={(value) => handleContentTypeChange(value as QRContentType)} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap px-4 sm:px-6">
              <TabsList className="inline-flex w-auto p-1 mb-4 bg-muted rounded-md">
                <TabsTrigger value="url" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <LinkIcon className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.url.tab')}
                </TabsTrigger>
                <TabsTrigger value="wifi" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <Wifi className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.wifi.tab')}
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <MessageSquareText className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.whatsapp.tab')}
                </TabsTrigger>
                <TabsTrigger value="phone" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <Phone className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.phone.tab')}
                </TabsTrigger>
                <TabsTrigger value="vcard" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <User className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.vcard.tab')}
                </TabsTrigger>
                <TabsTrigger value="vevent" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <CalendarDays className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.vevent.tab')}
                </TabsTrigger>
                <TabsTrigger value="email" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <Mail className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.email.tab')}
                </TabsTrigger>
                <TabsTrigger value="sms" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <MessageSquare className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.sms.tab')}
                </TabsTrigger>
                <TabsTrigger value="geo" className="text-[10px] px-1.5 py-1.5 h-auto leading-tight sm:text-xs sm:px-2.5 md:text-sm md:px-3 data-[state=active]:shadow-sm">
                  <MapPin className="w-3 h-3 mr-1 sm:w-3 sm:h-3 sm:mr-1 md:w-4 md:h-4 md:mr-1.5 animate-text-glow-primary" />{t('contentTypes.geo.tab')}
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2 mt-[-6px]" />
            </ScrollArea>

            <TabsContent value={activeContentType} className="px-4 sm:px-6">
              {renderCurrentForm(false)}
            </TabsContent>
          </Tabs>

          <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
            <Separator />
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold font-headline flex items-center text-primary">
                  <Palette className="w-5 h-5 mr-2 text-primary animate-text-glow-primary" />
                  {t('customizeAppearance.title')}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetAppearanceCustomization} className="text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3 mr-1" /> {t('reset.button')}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fg-color" className="text-sm font-medium text-foreground">{t('foregroundColor.label')}</Label>
                  <Input id="fg-color" type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-9 p-1"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color" className="text-sm font-medium text-foreground">{t('backgroundColor.label')}</Label>
                  <Input id="bg-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-9 p-1" disabled={(enableBackgroundCustomization && !!backgroundImage) || (enableFrameCustomization && selectedFrameType !== 'none')}/>
                  {( (enableBackgroundCustomization && !!backgroundImage) || (enableFrameCustomization && selectedFrameType !== 'none') ) && <p className="text-xs text-muted-foreground">{t('backgroundColorDisabledHint')}</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="size-slider" className="text-sm font-medium text-foreground">{t('sizePx.label')}</Label>
                    <span className="text-sm text-foreground">{size}px</span>
                  </div>
                  <Slider id="size-slider" min={50} max={1000} step={1} value={[size]} onValueChange={(value) => setSize(value[0])} className="transition-all duration-300"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="error-correction" className="text-sm flex items-center font-medium text-foreground">
                    <ShieldCheck className="w-4 h-4 mr-1 text-primary animate-text-glow-primary" /> {t('errorCorrection.label')}
                  </Label>
                  <Select onValueChange={(value) => setErrorCorrectionLevel(value as ErrorCorrectionLevel)} value={errorCorrectionLevel}>
                    <SelectTrigger id="error-correction" className="text-sm h-9"><SelectValue placeholder={t('errorCorrection.label')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L" className="text-sm">{t('errorCorrection.levelL')}</SelectItem>
                      <SelectItem value="M" className="text-sm">{t('errorCorrection.levelM')}</SelectItem>
                      <SelectItem value="Q" className="text-sm">{t('errorCorrection.levelQ')}</SelectItem>
                      <SelectItem value="H" className="text-sm">{t('errorCorrection.levelH')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-zone" className="text-sm flex items-center font-medium text-foreground">
                    <Maximize className="w-4 h-4 mr-1 text-primary animate-text-glow-primary" /> {t('quietZone.label')}
                  </Label>
                  <Input id="quiet-zone" type="number" min="0" max="40" value={quietZone} onChange={(e) => setQuietZone(Number(e.target.value))} className="transition-all duration-300 focus:shadow-outline-primary h-9" placeholder={t('quietZone.placeholder')}/>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-headline flex items-center text-primary">
                  <ImageIcon className="w-5 h-5 mr-2 text-primary animate-text-glow-primary" />
                  {t('customizeQrBackground.title')}
                </h3>
                <Switch
                    id="enable-background"
                    checked={enableBackgroundCustomization}
                    onCheckedChange={(checked) => {
                      setEnableBackgroundCustomization(checked);
                      if (!checked) {
                        setBackgroundImage('');
                        if (backgroundImageInputRef.current) backgroundImageInputRef.current.value = "";
                      }
                    }}
                    aria-label={t('enableBackground.label')}
                />
              </div>
              {enableBackgroundCustomization && (
                  <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                    <div>
                      <Label htmlFor="bg-image-upload" className="text-sm font-medium text-foreground">{t('uploadBackgroundImage.label')}</Label>
                      <Input id="bg-image-upload" type="file" accept="image/*" ref={backgroundImageInputRef} onChange={handleBackgroundImageUpload} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:text-xs h-9 text-xs" />
                    </div>
                    {backgroundImage && (
                        <div className="flex flex-col items-start gap-2">
                          <img src={backgroundImage} alt={t('backgroundImagePreview.alt')} className="h-20 w-20 object-cover border rounded-md shadow" />
                          <Button variant="outline" size="sm" onClick={removeBackgroundImageFile} className="text-destructive hover:bg-destructive/10 hover:border-destructive/50 border-destructive/50 h-9">
                            <Trash2 className="w-4 h-4 mr-1" /> {t('removeBackgroundImage.button')}
                          </Button>
                        </div>
                    )}
                  </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-headline flex items-center text-primary">
                  <ImagePlus className="w-5 h-5 mr-2 text-primary animate-text-glow-primary" />
                  {t('customizeLogo.title')}
                </h3>
                <Switch
                    id="enable-logo"
                    checked={enableLogoCustomization}
                    onCheckedChange={(checked) => {
                      setEnableLogoCustomization(checked);
                      if (!checked) {
                        setLogoDataUri('');
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }
                    }}
                    aria-label={t('enableLogo.label')}
                />
              </div>
              {enableLogoCustomization && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pl-2 border-l-2 border-primary/20">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="logo-upload" className="text-sm font-medium text-foreground">{t('uploadLogo.label')}</Label>
                      <Input id="logo-upload" type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:text-xs h-9 text-xs" />
                      {logoDataUri && <img src={logoDataUri} alt="Logo preview" className="mt-2 h-16 w-16 object-contain border rounded-md" />}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo-size-ratio" className="text-sm font-medium text-foreground">{t('logoSizeRatio.label')}</Label>
                      <Input id="logo-size-ratio" type="number" min="0.05" max="0.4" step="0.01" value={logoSizeRatio} onChange={(e) => setLogoSizeRatio(parseFloat(e.target.value))} disabled={!logoDataUri} className="h-9" />
                    </div>
                    <div className="flex items-center space-x-2 pt-6 sm:pt-8">
                      <Checkbox id="excavate-logo" checked={excavateLogo} onCheckedChange={(checked) => setExcavateLogo(checked as boolean)} disabled={!logoDataUri} />
                      <Label htmlFor="excavate-logo" className="text-sm font-medium text-foreground">{t('cutoutAreaBehindLogo.label')}</Label>
                    </div>
                  </div>
              )}
            </div>

            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-headline flex items-center text-primary">
                  <Frame className="w-5 h-5 mr-2 text-primary animate-text-glow-primary" />
                  {t('customizeFrame.title')}
                </h3>
                <Switch
                    id="enable-frame"
                    checked={enableFrameCustomization}
                    onCheckedChange={(checked) => {
                      setEnableFrameCustomization(checked);
                      if (!checked) {
                        setSelectedFrameType('none');
                        setFrameText('');
                      }
                    }}
                    aria-label={t('enableFrame.label')}
                />
              </div>
              {enableFrameCustomization && (
                  <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                    <div>
                      <Label htmlFor="frame-type" className="text-sm font-medium text-foreground">{t('frameType.label')}</Label>
                      <Select value={selectedFrameType} onValueChange={(value) => setSelectedFrameType(value as FrameType)}>
                        <SelectTrigger id="frame-type" className="text-sm h-9">
                          <SelectValue placeholder={t('frameType.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-sm">{t('frameType.none')}</SelectItem>
                          <SelectItem value="simpleBorder" className="text-sm">{t('frameType.simpleBorder')}</SelectItem>
                          <SelectItem value="textBottom" className="text-sm">{t('frameType.textBottom')}</SelectItem>
                          <SelectItem value="scanMeBottom" className="text-sm">{t('frameType.scanMeBottom')}</SelectItem>
                          <SelectItem value="roundedBorderTextBottom" className="text-sm">{t('frameType.roundedBorderTextBottom')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(selectedFrameType === 'textBottom' || selectedFrameType === 'roundedBorderTextBottom') && (
                        <div>
                          <Label htmlFor="frame-text" className="text-sm font-medium text-foreground">{t('frameText.label')}</Label>
                          <Input
                              id="frame-text"
                              type="text"
                              value={frameText}
                              onChange={(e) => setFrameText(e.target.value)}
                              placeholder={t('frameText.placeholder')}
                              className="transition-all duration-300 focus:shadow-outline-primary h-9"
                          />
                        </div>
                    )}
                  </div>
              )}
            </div>


            <Button
                onClick={handleGenerateQRCode}
                disabled={isLoading}
                className="w-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 border-2 border-green-400/50 hover:border-green-400 hover:shadow-green-glow focus:shadow-green-glow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-base py-3"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <ScanQrCode className="w-5 h-5 mr-2 animate-text-glow-primary" />}
              {t('generateQrCode.button')}
            </Button>


            {qrValue && (
                <div className="mt-6 p-3 sm:p-4 border border-dashed border-primary/50 rounded-lg bg-card flex flex-col items-center space-y-4">
                  <div className="mb-2 p-2 border rounded-md bg-muted w-full text-center">
                    <Label className="text-xs text-muted-foreground">{t('encodedContent.label')}</Label>
                    <p className="text-sm font-mono break-all text-foreground" title={qrValue}>{qrValue}</p>
                  </div>
                  <div
                      className="qr-code-outer-wrapper"
                      style={getQrWrapperStyle()}
                  >
                    <div
                        ref={qrCanvasRef}
                        className="qr-code-canvas-wrapper"
                        style={qrCanvasWrapperStyle}
                    >
                      <QRCodeCanvas
                          value={qrValue} size={displaySize}
                          fgColor={fgColor}
                          bgColor={qrCanvasActualBgColor}
                          level={errorCorrectionLevel} margin={quietZone}
                          includeMargin={true}
                          imageSettings={logoActuallyActive ? { src: logoDataUri, height: displaySize * logoSizeRatio, width: displaySize * logoSizeRatio, excavate: excavateLogo, x: undefined, y: undefined } : undefined}
                          style={{maxWidth: '100%', height: 'auto', display: 'block'}}
                      />
                    </div>
                    {frameActuallyActive && (selectedFrameType === 'textBottom' || selectedFrameType === 'scanMeBottom' || selectedFrameType === 'roundedBorderTextBottom') && (
                        <div
                            className="frame-text-area text-center font-bold"
                            style={{
                              color: fgColor,
                              backgroundColor: useActualBackground ? 'transparent' : bgColor,
                              padding: '5px 0',
                              marginTop: selectedFrameType !== 'simpleBorder' ? '5px' : '0',
                              height: `${FRAME_TEXT_AREA_HEIGHT}px`,
                              lineHeight: `${FRAME_TEXT_AREA_HEIGHT - 10}px`,
                              boxSizing: 'border-box',
                              width: '100%'
                            }}
                        >
                          {textForFrame}
                        </div>
                    )}
                  </div>


                  <div className="w-full space-y-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary h-9">
                          <Download className="w-5 h-5 mr-2 animate-text-glow-primary" /> {t('downloadQrCode.button')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[calc(100%-2rem)] sm:w-[calc(var(--radix-dropdown-menu-trigger-width)-0rem)]">
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('png')}>
                          <ImageIcon className="w-4 h-4 mr-2 text-primary animate-text-glow-primary" /> PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('svg')}>
                          <FileJson className="w-4 h-4 mr-2 text-primary animate-text-glow-primary" /> SVG
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleCopyQRCodeImage} variant="outline" className="w-full hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary h-9"><ClipboardCopy className="w-5 h-5 mr-2 animate-text-glow-primary" />{t('copyImage.button')}</Button>
                    <Button onClick={handleShareQRCode} variant="outline" className="w-full hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary h-9"><Share2 className="w-5 h-5 mr-2 animate-text-glow-primary" />{t('shareQrCode.button')}</Button>
                  </div>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center text-center pt-3 px-4 sm:px-6">
            <Separator className="mt-0 mb-3"/>
            <p className="text-xs text-muted-foreground/70">
              {t('footer.madeByPrefix')}
              <a
                  href="https://lucas-lima.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary animate-text-glow-footer hover:underline"
              >
                Lucas Lima
              </a>
              {t('footer.madeBySuffix')}
            </p>
          </CardFooter>
        </Card>
      </div>
  );

  const renderMobileLayout = () => {
    const contentTypes: { value: QRContentType; Icon: React.FC; labelKey: string }[] = [
      { value: 'url',      Icon: LinkIcon,           labelKey: 'contentTypes.url.tab' },
      { value: 'wifi',     Icon: Wifi,               labelKey: 'contentTypes.wifi.tab' },
      { value: 'whatsapp', Icon: MessageSquareText,  labelKey: 'contentTypes.whatsapp.tab' },
      { value: 'phone',    Icon: Phone,              labelKey: 'contentTypes.phone.tab' },
      { value: 'vcard',    Icon: User,               labelKey: 'contentTypes.vcard.tab' },
      { value: 'vevent',   Icon: CalendarDays,       labelKey: 'contentTypes.vevent.tab' },
      { value: 'email',    Icon: Mail,               labelKey: 'contentTypes.email.tab' },
      { value: 'sms',      Icon: MessageSquare,      labelKey: 'contentTypes.sms.tab' },
      { value: 'geo',      Icon: MapPin,             labelKey: 'contentTypes.geo.tab' },
    ];

    return (
        <div className="flex flex-col h-screen bg-background">
          {/* Cabeçalho */}
          <div className="flex-grow flex flex-col items-center justify-center p-2 space-y-3">
            <div className="flex items-center justify-center pt-2">
              <ScanQrCode className="w-7 h-7 text-primary mr-1.5 animate-text-glow-primary" />
              <h1 className="text-xl font-headline font-semibold text-primary animate-text-glow-primary">
                {t('qrCodeMinimal.title')}
              </h1>
            </div>

            {/* Preview do QR gerado ou placeholder */}
            {qrValue ? (
                <div className="p-3 border border-dashed border-primary/50 rounded-lg bg-card flex flex-col items-center space-y-3 w-full max-w-xs">
                  <div className="mb-1 p-1 border rounded-md bg-muted w-full text-center">
                    <Label className="text-[10px] text-muted-foreground">
                      {t('encodedContent.label')}
                    </Label>
                    <p
                        className="text-xs font-mono break-all text-foreground"
                        title={qrValue}
                    >
                      {qrValue}
                    </p>
                  </div>
                  <div className="qr-code-outer-wrapper" style={getQrWrapperStyle()}>
                    <div
                        ref={qrCanvasRef}
                        className="qr-code-canvas-wrapper"
                        style={qrCanvasWrapperStyle}
                    >
                      <QRCodeCanvas
                          value={qrValue}
                          size={displaySize}
                          fgColor={fgColor}
                          bgColor={qrCanvasActualBgColor}
                          level={errorCorrectionLevel}
                          margin={quietZone}
                          includeMargin
                          imageSettings={
                            logoActuallyActive
                                ? {
                                  src: logoDataUri,
                                  height: displaySize * logoSizeRatio,
                                  width: displaySize * logoSizeRatio,
                                  excavate: excavateLogo,
                                }
                                : undefined
                          }
                          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                    {frameActuallyActive &&
                        (selectedFrameType === 'textBottom' ||
                            selectedFrameType === 'scanMeBottom' ||
                            selectedFrameType === 'roundedBorderTextBottom') && (
                            <div
                                className="frame-text-area text-center font-bold text-xs"
                                style={{
                                  color: fgColor,
                                  backgroundColor: useActualBackground ? 'transparent' : bgColor,
                                  padding: '4px 0',
                                  marginTop: '4px',
                                  height: `${FRAME_TEXT_AREA_HEIGHT / 1.5}px`,
                                  lineHeight: `${(FRAME_TEXT_AREA_HEIGHT - 10) / 1.5}px`,
                                  boxSizing: 'border-box',
                                  width: '100%',
                                }}
                            >
                              {textForFrame}
                            </div>
                        )}
                  </div>
                  <div className="w-full space-y-2 pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full text-sm h-9">
                          <Download className="w-4 h-4 mr-2" /> {t('downloadQrCode.button')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-[calc(100vw-4rem)]">
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('png')}>
                          <ImageIcon className="w-4 h-4 mr-2" /> PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadQRCode('svg')}>
                          <FileJson className="w-4 h-4 mr-2" /> SVG
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleCopyQRCodeImage} variant="outline" className="w-full text-sm h-9">
                      <ClipboardCopy className="w-4 h-4 mr-2" /> {t('copyImage.button')}
                    </Button>
                    <Button onClick={handleShareQRCode} variant="outline" className="w-full text-sm h-9">
                      <Share2 className="w-4 h-4 mr-2" /> {t('shareQrCode.button')}
                    </Button>
                  </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-muted h-64 w-full max-w-xs">
                  <ScanQrCode className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">{t('mobile.noQrGenerated.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('mobile.noQrGenerated.description')}</p>
                </div>
            )}
          </div>

          {/* Sheet de controles */}
          <Sheet open={isControlsSheetOpen} onOpenChange={setIsControlsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm py-3 text-base shadow-lg z-50 transition-transform hover:scale-105 active:scale-95 border-2 border-green-400/50 hover:border-green-400">
                <Edit3 className="w-5 h-5 mr-2 animate-text-glow-primary" />
                {t('mobile.editOrNewLabel')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 bg-background">
              <SheetHeader className="p-4 border-b bg-background sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <SheetTitle className="flex items-center text-lg text-foreground">
                    <Settings className="w-5 h-5 mr-2 text-primary animate-text-glow-primary" />
                    {t('mobile.controlsPanel.title')}
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-grow">
                <div className="p-4 space-y-4 pb-6">
                  {/* 1. Grid de seleção de tipo */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {contentTypes.map(({ value, Icon, labelKey }) => (
                        <button
                            key={value}
                            onClick={() => handleContentTypeChange(value)}
                            className={`
                      flex flex-col items-center justify-center p-2 rounded-lg
                      ${activeContentType === value
                                ? 'ring-2 ring-primary'
                                : 'bg-muted hover:bg-muted/80'}
                    `}
                        >
                          <Icon
                              className={`w-6 h-6 mb-1 ${
                                  activeContentType === value
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                              }`}
                          />
                          <span className="text-[10px] text-center">{t(labelKey)}</span>
                        </button>
                    ))}
                  </div>

                  {/* 2. Formulário dinâmico */}
                  {renderCurrentForm(true)}

                  {/* 3. Personalização */}
                  <Accordion type="multiple" className="space-y-2">
                    {/* Appearance */}
                    <AccordionItem value="appearance" className="bg-muted/30 rounded-lg border">
                      <AccordionTrigger className="px-3 py-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-primary" />
                          {t('customizeAppearance.title')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-2 space-y-4">
                        {/* FG e BG */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>{t('foregroundColor.label')}</Label>
                            <Input
                                type="color"
                                value={fgColor}
                                onChange={e => setFgColor(e.target.value)}
                                className="w-full h-9 p-1"
                            />
                          </div>
                          <div>
                            <Label>{t('backgroundColor.label')}</Label>
                            <Input
                                type="color"
                                value={bgColor}
                                onChange={e => setBgColor(e.target.value)}
                                className="w-full h-9 p-1"
                            />
                          </div>
                        </div>
                        {/* Size Slider */}
                        <div>
                          <div className="flex justify-between">
                            <Label>{t('sizePx.label')}</Label>
                            <span>{size}px</span>
                          </div>
                          <Slider
                              min={50}
                              max={1000}
                              step={1}
                              value={[size]}
                              onValueChange={v => setSize(v[0])}
                          />
                        </div>
                        <div>
                          <Label>{t('errorCorrection.label')}</Label>
                          <Select
                              value={errorCorrectionLevel}
                              onValueChange={v => setErrorCorrectionLevel(v as ErrorCorrectionLevel)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(['L','M','Q','H'] as ErrorCorrectionLevel[]).map(l => (
                                  <SelectItem key={l} value={l}>
                                    {t(`errorCorrection.level${l}`)}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Quiet Zone */}
                        <div>
                          <Label>{t('quietZone.label')}</Label>
                          <Input
                              type="number"
                              min={0}
                              max={40}
                              value={quietZone}
                              onChange={e => setQuietZone(+e.target.value)}
                              className="h-9"
                          />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetAppearanceCustomization}
                            className="w-full"
                        >
                          {t('reset.button')}
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Background */}
                    <AccordionItem value="background" className="bg-muted/30 rounded-lg border">
                      <AccordionTrigger className="px-3 py-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          {t('customizeQrBackground.title')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-2 space-y-3">
                        <Input
                            type="file"
                            accept="image/*"
                            ref={backgroundImageInputRef}
                            onChange={handleBackgroundImageUpload}
                            className="file:text-xs h-9"
                        />
                        {backgroundImage && (
                            <div className="flex items-center gap-2">
                              <img
                                  src={backgroundImage}
                                  className="h-16 w-16 object-cover rounded"
                              />
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={removeBackgroundImageFile}
                              >
                                {t('removeBackgroundImage.button')}
                              </Button>
                            </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Logo */}
                    <AccordionItem value="logo" className="bg-muted/30 rounded-lg border">
                      <AccordionTrigger className="px-3 py-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <ImagePlus className="w-5 h-5 text-primary" />
                          {t('customizeLogo.title')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-2 space-y-3">
                        <Input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            className="file:text-xs h-9"
                        />
                        {logoDataUri && (
                            <img
                                src={logoDataUri}
                                className="h-12 w-12 object-contain rounded"
                            />
                        )}
                        <div>
                          <Label>{t('logoSizeRatio.label')}</Label>
                          <Input
                              type="number"
                              min={0.05}
                              max={0.4}
                              step={0.01}
                              value={logoSizeRatio}
                              onChange={e => setLogoSizeRatio(+e.target.value)}
                              className="h-9"
                          />
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                              checked={excavateLogo}
                              onCheckedChange={c => setExcavateLogo(c as boolean)}
                          />
                          <Label>{t('cutoutAreaBehindLogo.label')}</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Frame */}
                    <AccordionItem value="frame" className="bg-muted/30 rounded-lg border">
                      <AccordionTrigger className="px-3 py-2 flex justify-between">
                        <div className="flex items-center gap-2">
                          <Frame className="w-5 h-5 text-primary" />
                          {t('customizeFrame.title')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-4 pt-2 space-y-3">
                        <Select
                            value={selectedFrameType}
                            onValueChange={v => setSelectedFrameType(v as FrameType)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('frameType.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(['none','simpleBorder','textBottom','scanMeBottom','roundedBorderTextBottom'] as FrameType[]).map(ft => (
                                <SelectItem key={ft} value={ft}>
                                  {t(`frameType.${ft}`)}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(selectedFrameType === 'textBottom' ||
                            selectedFrameType === 'roundedBorderTextBottom') && (
                            <Input
                                type="text"
                                value={frameText}
                                onChange={e => setFrameText(e.target.value)}
                                placeholder={t('frameText.placeholder')}
                                className="h-9"
                            />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </ScrollArea>

              {/* Botão gerador */}
              <div className="p-4 border-t bg-background sticky bottom-0">
                <Button
                    onClick={handleGenerateQRCode}
                    disabled={isLoading}
                    className="w-full py-3 transition-transform hover:scale-105"
                >
                  {isLoading ? (
                      <RefreshCw className="animate-spin mr-2" />
                  ) : (
                      <ScanQrCode className="mr-2" />
                  )}
                  {t('generateQrCode.button')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
    );
  };

  if (!isClient || isMobile === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><ScanQrCode className="w-12 h-12 text-primary animate-pulse" /></div>;
  }

  const mainLayout = isMobile ? renderMobileLayout() : renderDesktopLayout();

  return (
      <>
        {mainLayout}

        <Dialog open={scannerOpen} onOpenChange={onScannerOpenChange}>
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] flex flex-col rounded-lg p-0">
            <DialogHeader className="p-4 border-b pr-10 sm:pr-12 shrink-0">
              <DialogTitle className="text-foreground text-left">{t('scannerDialog.title')}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-left">
                {t('scannerDialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-auto p-4">
              <Tabs defaultValue={initialScannerTab} value={initialScannerTab} onValueChange={(value) => onScannerTabChange(value as 'camera' | 'image')} className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 shrink-0">
                  <TabsTrigger value="image" className="text-xs sm:text-sm"><UploadCloud className="w-4 h-4 mr-1 sm:mr-2" />{t('scannerDialog.tabImage')}</TabsTrigger>
                  <TabsTrigger value="camera" className="text-xs sm:text-sm"><ScanLine className="w-4 h-4 mr-1 sm:mr-2" />{t('scannerDialog.tabCamera')}</TabsTrigger>
                </TabsList>
                <TabsContent value="camera" className="flex-grow flex flex-col items-center justify-center pt-4 min-h-0">
                  <div className="relative w-full aspect-video">
                    <video ref={videoRef} className="w-full h-full rounded-md bg-muted object-cover" autoPlay muted playsInline />
                    {initialScannerTab === 'camera' && hasCameraPermission === null && <p className="text-sm text-center text-muted-foreground mt-2">{t('scannerDialog.permissionRequesting')}</p> }
                    {initialScannerTab === 'camera' && hasCameraPermission === false && (
                        <Alert variant="destructive" className="items-center mt-2">
                          <CameraOff className="h-5 w-5" />
                          <AlertTitle>{t('scannerDialog.permissionDenied.title')}</AlertTitle>
                          <AlertDescription>
                            {t('scannerDialog.permissionDenied.description')}
                          </AlertDescription>
                        </Alert>
                    )}
                    {initialScannerTab === 'camera' && hasCameraPermission === true && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                          <div className="w-3/4 h-3/4 border-4 border-primary/50 rounded-lg animate-pulse"></div>
                        </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="image" className="flex-grow flex flex-col space-y-3 pt-4 pb-2 min-h-0">
                  <canvas ref={imageScanCanvasRef} style={{ display: 'none' }} />
                  <div>
                    <Label htmlFor="qr-image-upload" className="text-sm font-medium">{t('scannerDialog.scanImage.uploadLabel')}</Label>
                    <Input id="qr-image-upload" type="file" accept="image/*" ref={imageScanInputRef} onChange={handleImageFileForScanChange} className="mt-1 file:text-xs h-9 text-xs" />
                  </div>
                  <Button onClick={handlePasteImageForScan} variant="outline" className="w-full text-sm h-9">
                    <ClipboardCopy className="w-4 h-4 mr-2" /> {t('scannerDialog.scanImage.pasteButton')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">{t('scannerDialog.pasteTip')}</p>
                  {isScanningImage && <div className="flex items-center justify-center py-4"><RefreshCw className="w-6 h-6 animate-spin text-primary" /><p className="ml-2 text-sm text-muted-foreground">{t('scannerDialog.scanImage.loading')}</p></div>}
                  {scannedImagePreview && !isScanningImage && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t('scannerDialog.scanImage.previewLabel')}</Label>
                        <img src={scannedImagePreview} alt={t('scannerDialog.scanImage.previewAlt')} className="max-w-full max-h-48 object-contain border rounded-md mx-auto" />
                      </div>
                  )}
                  {scannedImageQrResult && !isScanningImage && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-sm font-medium">{t('scannerDialog.scanImage.resultLabel')}</Label>
                        <Card className="bg-muted">
                          <CardContent className="p-3">
                            <p className="text-sm break-all font-mono text-foreground">{scannedImageQrResult}</p>
                          </CardContent>
                        </Card>
                        <Button onClick={handleCopyScannedResult} variant="outline" size="sm" className="w-full h-9"><Copy className="w-4 h-4 mr-2" />{t('scannerDialog.scanImage.copyResultButton')}</Button>
                      </div>
                  )}
                  {!scannedImageQrResult && !isScanningImage && scannedImagePreview && (
                      <Alert variant="default" className="mt-2">
                        <AlertDescription>
                          {t('scannerDialog.scanImage.notFoundDetailed')}
                        </AlertDescription>
                      </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="p-4 border-t shrink-0">
              <Button variant="outline" onClick={() => onScannerOpenChange(false)} className="w-full sm:w-auto h-9">{t('scannerDialog.close.button')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={historySheetOpen} onOpenChange={onHistorySheetOpenChange} >
          <SheetContent
              side={isMobile ? "bottom" : "right"}
              className={`${isMobile ? 'h-[75vh] rounded-t-lg' : 'sm:max-w-md w-full'} flex flex-col p-0 bg-background`}
          >
            <SheetHeader className="p-4 border-b pr-10 sm:pr-12 shrink-0">
              <SheetTitle className="flex items-center text-foreground text-left">
                <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary animate-text-glow-primary shrink-0" /> <span className="truncate">{t('qrCodeHistory.title')}</span>
              </SheetTitle>
              <DialogDescription className="text-muted-foreground text-left">{t('history.sheetDescription')}</DialogDescription>
            </SheetHeader>
            <div className="flex-grow flex flex-col min-h-0">
              {history.length > 0 ? (
                  <>
                    <div className="px-4 pt-4 pb-2 flex justify-end shrink-0">
                      <Button variant="outline" size="sm" onClick={clearHistory} className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50 hover:shadow-destructive focus:shadow-destructive h-9"><Trash2 className="w-4 h-4 mr-1" /> {t('clearHistory.button')}</Button>
                    </div>
                    <ScrollArea className="flex-grow w-full px-4 pb-4">
                      <div className="space-y-3 sm:space-y-3 border p-2 sm:p-3 rounded-md bg-background">
                        {history.map((entry) => (
                            <Card key={entry.id} className="p-2.5 shadow-sm bg-card">
                              <div className={`flex items-center gap-2.5 sm:gap-3 flex-row`}>
                                <div className={`self-center sm:self-start p-0.5 rounded border border-border/50`}
                                     style={{
                                       backgroundColor: (entry.enableBackgroundCustomization && entry.backgroundImage) ? 'transparent' : entry.bgColor,
                                     }}
                                >
                                  <QRCodeCanvas
                                      value={entry.qrValue} size={isMobile ? 48 : 64} fgColor={entry.fgColor}
                                      bgColor={(entry.enableBackgroundCustomization && entry.backgroundImage) ? 'transparent' : entry.bgColor}
                                      level={entry.level} margin={1} includeMargin={true}
                                      imageSettings={entry.enableLogoCustomization && entry.logoDataUri ? { src: entry.logoDataUri, height: (isMobile ? 48 : 64) * (entry.logoSizeRatio || 0.2), width: (isMobile ? 48 : 64) * (entry.logoSizeRatio || 0.2), excavate: entry.excavateLogo ?? true } : undefined}
                                      className="rounded-sm shrink-0"
                                  />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <div className={`font-medium text-primary flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    {entry.contentType === 'url' && <LinkIcon className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'wifi' && <Wifi className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'vcard' && <User className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'vevent' && <CalendarDays className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'email' && <Mail className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'sms' && <MessageSquare className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'geo' && <MapPin className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'whatsapp' && <MessageSquareText className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    {entry.contentType === 'phone' && <Phone className={`mr-1.5 shrink-0 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />}
                                    <span className="truncate text-foreground" title={entry.originalInput}>{entry.originalInput}</span>
                                    {entry.contentType === 'wifi' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.wifi.historySuffix')}</span>}
                                    {entry.contentType === 'vcard' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.vcard.historySuffix')}</span>}
                                    {entry.contentType === 'vevent' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.vevent.historySuffix')}</span>}
                                    {entry.contentType === 'email' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.email.historySuffix')}</span>}
                                    {entry.contentType === 'sms' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.sms.historySuffix')}</span>}
                                    {entry.contentType === 'geo' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.geo.historySuffix')}</span>}
                                    {entry.contentType === 'whatsapp' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.whatsapp.historySuffix')}</span>}
                                    {entry.contentType === 'phone' && <span className="ml-1 text-xs text-muted-foreground">{t('contentTypes.phone.historySuffix')}</span>}
                                  </div>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">{`${t('encodedLabel')} `}<span className="font-mono text-[10px] sm:text-xs truncate block" title={entry.qrValue}>{entry.qrValue}</span></p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">{`${t('generatedLabel')} ${new Date(entry.timestamp).toLocaleString()}`}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={`${t('settingsSummary.fg')} ${entry.fgColor}, ${t('settingsSummary.bg')} ${entry.bgColor}, ${t('settingsSummary.size')} ${entry.size}px, ${t('settingsSummary.level')} ${entry.level}, ${t('settingsSummary.margin')} ${entry.margin}${entry.logoDataUri && (entry.enableLogoCustomization ?? false) ? `, Logo: Yes (Size: ${ (entry.logoSizeRatio || 0)*100 }%)` : ''}${entry.backgroundImage && (entry.enableBackgroundCustomization ?? false) ? `, ${t('settingsSummary.bgImageYes')}` : ''}${entry.selectedFrameType && entry.selectedFrameType !== 'none' && (entry.enableFrameCustomization ?? false) ? `, ${t('settingsSummary.frameYes')}`:''}`}>
                                    {t('settingsSummary.fg')} {entry.fgColor}, {t('settingsSummary.bg')} {entry.bgColor}, {t('settingsSummary.size')} {entry.size}px, {t('settingsSummary.level')} ${entry.level}, {t('settingsSummary.margin')} ${entry.margin}
                                    {entry.logoDataUri && (entry.enableLogoCustomization ?? false) && `, ${t('settingsSummary.logoYes')}`}
                                    {entry.backgroundImage && (entry.enableBackgroundCustomization ?? false) && `, ${t('settingsSummary.bgImageYes')}`}
                                    {entry.selectedFrameType && entry.selectedFrameType !== 'none' && (entry.enableFrameCustomization ?? false) && `, ${t('settingsSummary.frameYes')}`}
                                  </p>
                                </div>
                                <Button variant="ghost" size={isMobile ? "icon" : "sm"} className={`${isMobile ? 'h-8 w-8' : 'self-center'} shrink-0 text-primary hover:shadow-primary-glow focus:shadow-primary-glow hover:border-primary focus:border-primary`} onClick={() => loadFromHistory(entry)}>
                                  <RefreshCw className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4 mr-1'} animate-text-glow-primary`} /> {!isMobile && t('reuse.button')}
                                </Button>
                              </div>
                            </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
              ) : (
                  <div className="text-center py-8 sm:py-10 flex-grow flex flex-col justify-center items-center">
                    <HistoryIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4 animate-text-glow-primary" />
                    <p className="text-sm sm:text-base text-muted-foreground">{t('history.empty.title')}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('history.empty.description')}</p>
                  </div>
              )}
            </div>
            <SheetClose asChild className="mt-auto shrink-0 p-4 border-t">
              <Button variant="outline" className="w-full h-9">{t('scannerDialog.close.button')}</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </>
  );
}