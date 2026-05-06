"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "VP of Product",
    company: "Velocity Labs",
    image: "SM",
    content: "We were drowning in post-meeting follow-ups. MeetRix Action cut our meeting-to-execution time from 3 days to 3 hours. Our sprint velocity increased 40% in the first month.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Head of Engineering",
    company: "Streamline AI",
    image: "DP",
    content: "I was skeptical about another 'AI tool', but this actually delivers. It caught 12 action items in our last standup that I completely missed. Now nothing falls through the cracks.",
    rating: 5,
  },
  {
    name: "Jessica Torres",
    role: "Director of Operations",
    company: "BuildRight Co",
    image: "JT",
    content: "Before MeetRix, 60% of our meeting decisions never got executed. Now we have a 94% task completion rate. The ROI paid for itself in week two.",
    rating: 5,
  },
]

const stats = [
  { value: "10K+", label: "Meetings Processed" },
  { value: "500+", label: "Happy Teams" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "5hrs", label: "Avg. Time Saved/Week" },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
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
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">Loved by Teams</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            What Our Users Say
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of teams who have transformed their meeting productivity
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-purple-400/20 absolute top-6 right-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.6 + index * 0.1,
              }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
