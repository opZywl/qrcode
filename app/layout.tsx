import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import type { ReactNode } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "@/components/theme-script"
import { Toaster } from "@/components/ui/toaster"
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site"
import "./globals.css"

const glancyr700 = localFont({
  src: "../public/fonts/glancyr700.woff2",
  variable: "--font-face-glancyr700",
  display: "swap",
})

const spaceGrotesk = localFont({
  src: "../public/fonts/spaceGroteskVariable.woff2",
  variable: "--font-face-space-grotesk",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Lucas Lima", url: "https://lucas-lima.vercel.app" }],
  creator: "Lucas Lima",
  keywords: ["QR Code", "gerador de QR Code", "QR Code PIX", "QR Code Wi-Fi", "vCard", "WhatsApp", "scanner de QR Code"],
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  colorScheme: "dark light",
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${spaceGrotesk.variable} ${glancyr700.variable} font-spaceGrotesk`}>
        <LanguageProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
