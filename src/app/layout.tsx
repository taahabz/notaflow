import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Slab, Ubuntu, Roboto_Mono, Inter } from "next/font/google";
import "./globals.css";
import "../styles/fonts.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontProvider } from "@/contexts/FontContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load Ubuntu font
const ubuntu = Ubuntu({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ubuntu',
});

// Load Roboto Slab font
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-slab',
});

// We'll use Roboto Mono as a substitute for Cascadia Mono
const cascadiaMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cascadia-mono',
});

// We'll use Inter as a substitute for Hubot Sans
const hubotSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hubot-sans',
});

// Use Ubuntu instead of Rowdies
const rowdies = Ubuntu({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rowdies',
});

export const metadata: Metadata = {
  title: "Notaflow",
  description: "take notes, share ideas",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`
      ${geistSans.variable} 
      ${geistMono.variable} 
      ${ubuntu.variable} 
      ${robotoSlab.variable}
      ${cascadiaMono.variable}
      ${hubotSans.variable}
      ${rowdies.variable}
      antialiased
    `}>
      <body className='font-ubuntu'>
        <ThemeProvider>
          <FontProvider>
            {children}
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
