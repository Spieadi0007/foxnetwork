'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Decorative floating dots
const FloatingDot = ({ color, delay, top, left, size = 8 }: any) => (
  <motion.div
    className={`absolute rounded-full ${color}`}
    style={{
      width: size,
      height: size,
      top,
      left
    }}
    initial={{ opacity: 0.4 }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.4, 0.8, 0.4],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
)

export function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-white pt-32 pb-20 min-h-[calc(100vh-4rem)]">
      {/* Simple decorative dots */}
      <FloatingDot color="bg-coral-400" top="20%" left="10%" delay={0} />
      <FloatingDot color="bg-mint-400" top="30%" left="85%" delay={0.5} />
      <FloatingDot color="bg-lavender-400" top="75%" left="15%" delay={1} size={12} />
      <FloatingDot color="bg-peach-400" top="65%" left="80%" delay={1.5} size={10} />
      <FloatingDot color="bg-mint-300" top="45%" left="5%" delay={2} size={6} />
      <FloatingDot color="bg-coral-300" top="85%" left="90%" delay={2.5} size={8} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading with highlighted word */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-gray-300">Transform your global</span>
            <br />
            <span className="text-foreground">operations with </span>
            <span className="bg-gradient-to-r from-mint-500 via-mint-400 to-peach-400 bg-clip-text text-transparent">
              Fox Network
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-600 mb-4 max-w-2xl mx-auto"
          >
            The unified platform connecting clients, partners, and field services.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Streamline workflows, boost efficiency, scale globally.
          </motion.p>

          {/* Social proof - Customer avatars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-200 to-lavender-200 border-2 border-white flex items-center justify-center text-sm font-semibold text-gray-700"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              500+ Happy customers
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="group px-8 h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90 rounded-lg shadow-sm"
              >
                <ArrowRight className="mr-2 w-4 h-4" />
                Get Started
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 text-base font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              View Demo
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
