import type { Metadata, Viewport } from "next"
import { Rajdhani, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FiveM Arena Bot - Competitive Arena Manager",
  description:
    "Advanced FiveM Arena Bot with team management, configurable rounds, teleportation, and auto-revive systems for competitive gameplay.",
}

export const viewport: Viewport = {
  themeColor: "#0a0c14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
