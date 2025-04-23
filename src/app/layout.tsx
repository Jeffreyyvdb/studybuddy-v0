import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Image from "next/image";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
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
        className={`${nunito.variable} ${ptSans.variable} antialiased relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col">
            <div className="bg-white flex items-center h-18 drop-shadow px-4 z-50">
              <Image
                alt="Logo"
                className="w-44"
                height={139}
                width={780}
                src={"/images/logo.png"}
              />
            </div>
            <div className="">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
