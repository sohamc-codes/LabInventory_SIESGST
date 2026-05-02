import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from '@/components/providers'
import ErrorBoundary from '@/components/error-boundary'

export const metadata: Metadata = {
  title: {
    default: 'LabInventory - Smart Inventory Management for Modern Labs',
    template: '%s | LabInventory',
  },
  description: 'Streamline your IoT component tracking with AI-powered recommendations, real-time notifications, and automated workflows. Built for educational institutions and research labs.',
  keywords: ['inventory management', 'lab management', 'IoT components', 'education', 'QR code tracking', 'asset management', 'SaaS'],
  authors: [{ name: 'LabInventory Team' }],
  creator: 'LabInventory',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'LabInventory - Smart Inventory Management for Modern Labs',
    description: 'Streamline your IoT component tracking with AI-powered recommendations, real-time notifications, and automated workflows.',
    siteName: 'LabInventory',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LabInventory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LabInventory - Smart Inventory Management',
    description: 'Modern inventory management for educational institutions',
    images: ['/og-image.png'],
    creator: '@labinventory',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}