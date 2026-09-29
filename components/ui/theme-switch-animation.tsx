"use client"

import { AnimatePresence, m } from "framer-motion"

interface ThemeSwitchAnimationProps {
  isAnimating: boolean
  theme: "light" | "dark"
}

export function ThemeSwitchAnimation({ isAnimating, theme }: ThemeSwitchAnimationProps) {
  return (
    <AnimatePresence>
      {isAnimating && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-9999 overflow-hidden pointer-events-none"
          style={{ background: theme === "dark" ? "#110f10" : "#fdfdfd" }}
        >
          <span
            aria-hidden
            className="block h-full w-full"
            style={{
              animation: "scale 1.5s",
              background: theme === "dark" ? "#110f10" : "#fdfdfd",
              WebkitMaskImage: "url(/portfolio/images/theL.webp)",
              maskImage: "url(/portfolio/images/theL.webp)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "0vmax",
              maskSize: "0vmax",
            }}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}
