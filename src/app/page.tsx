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
      icon: <FiShield size={28} />,
      title: "Client-Side Encryption",
      description: "Your data is encrypted before it leaves your device, ensuring only you can access your private notes."
    },
    {
      icon: <FiSettings size={28} />,
      title: "Customizable Themes",
      description: "Multiple color schemes to match your style preference and reduce eye strain."
    },
    {
      icon: <FiEdit3 size={28} />,
      title: "Rich Text Editing",
      description: "Format your notes with bold, italic, lists, and more to capture ideas exactly as you imagine them."
    },
    {
      icon: <FiUsers size={28} />,
      title: "Cross-Device Sync",
      description: "Access your notes from any device while maintaining end-to-end encryption."
    },
    {
      icon: <FiCalendar size={28} />,
      title: "Organization Tools",
      description: "Categorize and pin important notes for quick access when you need them most."
    },
    {
      icon: <FiLock size={28} />,
      title: "Privacy Focused",
      description: "No tracking, no ads, no data mining - your notes remain truly yours."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 scroll-smooth">
      {/* Scroll progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 z-50 origin-left" 
        style={{ scaleX }}
      />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex items-center"
        >
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">Notaflow</span>
        </motion.div>
        
        {/* Desktop Nav */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center space-x-8"
        >
          {['Features', 'Privacy'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 transition"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login')}
            className="text-gray-600 dark:text-gray-300 hover:text-amber-600 transition"
          >
            Log in
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/signup')}
            className="bg-amber-600 dark:bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition shadow-md hover:shadow-lg"
          >
            Get Started Free
          </motion.button>
        </motion.div>

        {/* Mobile menu button */}
        <motion.div 
          className="md:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 p-2"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </motion.div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20 }}
          className="md:hidden px-4 pt-2 pb-4 space-y-4 bg-white dark:bg-gray-800 shadow-lg"
        >
          <a 
            href="#features" 
            className="block text-gray-600 dark:text-gray-300 py-2 hover:text-amber-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#privacy" 
            className="block text-gray-600 dark:text-gray-300 py-2 hover:text-amber-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Privacy
          </a>
          <button
            onClick={() => {
              router.push('/login');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left text-gray-600 dark:text-gray-300 py-2 hover:text-amber-600 transition"
          >
            Log in
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              router.push('/signup');
              setMobileMenuOpen(false);
            }}
            className="block w-full bg-amber-600 dark:bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            Get Started Free
          </motion.button>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="md:w-1/2 mb-12 md:mb-0"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Your digital <span className="text-amber-600 dark:text-amber-500">sanctuary</span> for thoughts
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Capture ideas, organize projects, and secure your thoughts with end-to-end encryption. Your personal space for clarity and creativity.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -10px rgba(245, 158, 11, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/signup')}
                className="bg-amber-600 dark:bg-amber-500 text-white px-6 py-3 rounded-lg font-medium text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition flex items-center justify-center shadow-lg"
              >
                Start now <FiArrowRight className="ml-2" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/login')}
                className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg font-medium text-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition shadow-md"
              >
                Explore demo
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="md:w-1/2"
          >
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800">
              {/* Note-taking illustration */}
              <div className="p-5">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">Notaflow</div>
                </div>
                <div className="py-4">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Personal Journal</div>
                  <div className="space-y-3">
                    {[
                      { icon: <FiEdit3/>, title: "Creative Writing Ideas", date: "Updated 2 mins ago" },
                      { icon: <FiCalendar/>, title: "Weekly Goals", date: "Updated yesterday" },
                      { icon: <FiLock/>, title: "Secure Notes", date: "End-to-end encrypted" },
                    ].map((note, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (index * 0.2) }}
                        whileHover={{ x: 5 }}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 flex items-start"
                      >
                        <div className="text-amber-600 dark:text-amber-500 mr-3 mt-1">{note.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{note.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{note.date}</div>
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
      <div id="features" className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Crafted for your peace of mind
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A thoughtfully designed digital notebook with privacy and security at its core
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <div className="text-amber-600 dark:text-amber-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Privacy Section */}
      <div id="privacy" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your privacy is non-negotiable
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We've built Notaflow with privacy as a foundational principle, not an afterthought
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-8 mb-12 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-center">
              <motion.div 
                className="md:w-1/4 flex justify-center mb-6 md:mb-0"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring' }}
              >
                <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                  <FiLock size={48} />
                </div>
              </motion.div>
              <div className="md:w-3/4 md:pl-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">End-to-end encryption</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All your notes are encrypted before leaving your device, using state-of-the-art cryptography. Not even our server administrators can read your private thoughts.
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
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
      <div className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Begin your journey to better notes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the community of note-takers who value both simplicity and security
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -10px rgba(245, 158, 11, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/signup')}
              className="bg-amber-600 dark:bg-amber-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition shadow-xl"
            >
              Create your secure space
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}