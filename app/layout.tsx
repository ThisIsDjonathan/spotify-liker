import type React from "react";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedBackground } from "@/components/animated-background";
import Footer from "@/components/footer";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "Spotify Liker",
  description: "Like all songs in your Spotify playlists with one click",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className="font-sans bg-black text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AnimatedBackground />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}

import "./globals.css";
