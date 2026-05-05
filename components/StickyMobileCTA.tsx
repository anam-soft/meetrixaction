"use client"

import { motion, AnimatePresence } from "framer-motion"
import { SignUpButton } from "@clerk/nextjs"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 100vh
      setIsVisible(window.scrollY > window.innerHeight)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        >
          <SignUpButton mode="modal">
            <button className="w-full group px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow">
              <span className="flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </SignUpButton>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
