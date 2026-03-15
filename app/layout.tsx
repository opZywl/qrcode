import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "@/components/theme-script"
import "./globals.css"

const glancyr = localFont({
  src: "../public/fonts/glancyr.ttf",
  variable: "--font-glancyr",
  display: "swap",
})

const glancyr700 = localFont({
  src: "../public/fonts/glancyr700.ttf",
  variable: "--font-glancyr700",
  display: "swap",
})

const spaceGrotesk = localFont({
  src: "../public/fonts/spaceGroteskVariable.woff2",
  variable: "--font-spaceGrotesk",
  display: "swap",
})

export const metadata: Metadata = {
  title: "QR Code Studio",
  description: "Create polished QR codes in seconds.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${spaceGrotesk.variable} ${glancyr.variable} ${glancyr700.variable} font-spaceGrotesk`}>
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
