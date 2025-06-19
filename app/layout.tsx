import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QrCode',
  description: 'by Lucas Lima',
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
