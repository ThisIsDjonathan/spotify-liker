import type React from "react";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedBackground } from "@/components/animated-background";
import Footer from "@/components/footer";
import { AlertBanner } from "@/components/alert-banner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "DJ Spotify Liker",
  description: "Like all songs in your Spotify playlists with one click",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "DJ Spotify Liker",
    description: "Like all songs in your Spotify playlists with one click",
    url: "https://spotify-liker.vercel.app/",
    siteName: "DJ Spotify Liker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className="font-sans bg-black text-white min-h-screen flex flex-col">
        <AlertBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AnimatedBackground />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}

import "./globals.css";
