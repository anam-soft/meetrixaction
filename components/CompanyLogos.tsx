"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const companies = [
  { name: "Shopify", logo: "Shopify" },
  { name: "Atlassian", logo: "Atlassian" },
  { name: "Dropbox", logo: "Dropbox" },
  { name: "Slack", logo: "Slack" },
  { name: "Zoom", logo: "Zoom" },
  { name: "Asana", logo: "Asana" },
]

export default function CompanyLogos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-16 overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted by teams at companies like
          </p>
        </motion.div>

        {/* Company Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center max-w-6xl mx-auto">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center"
            >
              <div className="group relative">
                {/* Logo placeholder - using initials in a styled box */}
                <div className="w-32 h-16 flex items-center justify-center glass-card rounded-lg transition-all group-hover:border-purple-500/30">
                  <div className="text-center">
                    <div className="text-lg font-bold text-muted-foreground group-hover:gradient-text transition-all">
                      {company.logo}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">2,500+ teams</span> who have transformed their meeting productivity
          </p>
        </motion.div>
      </div>
    </section>
  )
}
