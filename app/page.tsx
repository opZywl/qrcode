import { QrGenerator } from "@/components/qr-code/qr-generator"
import { PopupPortfolio } from "@/components/ui/popup-portfolio"
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: getSiteUrl(),
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  inLanguage: ["pt-BR", "en-US", "es-ES"],
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
  author: { "@type": "Person", name: "Lucas Lima", url: "https://lucas-lima.vercel.app" },
}

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen bg-transparent">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <noscript>
        <p className="p-6 text-center text-sm text-muted-foreground">
          Este gerador precisa de JavaScript habilitado. / This generator needs JavaScript enabled.
        </p>
      </noscript>
      <QrGenerator />
      <PopupPortfolio />
    </main>
  )
}
