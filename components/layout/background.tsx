"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { GridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[#f6f8fb]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.98),rgba(240,245,250,0.92)_42%,rgba(246,248,251,1)_100%)]" />
        <div className="relative size-full overflow-hidden">
          <Image
            src="/portfolio/images/elipse.svg"
            alt=""
            width={1080}
            height={1080}
            className="absolute inset-0 size-full object-cover opacity-90 lg:object-fill"
            unoptimized
            draggable={false}
            priority
          />
          <Image
            src="/portfolio/images/bigCloud.png"
            alt=""
            width={1495}
            height={521}
            className="absolute bottom-[-4vh] left-1/2 h-[36vh] w-[120vw] max-w-none -translate-x-1/2 object-cover lg:bottom-[-18vh] lg:h-[55vh] lg:object-contain"
            unoptimized
            draggable={false}
          />
          <motion.div
            className="absolute -left-[4vw] top-[14vh] w-[58vw] max-w-[687px]"
            animate={{ x: [0, 14, 0], y: [0, -7, 0] }}
            transition={{ duration: 16, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          >
            <Image
              src="/portfolio/images/cloudCrop.png"
              alt=""
              width={688}
              height={721}
              className="h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>
          <motion.div
            className="absolute -left-20 top-[68vh] z-10 w-[70vw] max-w-[497px] lg:left-auto lg:right-[-1vw] lg:top-20"
            animate={{ x: [0, -14, 0], y: [0, 9, 0] }}
            transition={{ duration: 18, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          >
            <Image
              src="/portfolio/images/cloud.png"
              alt=""
              width={497}
              height={246}
              className="h-auto w-full object-contain"
              unoptimized
              draggable={false}
            />
          </motion.div>
          <motion.div
            className="absolute left-14 top-[10vh] z-10 w-[70vw] max-w-[497px] lg:top-0"
            animate={{ x: [0, 9, 0], y: [0, -5, 0] }}
            transition={{ duration: 14, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, delay: 1.2 }}
          >
            <Image
              src="/portfolio/images/cloud.png"
              alt=""
              width={497}
              height={246}
              className="h-auto w-full object-contain"
              unoptimized
              draggable={false}
            />
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-0 h-[160px] w-[115vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 lg:h-[720px]"
            animate={{ scale: [0.96, 1.05, 0.96], opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 10, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
            style={{
              borderRadius: "100%",
              mixBlendMode: "plus-lighter",
              filter: "blur(180px)",
              background: "rgba(255,255,255,0.95)",
            }}
          />
        </div>
      </div>

      <div className="absolute inset-0 hidden overflow-hidden dark:block">
        <GridPattern
          numSquares={45}
          maxOpacity={0.1}
          duration={5}
          repeatDelay={0}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] w-full",
            "inset-x-0 inset-y-[-0%] h-[105%] max-sm:h-[90%] skew-y-12",
            "dark:fill-transparent dark:stroke-black/10 dark:sm:fill-zinc-600/30 dark:sm:stroke-dark-1/40",
          )}
        />
      </div>
    </div>
  )
}

export default Background
