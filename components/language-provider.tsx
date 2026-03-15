"use client"

import * as React from "react"

export type AppLanguage = "pt" | "en" | "es"

const LANGUAGE_STORAGE_KEY = "qrCodeLanguage"

interface TranslationValue {
  pt: string
  en: string
  es?: string
}

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  localeTag: string
  t: (value: TranslationValue) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const translationPairs: Array<[string, string]> = [
  ["Preparando o studio...", "Preparing the studio..."],
  ["Historico", "History"],
  ["Conteudo e estilo", "Content and style"],
  ["Abrir painel completo", "Open full panel"],
  ["Gerar QR Code", "Generate QR Code"],
  ["Gerando...", "Generating..."],
  ["Dados do QR Code", "QR code data"],
  ["Escolha o formato", "Choose the format"],
  ["Tipo de Conteudo", "Content type"],
  ["Tipo de Conteúdo", "Content type"],
  ["Personalizar aparencia", "Customize appearance"],
  ["Cores, tamanho, fundo, logo e moldura", "Colors, size, background, logo and frame"],
  ["Base do QR Code", "QR base"],
  ["Controle fino de cor, tamanho e leitura", "Fine control over colors, size and reading quality"],
  ["Cor do QR Code", "QR color"],
  ["Cor de fundo", "Background color"],
  ["Correcao de erro", "Error correction"],
  ["Correção de Erro", "Error correction"],
  ["Logo personalizado", "Custom logo"],
  ["Fundo personalizado", "Custom background"],
  ["Moldura personalizada", "Custom frame"],
  ["Templates visuais", "Visual templates"],
  ["Templates Visuais", "Visual templates"],
  ["Salvar tema", "Save theme"],
  ["Salvar tema atual", "Save current theme"],
  ["Nenhum template salvo", "No saved template"],
  ["Guarde combinacoes prontas para reutilizar o mesmo visual rapidamente.", "Save complete styles to reuse the same visual setup quickly."],
  ["Guarde estilos completos para reutilizar depois.", "Save full styles to reuse later."],
  ["Personalizar Tipos", "Customize types"],
  ["Selecionar Todos", "Select all"],
  ["Selecionar todos", "Select all"],
  ["Tipos Basicos", "Basic types"],
  ["Tipos Básicos", "Basic types"],
  ["Tipos Avancados", "Advanced types"],
  ["Tipos Avançados", "Advanced types"],
  ["Cancelar", "Cancel"],
  ["Salvar", "Save"],
  ["Scanner em tempo real com detecção automática e múltiplas câmeras", "Real-time scanner with automatic detection and multiple cameras"],
  ["Scanner em tempo real com detecao automatica e multiplas cameras", "Real-time scanner with automatic detection and multiple cameras"],
  ["Camera", "Camera"],
  ["Câmera", "Camera"],
  ["Imagem", "Image"],
  ["Frontal", "Front"],
  ["Traseira", "Rear"],
  ["Som", "Sound"],
  ["Limpar", "Clear"],
  ["Iniciando camera...", "Starting camera..."],
  ["Iniciando câmera...", "Starting camera..."],
  ["Permissao Negada", "Permission denied"],
  ["Permissão Negada", "Permission denied"],
  ["Nao foi possivel acessar a camera.", "Could not access the camera."],
  ["Não foi possível acessar a câmera.", "Could not access the camera."],
  ["Tentar Novamente", "Try again"],
  ["QR Code Detectado!", "QR code detected!"],
  ["Escaneando...", "Scanning..."],
  ["Aponte para um QR Code", "Point to a QR code"],
  ["Ultimas Deteccoes:", "Latest detections:"],
  ["Últimas Detecções:", "Latest detections:"],
  ["Ultimo QR Code Detectado:", "Last detected QR code:"],
  ["Último QR Code Detectado:", "Last detected QR code:"],
  ["Copiar", "Copy"],
  ["Baixar", "Download"],
  ["Abrir Link", "Open link"],
  ["Arraste uma imagem ou clique para selecionar", "Drag an image or click to select"],
  ["Solte a imagem aqui!", "Drop the image here!"],
  ["Formatos suportados: JPG, PNG, GIF, WebP (max. 10MB)", "Supported formats: JPG, PNG, GIF, WebP (max. 10MB)"],
  ["Formatos suportados: JPG, PNG, GIF, WebP (máx. 10MB)", "Supported formats: JPG, PNG, GIF, WebP (max. 10MB)"],
  ["Colar do Clipboard", "Paste from clipboard"],
  ["Dica:", "Tip:"],
  ["Imagem Carregada:", "Loaded image:"],
  ["Escaneando...", "Scanning..."],
  ["Imagem carregada com sucesso. Aguarde o resultado do scan...", "Image loaded successfully. Wait for the scan result..."],
  ["Conteudo do QR Code Escaneado:", "Scanned QR code content:"],
  ["Conteúdo do QR Code Escaneado:", "Scanned QR code content:"],
  ["Fechar", "Close"],
  ["Confira meu portfolio para ver mais projetos incríveis.", "Check my portfolio to see more projects."],
  ["Confira meu portfolio para ver mais projetos incriveis.", "Check my portfolio to see more projects."],
  ["Ver portfolio", "View portfolio"],
  ["Gostou do gerador? Confira meu portfólio!", "Liked the generator? Check out my portfolio!"],
  ["Portfólio do Desenvolvedor", "Developer portfolio"],
  ["Repositorio do projeto", "Project repository"],
  ["Acesse o codigo fonte completo", "Open the full source code"],
  ["Criador", "Author"],
  ["Perfil do desenvolvedor", "Developer profile"],
  ["Relatar problema", "Report issue"],
  ["Abrir uma nova issue", "Open a new issue"],
  ["URL ou Texto para Codificar", "URL or text to encode"],
  ["Digite uma URL ou qualquer texto...", "Enter a URL or any text..."],
  ["Nome da Rede (SSID)", "Network name (SSID)"],
  ["Senha", "Password"],
  ["Tipo de Seguranca", "Security type"],
  ["Tipo de Segurança", "Security type"],
  ["Selecione o tipo de seguranca", "Select the security type"],
  ["Selecione o tipo de segurança", "Select the security type"],
  ["Sem senha", "No password"],
  ["Rede oculta", "Hidden network"],
  ["Evento de dia inteiro", "All-day event"],
  ["Mensagem de Boas-Vindas / Validacao", "Welcome / validation message"],
  ["Mensagem de Boas-Vindas / Validação", "Welcome / validation message"],
  ["Cole o link de convite do grupo do WhatsApp", "Paste the WhatsApp group invite link"],
  ["Esta mensagem sera exibida junto ao QR code como instrucoes para o usuario", "This message will be shown with the QR code as instructions for the user."],
  ["Esta mensagem será exibida junto ao QR code como instruções para o usuário", "This message will be shown with the QR code as instructions for the user."],
  ["Nome do Restaurante", "Restaurant name"],
  ["Itens do Menu", "Menu items"],
  ["Informacoes de Preco", "Price information"],
  ["Informações de Preço", "Price information"],
  ["Codigo do Cupom", "Coupon code"],
  ["Código do Cupom", "Coupon code"],
  ["Tipo de Desconto", "Discount type"],
  ["Valor do Desconto", "Discount amount"],
  ["Descricao", "Description"],
  ["Descrição", "Description"],
  ["Validade", "Expiration"],
  ["Nada gerado ainda", "Nothing generated yet"],
  ["Preencha os campos, ajuste o visual e gere o QR Code para ver o preview final aqui.", "Fill out the fields, adjust the visuals and generate the QR code to see the final preview here."],
  ["Baixar QR Code", "Download QR code"],
  ["Compartilhar", "Share"],
  ["Personalizacoes visuais podem afetar a leitura. Teste o QR Code antes de publicar.", "Visual customizations can affect readability. Test the QR code before publishing."],
  ["Conteudo codificado", "Encoded content"],
  ["Mensagem de boas-vindas", "Welcome message"],
  ["Visual final com exportacao pronta em PNG e SVG.", "Final preview with export ready in PNG and SVG."],
  ["Visual final com exportação pronta em PNG e SVG.", "Final preview with export ready in PNG and SVG."],
]

