import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "connect3",
  description: "connect3 - AI-powered knowledge assistant",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="facebook-sdk-init"
          strategy="beforeInteractive"
        >
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}',
                cookie: true,
                xfbml: true,
                version: 'v21.0'
              });
            };
          `}
        </Script>
        <Script
          id="facebook-sdk"
          strategy="lazyOnload"
          src="https://connect.facebook.net/en_US/sdk.js"
        />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <AuthInitializer />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
