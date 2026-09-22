import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PHOTO FAKER — High-End Editorial & Fotomontagen",
  description:
    "KI-Fotostudio & biometrisch exakte Fotomontagen mit InstantID (DSGVO Zero-Retention)",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${plusJakartaSans.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#121317] text-[#f4f4f5]">
        {children}
      </body>
    </html>
  );
}
