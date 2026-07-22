import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School Support Atlas | Welfare Support for Schools and Madrasas",
  description:
    "Explore verified Nigerian schools and madrasas in need, sponsor specific needs, and send sponsor requests to admin.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/logo_school.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-950">
        <ReactQueryProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
