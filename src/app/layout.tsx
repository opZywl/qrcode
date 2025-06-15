
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// The i18n instance is initialized by client components that import it.
// Removing the direct import here to prevent server-side execution of client-specific i18n logic.

export const metadata: Metadata = {
  title: 'QRCODE YZY', // This will be static or handled differently by full i18n routing
  description: 'Gerador de código QR minimalista com URLs personalizadas.', // Same as above
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
