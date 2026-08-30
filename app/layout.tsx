import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Oswald, Work_Sans } from 'next/font/google'
import './globals.css'

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
})

export const metadata: Metadata = {
  title: 'vintage photobooth',
  description:
    'live in 70s',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a120b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${workSans.variable} bg-background`}
    >
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
