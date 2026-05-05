"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { AlertCircle, Clock, MessageSquareOff, Users } from "lucide-react"

const problems = [
  {
    icon: MessageSquareOff,
    title: "Meetings End, Nothing Gets Done",
    description: "Action items are discussed but never tracked or executed",
    color: "text-red-400",
  },
  {
    icon: Clock,
    title: "Action Items Are Forgotten",
    description: "Important tasks slip through the cracks without follow-up",
    color: "text-orange-400",
  },
  {
    icon: Users,
    title: "No Accountability",
    description: "Unclear ownership leads to missed deadlines and confusion",
    color: "text-yellow-400",
  },
  {
    icon: AlertCircle,
    title: "Lost Decisions",
    description: "Critical decisions and context disappear after meetings",
    color: "text-purple-400",
  },
]

export default function Problem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-red-950/5 to-background" />
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
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">The Problem</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Sound Familiar?
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            You're not alone. Teams everywhere struggle with the same meeting challenges.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{ y: -8 }}
              className="glass-card p-6 text-center group cursor-pointer"
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />
                  <problem.icon className={`w-12 h-12 ${problem.color} relative z-10`} />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
