// app/login/page.tsx
'use client'

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in, redirect to notes page if they are
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/notepage');
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl shadow-lg overflow-hidden bg-[rgb(var(--secondary))] border border-[rgb(var(--border))]"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-[rgb(var(--accent))] rounded-full flex items-center justify-center text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center text-[rgb(var(--foreground))] mb-6"
          >
            Welcome to Notaflow
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-[rgb(var(--foreground))] opacity-70 mb-6"
          >
            A clean, simple note-taking app inspired by Apple Notes
          </motion.p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/login')}
              className="w-full bg-[rgb(var(--accent))] text-black py-3 px-4 rounded-lg font-medium hover:bg-[rgb(var(--accent-hover))] transition"
            >
              Sign In
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/signup')}
              className="w-full border border-[rgb(var(--border))] py-3 px-4 rounded-lg font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary-hover))] transition"
            >
              Create Account
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}