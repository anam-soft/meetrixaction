"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Code2, Palette, Rocket, Globe, Lock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Code2,
    title: "Modern Development",
    description: "Built with Next.js 14, React 18, and TypeScript for type-safe, scalable applications.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description: "Stunning UI components with Tailwind CSS and smooth Framer Motion animations.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    title: "Blazing Fast",
    description: "Optimized performance with server components, edge runtime, and smart caching.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Deploy worldwide with edge networks for lightning-fast load times everywhere.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Built-in authentication, authorization, and security best practices out of the box.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Developer Experience",
    description: "Hot reload, TypeScript support, and modern tooling for maximum productivity.",
    gradient: "from-yellow-500 to-orange-500",
  },
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
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
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Powerful Features</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need
            <br />
            <span className="gradient-text">To Build Better</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit with all the features and tools you need to create
            exceptional digital experiences.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="glass-card p-8 h-full hover:bg-white/[0.05] transition-all duration-300">
                {/* Icon with Gradient Background */}
                <div className="relative mb-6">
                  <motion.div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity",
                      feature.gradient
                    )}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <div
                    className={cn(
                      "relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                      feature.gradient
                    )}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 group-hover:gradient-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 blur-sm",
                      feature.gradient
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-shadow"
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
