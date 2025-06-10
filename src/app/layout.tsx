import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import Navbar from '@/components/navbar/page';
import { DM_Sans } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans", // optional: CSS variable
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // customize as needed
});

export const metadata = {
  title: "ResumeBook",
  description: "ResumeBook by UTD SHPE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
          <Navbar/>
        <main>{children}</main>
      </body>
    </html>
  );
}
