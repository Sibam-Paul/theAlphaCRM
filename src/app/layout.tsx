import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/sonner" 

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

// 1. METADATA: Handles SEO, Manifest, and App Links
export const metadata: Metadata = {
  title: 'CRM',
  description: 'CRM Dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CRM Tao',
  },
  icons: {
    icon:'/favicon.png', 
    apple: '/favicon.png' , 
  }, 
}

// 2. VIEWPORT: Handles Theme Color and Scaling (Must be separate)
export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Enable zoom for accessibility (WCAG compliance)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background`}>
       <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}