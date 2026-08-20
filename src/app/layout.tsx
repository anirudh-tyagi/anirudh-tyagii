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
      <head>
        {/*
          Runs before the document finishes loading, which is the whole
          point. The browser restores the previous scroll position and
          jumps to any URL fragment during load, well before React
          hydrates, so doing this from an effect is always too late: the
          page visibly lands mid-document and then gets yanked back up.
          Disabling restoration and dropping the fragment here means the
          jump never happens in the first place.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
if('scrollRestoration' in history){history.scrollRestoration='manual';}
if(location.hash){history.replaceState(null,'',location.pathname+location.search);}
}catch(e){}})();`,
          }}
        />
      </head>
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
