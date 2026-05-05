"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const transformations = [
  {
    before: "Messy, unstructured meetings",
    after: "Clear, organized summaries",
  },
  {
    before: "Lost action items",
    after: "Automatically extracted tasks",
  },
  {
    before: "No follow-up or tracking",
    after: "Automatic reminders & tracking",
  },
  {
    before: "Unclear ownership",
    after: "Clear task assignments",
  },
  {
    before: "Forgotten decisions",
    after: "Structured, searchable outcomes",
  },
  {
    before: "Manual note-taking",
    after: "AI-powered automation",
  },
]

export default function Solution() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-green-950/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">The Solution</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Meetings
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See the difference AI-powered meeting management makes
          </p>
        </motion.div>

        {/* Transformation Grid */}
        <div className="max-w-5xl mx-auto space-y-4">
          {transformations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="glass-card p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Before */}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  <span className="text-muted-foreground">{item.before}</span>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex justify-center">
                  <ArrowRight className="w-6 h-6 text-green-400" />
                </div>
                <div className="md:hidden flex justify-center">
                  <ArrowRight className="w-6 h-6 text-green-400 rotate-90" />
                </div>

                {/* After */}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="font-semibold">{item.after}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20"
        >
          {[
            { value: "80%", label: "Faster Task Completion" },
            { value: "100%", label: "Action Item Capture" },
            { value: "5hrs", label: "Saved Per Week" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
