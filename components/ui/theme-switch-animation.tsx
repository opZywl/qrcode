"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ThemeSwitchAnimationProps {
  isAnimating: boolean
  theme: "light" | "dark"
}

export function ThemeSwitchAnimation({ isAnimating, theme }: ThemeSwitchAnimationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isAnimating) return
    setShow(true)
    const id = window.setTimeout(() => setShow(false), 1500)
    return () => window.clearTimeout(id)
  }, [isAnimating])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
          style={{ background: theme === "dark" ? "#110f10" : "#fdfdfd" }}
        >
          <span
            aria-hidden
            className="block h-full w-full"
            style={{
              animation: "scale 1.5s",
              background: theme === "dark" ? "#110f10" : "#fdfdfd",
              WebkitMaskImage: "url(/portfolio/images/theL.gif)",
              maskImage: "url(/portfolio/images/theL.gif)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "0vmax",
              maskSize: "0vmax",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
