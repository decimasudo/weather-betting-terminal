import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashWrapper } from "@/components/splash-wrapper";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
});

export const metadata: Metadata = {
  title: "Weath3rBet | CHANI Terminal",
  description: "Climate Intelligence AI - Weather Betting Terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${shareTechMono.variable} antialiased font-share-tech`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <SplashWrapper>
            {children}
          </SplashWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}