import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata = {
  title: "AI Meeting Action Tracker | Turn Meetings Into Completed Work",
  description: "Extract action items, assign tasks, and never lose track again. AI-powered meeting management that actually works. Start free with 5 meetings per month.",
  keywords: ["meeting management", "AI meeting assistant", "action items", "task tracking", "meeting notes", "productivity tool"],
  authors: [{ name: "AI Meeting Action Tracker" }],
  openGraph: {
    title: "AI Meeting Action Tracker | Turn Meetings Into Completed Work",
    description: "Extract action items, assign tasks, and never lose track again. AI-powered meeting management that actually works.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Meeting Action Tracker | Turn Meetings Into Completed Work",
    description: "Extract action items, assign tasks, and never lose track again. AI-powered meeting management that actually works.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
