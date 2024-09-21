import type { Metadata, Viewport } from "next"
import { Open_Sans, NTR, Poppins, IBM_Plex_Mono } from "next/font/google"
import CyaneaTheme from "@/app/components/CyaneaTheme"
import Navbar from "@/app/components/Navbar"
import "@/app/styles/globals.css"

export const metadata: Metadata = {
  title: "Cyanea CMS",
  description: "the pinnacle of the cyanea trinity",
  robots: "noindex, nofollow",
}

export const viewport: Viewport = {
  themeColor: "#ffba44",
}

const open_sans = Open_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--open-sans",
})
const ntr = NTR({ weight: "400", subsets: ["latin"], variable: "--ntr" })
const poppins = Poppins({ weight: "700", subsets: ["latin"], variable: "--poppins" })
const ibm_plex_mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"], variable: "--ibm-plex-mono" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${open_sans.variable} ${ntr.variable} ${poppins.variable} ${ibm_plex_mono.variable}`}>
        <CyaneaTheme>
          <Navbar />
          {children}
        </CyaneaTheme>
      </body>
    </html>
  )
}
