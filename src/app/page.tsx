'use client'

import { motion, useScroll, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiEdit3, FiCalendar, FiUsers, FiArrowRight, FiMenu, FiX, FiLock, FiShield, FiSettings } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/notepage');
    });
  }, [router]);

  const features = [
    {
      icon: <FiShield size={24} />,
      title: "Client-Side Encryption",
      description: "Your data is encrypted before it leaves your device."
    },
    {
      icon: <FiSettings size={24} />,
      title: "Customizable Themes",
      description: "Multiple color schemes to match your preferences."
    },
    {
      icon: <FiEdit3 size={24} />,
      title: "Rich Text Editing",
      description: "Format your notes exactly as you imagine them."
    },
    {
      icon: <FiUsers size={24} />,
      title: "Cross-Device Sync",
      description: "Access your notes from any device securely."
    },
    {
      icon: <FiCalendar size={24} />,
      title: "Organization Tools",
      description: "Categorize and pin important notes for quick access."
    },
    {
      icon: <FiLock size={24} />,
      title: "Privacy Focused",
      description: "No tracking, no ads - your notes remain truly yours."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Scroll progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-amber-400 z-50 origin-left" 
        style={{ scaleX }}
      />

      {/* Navbar */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center"
        >
          <span className="text-xl font-medium text-amber-600">Notaflow</span>
        </motion.div>
        
        {/* Desktop Nav */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-8"
        >
          {['Features', 'Privacy'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-600 hover:text-amber-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/login')}
            className="text-gray-600 hover:text-amber-600 transition-colors"
          >
            Log in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/signup')}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Mobile menu button */}
        <motion.div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 p-2"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="md:hidden px-6 py-4 space-y-4 bg-white border-b border-gray-100"
        >
          <a 
            href="#features" 
            className="block text-gray-600 py-2 hover:text-amber-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#privacy" 
            className="block text-gray-600 py-2 hover:text-amber-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </a>
          <button
            onClick={() => {
              router.push('/login');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left text-gray-600 py-2 hover:text-amber-600 transition-colors"
          >
            Log in
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              router.push('/signup');
              setMobileMenuOpen(false);
            }}
            className="block w-full bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
          >
            Get Started
          </motion.button>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="md:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
              Your digital <span className="text-amber-600">sanctuary</span> for thoughts
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Capture ideas and organize projects with simplicity and security.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/signup')}
                className="bg-amber-500 text-white px-6 py-3 rounded-md font-medium text-base hover:bg-amber-600 transition-colors"
              >
                Start now <FiArrowRight className="ml-2 inline" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/login')}
                className="bg-gray-100 text-gray-800 px-6 py-3 rounded-md font-medium text-base hover:bg-gray-200 transition-colors"
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
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md bg-white">
              <div className="p-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                  <div className="ml-2 text-sm text-gray-400">Notaflow</div>
                </div>
                <div className="py-4">
                  <div className="text-lg font-medium text-gray-800 mb-3">Personal Journal</div>
                  <div className="space-y-3">
                    {[
                      { icon: <FiEdit3/>, title: "Creative Writing Ideas", date: "Updated 2 mins ago" },
                      { icon: <FiCalendar/>, title: "Weekly Goals", date: "Updated yesterday" },
                      { icon: <FiLock/>, title: "Secure Notes", date: "End-to-end encrypted" },
                    ].map((note, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + (index * 0.15) }}
                        whileHover={{ x: 3 }}
                        className="p-3 rounded-md bg-amber-50 border border-amber-100 flex items-start"
                      >
                        <div className="text-amber-600 mr-3 mt-1">{note.icon}</div>
                        <div>
                          <div className="font-medium text-gray-800">{note.title}</div>
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
      <div id="features" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-medium text-gray-800 mb-4">
              Crafted for your peace of mind
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A thoughtfully designed digital notebook with privacy at its core
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="p-5 rounded-md bg-gray-50 border border-gray-100 transition-all duration-300"
              >
                <div className="text-amber-600 mb-3">{feature.icon}</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Privacy Section */}
      <div id="privacy" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-medium text-gray-800 mb-4">
              Your privacy is non-negotiable
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with privacy as a foundational principle, not an afterthought
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-100 rounded-md p-6 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center">
              <motion.div 
                className="md:w-1/5 flex justify-center mb-6 md:mb-0"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <FiLock size={32} />
                </div>
              </motion.div>
              <div className="md:w-4/5 md:pl-6">
                <h3 className="text-xl font-medium text-gray-800 mb-3">End-to-end encryption</h3>
                <p className="text-gray-600 text-base mb-4">
                  All your notes are encrypted before leaving your device. Not even our administrators can read your private thoughts.
                </p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
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
      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-medium text-gray-800 mb-4">
              Begin your journey to better notes
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the community of note-takers who value simplicity and security
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/signup')}
              className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium text-base hover:bg-amber-600 transition-colors"
            >
              Create your secure space
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-100">
  <div className="max-w-5xl mx-auto px-6 text-center">
    <div className="flex justify-center items-center space-x-6 mb-4">
      {/* GitHub Logo */}
      <a href="https://github.com/taahabz" className="text-gray-600 hover:text-gray-900 transition-colors" aria-label="GitHub Profile">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      </a>
      
      {/* Portfolio Logo - Code/Developer themed */}
      <a href="https://taaha.site" className="text-gray-600 hover:text-gray-900 transition-colors" aria-label="Portfolio Website">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
        </svg>
      </a>
    </div>
    <div className="text-gray-500 text-sm">
      Notaflow © {new Date().getFullYear()} — Your thoughts, secured
    </div>
  </div>
</footer>
    </div>
  );
}