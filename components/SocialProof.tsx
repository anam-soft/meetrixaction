"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star } from "lucide-react"

const avatars = [
  { initials: "JD", color: "from-blue-500 to-cyan-500" },
  { initials: "SM", color: "from-purple-500 to-pink-500" },
  { initials: "AR", color: "from-green-500 to-emerald-500" },
  { initials: "MK", color: "from-orange-500 to-red-500" },
  { initials: "LC", color: "from-yellow-500 to-orange-500" },
]

export default function SocialProof() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
        >
          {/* Avatar Stack */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <motion.div
                  key={avatar.initials}
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center font-bold text-sm border-2 border-background shadow-lg cursor-pointer`}
                >
                  {avatar.initials}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Text and Rating */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center md:text-left"
          >
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: 0.5 + i * 0.05,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
              <span className="text-sm font-semibold text-muted-foreground ml-1">
                4.9/5
              </span>
            </div>
            <p className="text-lg font-medium text-foreground">
              Trusted by{" "}
              <span className="gradient-text font-bold">500+ teams</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
