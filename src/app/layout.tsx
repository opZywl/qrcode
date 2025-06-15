import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: 'QRCODE YZY',
    description: 'Gerador de código QR minimalista com URLs personalizadas.',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className="font-body antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
        </body>
        </html>
    );
}