import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "QrCode",
  description: "by Lucas Lima",
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
      <html lang="pt-br">
      <body>{children}</body>
      </html>
  )
}
