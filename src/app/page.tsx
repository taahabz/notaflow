"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FiEdit3, FiCalendar, FiUsers, FiArrowRight, FiMenu, FiX, FiLock, FiShield, FiSettings } from "react-icons/fi"

export default function Home() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appTitle, setAppTitle] = useState("Notaflow")
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    // Load title from localStorage
    const savedTitle = localStorage.getItem("header_title")
    if (savedTitle) {
      setAppTitle(savedTitle)
      // Also update the document title
      document.title = savedTitle
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/notepage")
    })
  }, [router])

  const features = [
    {
      icon: <FiShield size={28} />,
      title: "Client-Side Encryption",
      description: "Your data is encrypted before it leaves your device.",
    },
    {
      icon: <FiSettings size={28} />,
      title: "Customizable Themes",
      description: "Multiple color schemes to match your preferences.",
    },
    {
      icon: <FiEdit3 size={28} />,
      title: "Rich Text Editing",
      description: "Format your notes exactly as you imagine them.",
    },
    {
      icon: <FiUsers size={28} />,
      title: "Cross-Device Sync",
      description: "Access your notes from any device securely.",
    },
    {
      icon: <FiCalendar size={28} />,
      title: "Organization Tools",
      description: "Categorize and pin important notes for quick access.",
    },
    {
      icon: <FiLock size={28} />,
      title: "Privacy Focused",
      description: "No tracking, no ads - your notes remain truly yours.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center"
        >
          <span className="text-2xl font-semibold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
            {appTitle}
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-10"
        >
          {["Features", "Privacy"].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-lg text-gray-600 hover:text-amber-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/login")}
            className="text-lg text-gray-600 hover:text-amber-600 transition-colors"
          >
            Log in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/signup")}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Mobile menu button */}
        <motion.div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="md:hidden px-6 py-6 space-y-5 bg-white border-b border-gray-100 shadow-md"
        >
          <a
            href="#features"
            className="block text-xl text-gray-600 py-2 hover:text-amber-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#privacy"
            className="block text-xl text-gray-600 py-2 hover:text-amber-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </a>
          <button
            onClick={() => {
              router.push("/login")
              setMobileMenuOpen(false)
            }}
            className="block w-full text-left text-xl text-gray-600 py-2 hover:text-amber-600 transition-colors"
          >
            Log in
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              router.push("/signup")
              setMobileMenuOpen(false)
            }}
            className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg text-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </motion.button>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="md:w-1/2"
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your digital{" "}
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                sanctuary
              </span>{" "}
              for thoughts
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Capture ideas and organize projects with simplicity and security.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start now <FiArrowRight className="ml-2 inline" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/login")}
                className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-8 py-4 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Explore demo
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="md:w-1/2"
          >
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
              <div className="p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-2 text-sm text-gray-400">Notaflow</div>
                </div>
                <div className="py-6">
                  <div className="text-2xl font-medium text-gray-800 mb-4">Personal Journal</div>
                  <div className="space-y-4">
                    {[
                      { icon: <FiEdit3 size={22} />, title: "Creative Writing Ideas", date: "Updated 2 mins ago" },
                      { icon: <FiCalendar size={22} />, title: "Weekly Goals", date: "Updated yesterday" },
                      { icon: <FiLock size={22} />, title: "Secure Notes", date: "End-to-end encrypted" },
                    ].map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                        whileHover={{ x: 5 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-100 flex items-start shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="text-amber-600 mr-4 mt-1">{note.icon}</div>
                        <div>
                          <div className="font-medium text-lg text-gray-800">{note.title}</div>
                          <div className="text-sm text-gray-500">{note.date}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Crafted for your peace of mind
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A thoughtfully designed digital notebook with privacy at its core
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-amber-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div id="privacy" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your privacy is non-negotiable
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built with privacy as a foundational principle, not an afterthought
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-100 rounded-xl p-8 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center">
              <motion.div
                className="md:w-1/5 flex justify-center mb-8 md:mb-0"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg">
                  <FiLock size={40} />
                </div>
              </motion.div>
              <div className="md:w-4/5 md:pl-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">End-to-end encryption</h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  All your notes are encrypted before leaving your device. Not even our administrators can read your
                  private thoughts.
                </p>
                <ul className="list-disc list-inside text-gray-600 text-base space-y-2">
                  <li>Your encryption keys never leave your device</li>
                  <li>Zero knowledge architecture means we cannot access your data</li>
                  <li>Optional local-only storage for maximum privacy</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Begin your journey to better notes
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join the community of note-takers who value simplicity and security
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/signup")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-5 rounded-xl font-medium text-xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Create your secure space
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center space-x-8 mb-6">
            {/* GitHub Logo */}
            <a
              href="https://github.com/taahabz"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="GitHub Profile"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>

            {/* Portfolio Logo - Code/Developer themed */}
            <a
              href="https://taaha.site"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Portfolio Website"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </a>
          </div>
          <div className="text-gray-600 text-base">Notaflow © {new Date().getFullYear()} — Your thoughts, secured</div>
        </div>
      </footer>
    </div>
  )
}