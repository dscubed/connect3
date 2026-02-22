import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { FingerprintInitializer } from "@/components/auth/FingerprintInitializer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Connect3",
  description: "Connect3 - AI-powered knowledge assistant",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Use "cover" to extend content to the screen edges
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthInitializer />
        <FingerprintInitializer />
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
