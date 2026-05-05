"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Sparkles, CheckSquare, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Meeting",
    description: "Upload your meeting recording in any format - audio or video",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Extracts Tasks",
    description: "Get summaries, action items, and key decisions instantly",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: CheckSquare,
    title: "Track Execution",
    description: "Assign, track, and complete tasks with automatic reminders",
    color: "from-green-500 to-emerald-500",
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/5 to-background" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Simple Process</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            How It Works
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your meetings into actionable results
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.2,
                  }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-8 h-full relative z-10"
                >
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-white/5 absolute top-4 right-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-50`}
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    />
                    <div
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 z-20">
                    <ArrowRight className="w-8 h-8 text-purple-400" />
                  </div>
                )}

                {/* Arrow (mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-8 h-8 text-purple-400 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Ready to see it in action?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow"
          >
            Try It Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
