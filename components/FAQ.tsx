"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How accurate is the AI?",
    answer: "Our AI achieves 95%+ accuracy in extracting action items and summaries. It uses advanced natural language processing to understand context, identify tasks, and assign them correctly.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your meeting recordings are processed securely and can be deleted at any time. We're SOC 2 compliant and never share your data with third parties.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! There are no long-term contracts. You can cancel your subscription at any time from your account settings. Your data will remain accessible for 30 days after cancellation.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No installation required! Our platform is 100% web-based. Simply upload your meeting recordings through your browser and get instant results. Works on any device.",
  },
  {
    question: "What file formats are supported?",
    answer: "We support all major audio and video formats including MP3, WAV, MP4, MOV, AVI, and more. Files up to 2GB are supported on the free plan, and unlimited on Pro.",
  },
  {
    question: "How long does processing take?",
    answer: "Most meetings are processed in 2-5 minutes, depending on length. You'll receive an email notification when your meeting is ready, and can view results in real-time as they're generated.",
  },
  {
    question: "Can I integrate with other tools?",
    answer: "Yes! We offer integrations with popular tools like Slack, Microsoft Teams, Google Calendar, Asana, and more. API access is available on Pro plans for custom integrations.",
  },
  {
    question: "What languages are supported?",
    answer: "Currently, we support English with 95%+ accuracy. Support for Spanish, French, German, and other languages is coming soon. Join our waitlist to be notified when new languages launch.",
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-lg pr-4">{faq.question}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-purple-400 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-blue-950/5 to-background" />
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
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">FAQ</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Frequently Asked Questions
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our AI Meeting Action Tracker
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>

        {/* Still have questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-4">
            Still have questions?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 glass rounded-full font-semibold hover:bg-white/10 transition-colors"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
