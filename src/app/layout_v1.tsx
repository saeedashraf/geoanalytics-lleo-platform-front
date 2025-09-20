import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GeoAnalytics Platform | Advanced NDVI Analysis',
  description: 'Professional geospatial analysis platform for NDVI monitoring, vegetation change detection, and environmental research using satellite imagery.',
  keywords: ['NDVI', 'vegetation', 'satellite imagery', 'geospatial analysis', 'environmental monitoring'],
  authors: [{ name: 'GeoAnalytics Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'GeoAnalytics Platform | Advanced NDVI Analysis',
    description: 'Professional geospatial analysis platform for NDVI monitoring and vegetation change detection.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoAnalytics Platform',
    description: 'Advanced NDVI Analysis and Vegetation Monitoring',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-100 rounded-full opacity-30 blur-3xl animate-pulse-soft" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full opacity-30 blur-3xl animate-pulse-soft" />
            </div>
            
            {/* Main content */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>

        {/* Global toast container */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
        
        {/* Global modal container */}
        <div id="modal-container" />
      </body>
    </html>
  );
}