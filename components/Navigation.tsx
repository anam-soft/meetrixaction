"use client"

import { motion, useScroll } from "framer-motion"
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border-b border-white/10 shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.a
              href="/"
              className="text-2xl font-semibold gradient-text"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              MeetRix Action
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isSignedIn ? (
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </motion.button>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 text-sm font-semibold text-foreground hover:text-purple-400 transition-colors"
                    >
                      Sign in
                    </motion.button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                    >
                      Start free
                    </motion.button>
                  </SignUpButton>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? "auto" : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 left-0 right-0 z-40 md:hidden overflow-hidden bg-background/95 backdrop-blur-lg border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 space-y-3">
            {isSignedIn ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="w-full px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/5 rounded-lg transition-colors">
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold shadow-lg shadow-purple-500/30">
                    Start free
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-20" />
    </>
  )
}
