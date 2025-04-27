// app/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/notepage');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/notepage');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) setError(error.message);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  
    if (error) {
      setError(error.message);
      console.error('Google Auth Error:', error);
    }
    
    setIsLoading(false);
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${location.origin}/reset`,
    });
    setIsLoading(false);
    if (error) setError(error.message);
    else setError('If the email exists, a reset link has been sent.');
  };

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
            {isResettingPassword ? 'Reset Password' : 'Welcome to Notaflow'}
          </motion.h1>

          {isResettingPassword ? (
            <motion.form 
              onSubmit={handlePasswordReset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-[rgb(var(--foreground))] opacity-60" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none transition"
                />
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[rgb(var(--accent))] text-black py-3 px-4 rounded-lg font-medium hover:bg-[rgb(var(--accent-hover))] transition flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send Reset Link'}
              </motion.button>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
              
              <div className="text-center text-sm text-[rgb(var(--foreground))] opacity-70 mt-4">
                <button 
                  onClick={() => setIsResettingPassword(false)}
                  className="text-[rgb(var(--accent))] hover:underline focus:outline-none"
                >
                  Back to login
                </button>
              </div>
            </motion.form>
          ) : (
            <>
              <motion.form 
                onSubmit={handleLogin}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-[rgb(var(--foreground))] opacity-60" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none transition"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-[rgb(var(--foreground))] opacity-60" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-[rgb(var(--accent))] outline-none transition"
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsResettingPassword(true)}
                    type="button"
                    className="text-sm text-[rgb(var(--accent))] hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[rgb(var(--accent))] text-black py-3 px-4 rounded-lg font-medium hover:bg-[rgb(var(--accent-hover))] transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Sign In <FiArrowRight className="ml-2" />
                    </>
                  )}
                </motion.button>
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.form>
              
              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgb(var(--border))]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] opacity-70">Or continue with</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full border border-[rgb(var(--border))] py-3 px-4 rounded-lg font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary-hover))] transition flex items-center justify-center"
              >
                <FaGoogle className="mr-2 text-red-500" /> Google
              </motion.button>
              
              <div className="text-center text-sm text-[rgb(var(--foreground))] opacity-70 mt-6">
                Don't have an account?{' '}
                <button 
                  onClick={() => router.push('/signup')}
                  className="text-[rgb(var(--accent))] font-medium hover:underline focus:outline-none"
                >
                  Sign up
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}