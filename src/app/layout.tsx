import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, Ubuntu } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${ubuntu.variable} antialiased`}>
      <body className='font-ubuntu'>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
