import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";
import { TopBar } from "@/components/top-bar/top-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Study Buddy",
  description:
    "Your AI-powered study assistant. Get homework help, exam prep, and learning support anytime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}  antialiased `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopBar />
          {/* top margin to account for the top bar & bottom margin for the bottom navigation */}
          <div className="mt-16 mb-16">{children}</div>
          <BottomNavigation />
        </ThemeProvider>
      </body>
    </html>
  );
}