const labelPairs: Array<[string, string]> = [
  ["Nome", "Name"],
  ["Sobrenome", "Last name"],
  ["Organizacao", "Organization"],
  ["Organização", "Organization"],
  ["Cargo", "Role"],
  ["Telefone", "Phone"],
  ["Website", "Website"],
  ["Endereco", "Address"],
  ["Endereço", "Address"],
  ["Cidade", "City"],
  ["Estado", "State"],
  ["Pais", "Country"],
  ["País", "Country"],
  ["Titulo", "Title"],
  ["Título", "Title"],
  ["Local", "Location"],
  ["Data de Inicio", "Start date"],
  ["Data de Início", "Start date"],
  ["Hora de Inicio", "Start time"],
  ["Hora de Início", "Start time"],
  ["Data de Fim", "End date"],
  ["Hora de Fim", "End time"],
  ["Email", "Email"],
  ["Assunto", "Subject"],
  ["Mensagem", "Message"],
  ["Latitude", "Latitude"],
  ["Longitude", "Longitude"],
  ["Numero de Telefone", "Phone number"],
  ["Número de Telefone", "Phone number"],
  ["Chave PIX", "PIX key"],
  ["Nome do Beneficiario", "Recipient name"],
  ["Nome do Beneficiário", "Recipient name"],
  ["Plataforma", "Platform"],
  ["Categoria", "Category"],
  ["Menu", "Menu"],
]

