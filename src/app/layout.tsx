import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anirudh | Developer Portfolio",
  description: "Welcome to my corner of the internet. I share my work, ideas, experiments, and the things I enjoy beyond code.",
  keywords: ["developer", "portfolio", "software engineer", "web development", "Anirudh"],
  authors: [{ name: "Anirudh" }],
  openGraph: {
    title: "Anirudh | Developer Portfolio",
    description: "Welcome to my corner of the internet. I share my work, ideas, experiments, and the things I enjoy beyond code.",
    type: "website",
  },
};

import Background from "@/components/Background";
import DockNav from "@/components/DockNav";
import CatChat from "@/components/CatChat";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <a href="#home" className="skip-link">Skip to content</a>
        <SmoothScroll />
        <Background />
        <DockNav />
        <CatChat />
        {children}
      </body>
    </html>
  );
}