function applyPairMap(value: string, pairs: Array<[string, string]>, reverse = false) {
  return pairs.reduce((acc, [pt, en]) => acc.replaceAll(reverse ? en : pt, reverse ? pt : en), value)
}

function shouldTranslateElement(element: Element | null) {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  if (element.closest("[data-no-translate='true']")) {
    return false
  }

  if (element.matches("script, style, code, pre")) {
    return false
  }

  if (element.classList.contains("font-mono")) {
    return false
  }

  return true
}

function getLocaleTag(language: AppLanguage) {
  switch (language) {
    case "en":
      return "en-US"
    case "es":
      return "es-ES"
    case "pt":
    default:
      return "pt-BR"
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<AppLanguage>("pt")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null
    if (storedLanguage === "pt" || storedLanguage === "en" || storedLanguage === "es") {
      setLanguage(storedLanguage)
    }
  }, [])

  const localeTag = React.useMemo(() => getLocaleTag(language), [language])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = localeTag
  }, [language, localeTag, mounted])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    const reverse = language === "pt"
    const applyTranslation = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const labelTags = new Set(["LABEL", "OPTION"])
      let node = walker.nextNode()

      while (node) {
        const textNode = node as Text
        const parentElement = textNode.parentElement

        if (parentElement && shouldTranslateElement(parentElement)) {
          let nextValue = applyPairMap(textNode.nodeValue ?? "", translationPairs, reverse)

          if (labelTags.has(parentElement.tagName)) {
            nextValue = applyPairMap(nextValue, labelPairs, reverse)
          }

          if (nextValue !== textNode.nodeValue) {
            textNode.nodeValue = nextValue
          }
        }

        node = walker.nextNode()
      }

      const elements = root.querySelectorAll?.("[placeholder], [title], [aria-label]") ?? []

      elements.forEach((element) => {
        if (!(element instanceof HTMLElement) || !shouldTranslateElement(element)) {
          return
        }

        ;(["placeholder", "title", "aria-label"] as const).forEach((attributeName) => {
          const currentValue = element.getAttribute(attributeName)
          if (!currentValue) {
            return
          }

          let nextValue = applyPairMap(currentValue, translationPairs, reverse)
          nextValue = applyPairMap(nextValue, labelPairs, reverse)

          if (nextValue !== currentValue) {
            element.setAttribute(attributeName, nextValue)
          }
        })
      })
    }

    applyTranslation(document.body)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            applyTranslation(node)
          } else if (node instanceof Text && node.parentElement && shouldTranslateElement(node.parentElement)) {
            let nextValue = applyPairMap(node.nodeValue ?? "", translationPairs, reverse)
            if (node.parentElement.tagName === "LABEL" || node.parentElement.tagName === "OPTION") {
              nextValue = applyPairMap(nextValue, labelPairs, reverse)
            }
            if (nextValue !== node.nodeValue) {
              node.nodeValue = nextValue
            }
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [language, mounted])

  const t = React.useCallback(
    (value: TranslationValue) => {
      if (language === "pt") {
        return value.pt
      }

      if (language === "es") {
        return value.es ?? value.en
      }

      return value.en
    },
    [language],
  )

  const contextValue = React.useMemo(
    () => ({
      language,
      setLanguage,
      localeTag,
      t,
    }),
    [language, localeTag, t],
  )

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }

  return context
}
